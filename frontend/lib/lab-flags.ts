/** Lab / pentest UI (demo passwords, /dev explorer). Off in production builds. */
export function isLabUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LAB_UI === 'true';
}
