/** True when v1.1.0 CTF intentional breaks are enabled (compose overlay only). */
export function isCtfMode(): boolean {
  return process.env.CTF_MODE === 'true';
}
