/**
 * Table de calibration de la radio desktop, pilotée par l'utilisateur via le
 * debug overlay (?debug). Chaque entrée est un point mesuré à un viewport donné.
 *
 * Les valeurs sont interpolées linéairement par segments entre les points
 * (et figées aux bornes au-delà de la plage). Pour ajouter/affiner un point :
 * insérer une ligne ici, triée par `vw` croissant — rien d'autre à toucher.
 *
 * - vw        : largeur de viewport (px) où la mesure a été prise
 * - width     : largeur de la radio (#radio-wrapper) en px
 * - top       : position top du wrapper (relative à #page-main) en px
 * - right     : position right du wrapper (relative à #page-main) en px
 * - footerTop : top voulu du bandeau footer en viewport (px)
 */
export interface RadioCalibrationPoint {
  vw: number;
  width: number;
  top: number;
  right: number;
  footerTop: number;
}

export const RADIO_CALIBRATION: RadioCalibrationPoint[] = [
  { vw: 1034, width: 566, top: -77, right: 53, footerTop: 491 },
  { vw: 1284, width: 657, top: -19, right: 178, footerTop: 567 },
  { vw: 1440, width: 673, top: -11, right: 256, footerTop: 590 },
  { vw: 2560, width: 654, top: 55, right: 825, footerTop: 647 }
];

/** Dimension native de l'asset radio (sert au calcul du scale interne). */
export const RADIO_NATIVE_WIDTH = 673;

type InterpKey = Exclude<keyof RadioCalibrationPoint, "vw">;

/** Interpolation linéaire par segments d'une propriété en fonction du viewport. */
export function interpolateRadio(
  points: RadioCalibrationPoint[],
  vw: number,
  key: InterpKey
): number {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return 0;
  if (vw <= first.vw) return first[key];
  if (vw >= last.vw) return last[key];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a && b && vw >= a.vw && vw <= b.vw) {
      const t = (vw - a.vw) / (b.vw - a.vw);
      return a[key] + t * (b[key] - a[key]);
    }
  }
  return last[key];
}
