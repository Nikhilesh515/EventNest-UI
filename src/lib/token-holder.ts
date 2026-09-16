let accessToken: string | null = null;
let onExpired: (() => void) | null = null;

export const tokenHolder = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
  },
  setExpiredHandler: (handler: () => void): void => {
    onExpired = handler;
  },
  notifyExpired: (): void => {
    onExpired?.();
  },
};
