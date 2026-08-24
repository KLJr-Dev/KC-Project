/** True when Cycle-3 leak-crack-db intentional breaks are enabled (compose overlay only). */
export function isCtfMode(): boolean {
  return process.env.CTF_MODE === 'true';
}
