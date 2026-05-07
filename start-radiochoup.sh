#!/bin/bash
set -e

# =============================================================================
# Script de Démarrage Interactif - Radio Choup
# =============================================================================
# Ce script configure et démarre l'environnement Radio Choup
# Usage: ./start-radiochoup.sh [options]
# =============================================================================

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
PINK='\033[38;5;218m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration par défaut
DEFAULT_PORT=3000
PROJECT_NAME="Radio Choup"
LOG_FILE="logs/startup.log"

# Ports à surveiller et libérer
REQUIRED_PORTS=($DEFAULT_PORT)

# PIDs des sous-processus lancés
CHILD_PIDS=()

# =============================================================================
# FONCTIONS UTILITAIRES
# =============================================================================

print_separator() {
  echo -e "${MAGENTA}------------------------------------------------------------${NC}"
}

print_title() {
  echo -e "${BOLD}${PINK}"
  echo "  ____           _ _         ____ _                       "
  echo " |  _ \ __ _  __| (_) ___   / ___| |__   ___  _   _ _ __  "
  echo " | |_) / _\` |/ _\` | |/ _ \ | |   | '_ \ / _ \| | | | '_ \ "
  echo " |  _ < (_| | (_| | | (_) || |___| | | | (_) | |_| | |_) |"
  echo " |_| \_\__,_|\__,_|_|\___/  \____|_| |_|\___/ \__,_| .__/ "
  echo "                                                    |_|    "
  echo ""
  echo "         🎙️  La radio rétro-glamour - Application Next.js"
  echo -e "${NC}"
}

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # Créer le dossier logs s'il n'existe pas
    mkdir -p logs

    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $message"
            echo "[$timestamp] [INFO] $message" >> "$LOG_FILE"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            echo "[$timestamp] [WARN] $message" >> "$LOG_FILE"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            echo "[$timestamp] [ERROR] $message" >> "$LOG_FILE"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            echo "[$timestamp] [SUCCESS] $message" >> "$LOG_FILE"
            ;;
    esac
}

check_port_availability() {
  local port=$1
  local process_info=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [ -n "$process_info" ]; then
    return 1  # Port occupé
  else
    return 0  # Port libre
  fi
}

kill_ports() {
  local ports=("$@")
  local killed_pids=()
  local killed_processes=()

  for port in "${ports[@]}"; do
    log "INFO" "Vérification du port $port..."

    local process_details=$(lsof -ti tcp:"$port" 2>/dev/null || true)

    if [ -n "$process_details" ]; then
      log "WARN" "Port $port occupé, arrêt des processus..."

      for pid in $process_details; do
        local process_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "inconnu")
        if kill -9 "$pid" 2>/dev/null; then
          killed_pids+=("$pid")
          killed_processes+=("$process_name")
          log "SUCCESS" "Processus $process_name (PID: $pid) arrêté sur le port $port"
        else
          log "WARN" "Impossible d'arrêter le processus PID: $pid sur le port $port"
        fi
      done

      sleep 2

      if check_port_availability "$port"; then
        log "SUCCESS" "Port $port maintenant libre"
      else
        log "ERROR" "Port $port toujours occupé après nettoyage"
      fi
    else
      log "SUCCESS" "Port $port déjà libre"
    fi
  done

  if [ ${#killed_pids[@]} -gt 0 ]; then
    log "INFO" "Résumé: ${#killed_pids[@]} processus arrêtés (${killed_processes[*]})"
  fi
}

force_kill_node_processes() {
  log "INFO" "Nettoyage complet des processus Node.js/pnpm..."

  pkill -f "pnpm dev" 2>/dev/null || true
  pkill -f "pnpm start" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true
  pkill -f "next start" 2>/dev/null || true
  pkill -f "node.*next" 2>/dev/null || true

  sleep 1

  log "SUCCESS" "Nettoyage des processus Node.js terminé"
}

cleanup() {
  echo ""
  log "WARN" "Arrêt demandé, nettoyage..."
  for pid in "${CHILD_PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  done
  kill_ports "${REQUIRED_PORTS[@]}"
  log "SUCCESS" "Tous les services ont été arrêtés et les ports libérés."
  exit 0
}

check_dependencies() {
    log "INFO" "Vérification des dépendances..."

    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log "ERROR" "Node.js n'est pas installé. Veuillez l'installer (version 20+)"
        exit 1
    fi

    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 20 ]; then
        log "ERROR" "Node.js version 20+ requis. Version actuelle: $(node --version)"
        exit 1
    fi

    # Vérifier pnpm
    if ! command -v pnpm &> /dev/null; then
        log "ERROR" "pnpm n'est pas installé. Installez-le avec : corepack enable pnpm"
        exit 1
    fi

    # Vérifier lsof pour la gestion des ports
    if ! command -v lsof &> /dev/null; then
        log "WARN" "lsof non installé, gestion des ports limitée"
    fi

    log "SUCCESS" "Node.js $(node --version) et pnpm $(pnpm --version) détectés"
}

