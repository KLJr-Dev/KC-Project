import { isLabUiEnabled } from './lab-flags';

const LAB_DEMO_USERS = [
  { label: 'User', email: 'user@kc.test', password: 'UserPass123!' },
  { label: 'Moderator', email: 'mod@kc.test', password: 'ModPass123!' },
  { label: 'Admin', email: 'admin@kc.test', password: 'AdminPass123!' },
] as const;

/** Empty in production builds — passwords never ship in the client bundle when lab UI is off. */
export const DEMO_USERS = isLabUiEnabled() ? LAB_DEMO_USERS : ([] as const);
