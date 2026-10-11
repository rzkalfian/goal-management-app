export function initialSetupAllowed() {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_INITIAL_SETUP === "true";
}