setup_environment() {
    log "INFO" "Configuration de l'environnement Radio Choup..."

    # Créer le fichier .env.local s'il n'existe pas (depuis .env.example)
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            log "INFO" "Création de .env.local à partir de .env.example"
            cp .env.example .env.local
            log "WARN" "Pense à éditer .env.local pour configurer la clé Vagalume et les URLs Icecast"
        else
            log "WARN" ".env.example introuvable, création d'un .env.local minimal"
            cat > .env.local << EOF
# Streaming
STREAM_TYPE=icecast
STREAM_URL=https://icecast.cef-informatique.com:8443/stream
STREAM_STATUS_URL=https://icecast.cef-informatique.com:8443/status-json.xsl
NOW_PLAYING_POLL_INTERVAL_MS=4000

# APIs externes (server only)
VAGALUME_API_KEY=your-vagalume-api-key-here
ITUNES_CACHE_TTL_S=86400
LYRICS_CACHE_TTL_S=604800

# Public
NEXT_PUBLIC_RADIO_NAME=Radio Choup
NEXT_PUBLIC_DEFAULT_COVER=/img/bg-capa.jpg
NEXT_PUBLIC_SITE_URL=http://localhost:${DEFAULT_PORT}
EOF
        fi
        log "SUCCESS" "Fichier .env.local créé"
    else
        log "INFO" "Fichier .env.local déjà existant"
    fi

    log "SUCCESS" "Environnement configuré"
}

install_dependencies() {
    log "INFO" "Vérification des dépendances pnpm..."

    if [ ! -f "package.json" ]; then
        log "ERROR" "package.json non trouvé à la racine du projet"
        return 1
    fi

    if [ ! -d "node_modules" ]; then
        log "INFO" "Installation des dépendances..."
        pnpm install --frozen-lockfile
        log "SUCCESS" "Dépendances installées"
    else
        log "INFO" "Dépendances déjà installées"
    fi
}

install_playwright_browsers() {
    log "INFO" "Vérification des navigateurs Playwright..."
    if ! pnpm exec playwright --version &> /dev/null; then
        log "WARN" "Playwright non détecté, skip"
        return 0
    fi
    # Test si chromium est déjà installé
    if [ ! -d "$HOME/.cache/ms-playwright/chromium-"* ] 2>/dev/null; then
        log "INFO" "Installation de Chromium pour Playwright..."
        pnpm exec playwright install --with-deps chromium
        log "SUCCESS" "Chromium installé"
    else
        log "INFO" "Chromium déjà installé"
    fi
}

test_app_health() {
    log "INFO" "Test de l'application..."

    local max_attempts=15
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$DEFAULT_PORT" > /dev/null 2>&1; then
            log "SUCCESS" "Application accessible (tentative $attempt/$max_attempts)"
            return 0
        else
            log "INFO" "Tentative $attempt/$max_attempts - Serveur pas encore prêt, attente..."
            sleep 2
            ((attempt++))
        fi
    done

    log "WARN" "Impossible d'accéder à l'application après $max_attempts tentatives"
    return 1
}

warmup_app() {
  print_separator
  log "INFO" "Préchauffage de l'application (page d'accueil + endpoints API)..."

  local base_url="http://localhost:$DEFAULT_PORT"
  local pages=(
    "/"
    "/api/now-playing"
    "/api/history?limit=5"
  )
  local ok=0
  local fail=0

  for page in "${pages[@]}"; do
    if curl -sf -o /dev/null -w "" --max-time 10 "${base_url}${page}" 2>/dev/null; then
      ok=$((ok + 1))
    else
      fail=$((fail + 1))
    fi
  done

  if [ $fail -eq 0 ]; then
    log "SUCCESS" "Préchauffage terminé : ${ok}/${#pages[@]} ressources chargées"
  else
    log "WARN" "Préchauffage partiel : ${ok}/${#pages[@]} OK, ${fail} en échec"
    log "INFO" "Les API peuvent retourner 503 tant que le premier poll Icecast n'a pas eu lieu (~4s)"
  fi
}

