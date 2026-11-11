/** Session flag: the visitor has left the welcome screen during this tab session. */
export const WELCOME_SEEN_KEY = "amp-welcome-seen";

export function shouldShowWelcome(seen: boolean, force: boolean): boolean {
  return force || !seen;
}
