#!/bin/bash
# ==============================================================================
# SCRIPT DE DÉPLOIEMENT - RADIOCHOUP (Next.js)
# Serveur cible : VPS Webmin/Virtualmin (radiochoup@vps-9e183003)
# Chemin app : /home/radiochoup/radiochoup (hors public_html pour la sécurité)
# Chemin web : /home/radiochoup/public_html (reverse proxy → localhost:3500)
# ==============================================================================

set -e

APP_DIR="/home/radiochoup/radiochoup"
APP_NAME="radiochoup"
PORT_APP=3500
LOG_DIR="$APP_DIR/logs"
LOG_FILE="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

AUTO_MODE=false

# Fonction de question avec défaut Oui (ignorée en mode auto)
ask() {
    local prompt="$1"
    if $AUTO_MODE; then
        echo "$prompt [AUTO: O]"
        return 0
    fi
    read -r -p "$prompt [O/n] " response
    response=${response:-O}
    [[ "$response" =~ ^[OoYy]$ ]]
}

cd "$APP_DIR" || { echo "❌ Répertoire introuvable"; exit 1; }

# Logging automatique — tout va dans le terminal ET dans le fichier log
mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "========================================"
echo "🚀 Déploiement de Radio Choup"
echo "📝 Log: $LOG_FILE"
echo "========================================"

# 0. Sécuriser les permissions du fichier .env
if [ -f ".env" ]; then
    PERMS=$(stat -c '%a' .env)
    if [ "$PERMS" != "600" ]; then
        echo "🔒 Sécurisation de .env (permissions $PERMS → 600)..."
        chmod 600 .env
        echo "✅ .env sécurisé."
    fi
fi

# 1. Vérifier les mises à jour et Git pull
echo "🔍 Vérification des mises à jour..."
git fetch origin --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✅ Déjà à jour ($(echo $LOCAL | cut -c1-7)). Rien à déployer."
    read -r -p "Continuer quand même ? [o/N] " response
    response=${response:-N}
    if [[ ! "$response" =~ ^[OoYy]$ ]]; then
        echo "👋 Déploiement annulé."
        exit 0
    fi
else
    BEHIND=$(git rev-list --count HEAD..origin/main)
    echo "📦 $BEHIND nouveau(x) commit(s) disponible(s) :"
    git log --oneline HEAD..origin/main
    echo ""
    echo "⬇️ Récupération du code source..."
    git stash --quiet 2>/dev/null || true
    git pull --ff-only
    echo "✅ Code à jour."
    AUTO_MODE=true
    echo "🤖 Mode automatique activé pour les étapes suivantes."
fi

# 2. Dépendances
if ask "📦 Installer les dépendances (npm install) ?"; then
    echo "📦 Installation des dépendances..."
    npm install
    echo "✅ Dépendances OK."
else
    echo "⏭️ Dépendances ignorées."
fi

# 3. Build
if ask "🏗️ Recompiler les assets statiques (next build) ?"; then
    echo "🔍 Vérification TypeScript rapide..."
    npm run typecheck || { echo "❌ Erreur TypeScript détectée. Corrigez les erreurs avant de builder."; exit 1; }
    echo "✅ TypeScript OK."
    echo "🏷️  Mise à jour NEXT_PUBLIC_APP_VERSION dans .env..."
    APP_VERSION=$(git rev-parse --short HEAD)
    if grep -q "^NEXT_PUBLIC_APP_VERSION=" .env 2>/dev/null; then
        sed -i "s/^NEXT_PUBLIC_APP_VERSION=.*/NEXT_PUBLIC_APP_VERSION=$APP_VERSION/" .env
    else
        echo "NEXT_PUBLIC_APP_VERSION=$APP_VERSION" >> .env
    fi
    chmod 600 .env
    echo "✅ NEXT_PUBLIC_APP_VERSION=$APP_VERSION"
    echo "🧹 Nettoyage du cache Next.js..."
    rm -rf .next/cache
    echo "🏗️ Compilation Next.js en cours..."
    npm run build
    echo "✅ Build terminé."
else
    echo "⏭️ Build ignoré."
fi

# 4. PM2 restart
if ask "🔄 (Re)démarrer le serveur PM2 ?"; then
    if ! command -v pm2 &> /dev/null; then
        echo "❌ PM2 introuvable. Installez-le avec 'npm install -g pm2'"
        exit 1
    fi

    if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
        echo "♻️ Relance à chaud..."
        pm2 reload "$APP_NAME" --update-env
    else
        echo "▶️ Premier lancement..."
        PORT=$PORT_APP pm2 start npm --name "$APP_NAME" -- start
        pm2 startup
    fi

    echo "✅ PM2 démarré."
else
    echo "⏭️ PM2 ignoré."
fi

# 5. PM2 save
if ask "💾 Sauvegarder l'état PM2 (pm2 save) ?"; then
    pm2 save
    echo "✅ État PM2 sauvegardé."
else
    echo "⏭️ Sauvegarde PM2 ignorée."
fi

# 6. Nettoyage des vieux logs (garder les 10 derniers)
ls -t "$LOG_DIR"/deploy-*.log 2>/dev/null | tail -n +11 | xargs -r rm --

echo "========================================"
echo "✨ Déploiement terminé !"
echo "📝 Log complet: $LOG_FILE"
echo "========================================"