ask_service() {
  print_separator
  echo -e "${CYAN}Que souhaitez-vous faire ?${NC} ${YELLOW}(Entrée = Développement)${NC}"
  echo "1) Démarrer en mode développement (hot-reload)"
  echo "2) Build et démarrer en production"
  echo "3) Build uniquement"
  echo "4) Setup initial (installation)"
  echo "5) Lancer le linter"
  echo "6) Lancer les tests unitaires (Vitest)"
  echo "7) Lancer les tests E2E (Playwright)"
  echo "8) Type-check (tsc --noEmit)"
  echo "9) Quitter"
  read -p "Votre choix [1]: " REPLY
  case "$REPLY" in
    ""|1|0) SERVICE="dev" ;;
    2) SERVICE="prod" ;;
    3) SERVICE="build" ;;
    4) SERVICE="setup" ;;
    5) SERVICE="lint" ;;
    6) SERVICE="test" ;;
    7) SERVICE="e2e" ;;
    8) SERVICE="typecheck" ;;
    9) exit 0 ;;
    *) echo -e "${YELLOW}Choix invalide, valeur par défaut : Développement${NC}"; SERVICE="dev" ;;
  esac
}

start_dev() {
  print_separator
  log "INFO" "Démarrage de Next.js en mode développement..."

  if ! check_port_availability "$DEFAULT_PORT"; then
    log "WARN" "Port $DEFAULT_PORT encore occupé, nettoyage final..."
    kill_ports "$DEFAULT_PORT"
  fi

  log "INFO" "Démarrage du serveur de développement sur le port $DEFAULT_PORT"
  pnpm dev 2>&1 | tee logs/dev.log | grep --line-buffered -E '(ERROR|Error|error|500|404|401|403|WARN|warn|✗|failed|crash|Erreur)' &
  DEV_PID=$!
  CHILD_PIDS+=($DEV_PID)

  sleep 3

  if check_port_availability "$DEFAULT_PORT"; then
    log "ERROR" "L'application n'a pas réussi à démarrer sur le port $DEFAULT_PORT"
    log "INFO" "Consultez logs/dev.log pour plus de détails"
  else
    log "SUCCESS" "Application démarrée avec succès sur http://localhost:$DEFAULT_PORT (PID: $DEV_PID)"
  fi
}

start_prod() {
  print_separator
  log "INFO" "Build et démarrage en mode production..."

  log "INFO" "Build de l'application..."
  pnpm build

  if ! check_port_availability "$DEFAULT_PORT"; then
    log "WARN" "Port $DEFAULT_PORT encore occupé, nettoyage final..."
    kill_ports "$DEFAULT_PORT"
  fi

  log "INFO" "Démarrage du serveur de production sur le port $DEFAULT_PORT"
  pnpm start 2>&1 | tee logs/prod.log | grep --line-buffered -E '(ERROR|Error|error|500|404|401|403|WARN|warn|✗|failed|crash|Erreur)' &
  PROD_PID=$!
  CHILD_PIDS+=($PROD_PID)

  sleep 3

  if check_port_availability "$DEFAULT_PORT"; then
    log "ERROR" "L'application n'a pas réussi à démarrer sur le port $DEFAULT_PORT"
    log "INFO" "Consultez logs/prod.log pour plus de détails"
  else
    log "SUCCESS" "Application démarrée avec succès sur http://localhost:$DEFAULT_PORT (PID: $PROD_PID)"
  fi
}

run_build() {
  print_separator
  log "INFO" "Build de l'application Next.js..."
  pnpm build
  log "SUCCESS" "Build terminé avec succès"
  echo ""
  echo -e "${CYAN}Pour démarrer l'application en production :${NC}"
  echo -e "  ${GREEN}pnpm start${NC}"
  echo -e "  ou relancez ce script et choisissez l'option 2"
}

run_setup() {
    print_separator
    log "INFO" "Exécution du setup initial..."

    check_dependencies
    setup_environment
    install_dependencies
    install_playwright_browsers

    print_separator
    log "SUCCESS" "Setup terminé ! Vous pouvez maintenant démarrer l'application."
    echo ""
    echo -e "${CYAN}Prochaines étapes :${NC}"
    echo -e "  1. Vérifiez la configuration dans ${GREEN}.env.local${NC} (clé Vagalume, URLs Icecast)"
    echo -e "  2. Lancez ${GREEN}./start-radiochoup.sh${NC} et choisissez 'Développement' pour démarrer"
}

run_lint() {
    print_separator
    log "INFO" "Exécution du linter..."
    pnpm lint
    log "SUCCESS" "Lint terminé"
}

run_tests() {
    print_separator
    log "INFO" "Exécution des tests unitaires (Vitest)..."
    pnpm test
    log "SUCCESS" "Tests unitaires terminés"
}

run_e2e() {
    print_separator
    log "INFO" "Exécution des tests E2E (Playwright)..."
    log "WARN" "Le build de production sera lancé automatiquement par Playwright"
    pnpm test:e2e
    log "SUCCESS" "Tests E2E terminés"
}

