/** Nest @Throttle profile for auth routes — relaxed when CTF_MODE enables hydra. */
export const AUTH_ROUTE_THROTTLE = {
  default: {
    limit: process.env.CTF_MODE === 'true' ? 300 : 30,
    ttl: 60_000,
  },
};