run_typecheck() {
    print_separator
    log "INFO" "Exécution du typecheck (tsc --noEmit)..."
    pnpm typecheck
    log "SUCCESS" "Typecheck terminé"
}

show_info() {
    print_separator
    echo -e "${PINK}🎙️  Radio Choup démarrée avec succès !${NC}"
    echo
    echo -e "${CYAN}📊 Application disponible :${NC}"
    echo -e "   ${GREEN}• URL:${NC}  http://localhost:$DEFAULT_PORT"
    echo
    echo -e "${CYAN}🔗 Endpoints API :${NC}"
    echo -e "   ${GREEN}• Now playing:${NC}    http://localhost:$DEFAULT_PORT/api/now-playing"
    echo -e "   ${GREEN}• History:${NC}        http://localhost:$DEFAULT_PORT/api/history?limit=5"
    echo -e "   ${GREEN}• Lyrics:${NC}         http://localhost:$DEFAULT_PORT/api/lyrics?artist=X&song=Y"
    echo -e "   ${GREEN}• SSE stream:${NC}     http://localhost:$DEFAULT_PORT/api/stream-events"
    echo -e "   ${GREEN}• Cover:${NC}          http://localhost:$DEFAULT_PORT/api/cover?artist=X&song=Y"
    echo
    echo -e "${CYAN}📁 Structure du projet :${NC}"
    echo -e "   ${GREEN}• Pages:${NC}       app/"
    echo -e "   ${GREEN}• Composants:${NC}  components/"
    echo -e "   ${GREEN}• Hooks:${NC}       hooks/"
    echo -e "   ${GREEN}• Lib:${NC}         lib/"
    echo -e "   ${GREEN}• Tests:${NC}       tests/unit/, tests/e2e/"
    echo
    echo -e "${CYAN}📁 Logs :${NC}"
    if [ "$SERVICE" = "dev" ]; then
        echo -e "   ${GREEN}• Dev:${NC}     logs/dev.log"
    else
        echo -e "   ${GREEN}• Prod:${NC}    logs/prod.log"
    fi
    echo -e "   ${GREEN}• Startup:${NC} logs/startup.log"
    echo
    echo -e "${CYAN}🛠️  Scripts pnpm disponibles :${NC}"
    echo -e "   ${GREEN}• pnpm dev${NC}        - Mode développement"
    echo -e "   ${GREEN}• pnpm build${NC}      - Build production"
    echo -e "   ${GREEN}• pnpm start${NC}      - Démarrer en production"
    echo -e "   ${GREEN}• pnpm lint${NC}       - Vérifier le code"
    echo -e "   ${GREEN}• pnpm typecheck${NC}  - Vérifier les types TypeScript"
    echo -e "   ${GREEN}• pnpm test${NC}       - Tests unitaires (Vitest)"
    echo -e "   ${GREEN}• pnpm test:e2e${NC}   - Tests E2E (Playwright)"
    echo
    echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter l'application${NC}"
    print_separator
}

main() {
  chmod +x "$0" 2>/dev/null || true

  clear
  print_title
  print_separator
  echo -e "${BOLD}${CYAN}Script de démarrage interactif pour Radio Choup${NC}"
  echo -e "${YELLOW}🔧 Gestion automatique des ports activée${NC}"
  print_separator

  ask_service

  # Nettoyage des ports requis (sauf pour les services qui n'ouvrent pas de port)
  if [ "$SERVICE" != "setup" ] && [ "$SERVICE" != "lint" ] && [ "$SERVICE" != "build" ] && [ "$SERVICE" != "test" ] && [ "$SERVICE" != "typecheck" ]; then
    print_separator
    log "INFO" "Nettoyage et libération des ports requis..."

    force_kill_node_processes
    kill_ports "${REQUIRED_PORTS[@]}"
  fi

  print_separator

  trap cleanup SIGINT SIGTERM

  case "$SERVICE" in
    "setup")
      run_setup
      ;;
    "lint")
      check_dependencies
      run_lint
      ;;
    "test")
      check_dependencies
      install_dependencies
      run_tests
      ;;
    "typecheck")
      check_dependencies
      install_dependencies
      run_typecheck
      ;;
    "e2e")
      check_dependencies
      install_dependencies
      install_playwright_browsers
      run_e2e
      ;;
    "build")
      check_dependencies
      install_dependencies
      run_build
      ;;
    "dev")
      check_dependencies
      setup_environment
      install_dependencies
      start_dev
      test_app_health
      warmup_app
      show_info
      wait
      ;;
    "prod")
      check_dependencies
      setup_environment
      install_dependencies
      start_prod
      test_app_health
      warmup_app
      show_info
      wait
      ;;
  esac

  print_separator
  log "SUCCESS" "Opération terminée."
  print_separator
}

# Lancer le script principal
main
