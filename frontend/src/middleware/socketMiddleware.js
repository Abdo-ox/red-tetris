import { io } from 'socket.io-client';

const SERVER_URL = window.location.origin;

/**
 * Frontend Socket.IO middleware.
 * Encapsulates all direct `socket.io-client` usage so pages/components don't import `io` directly.
 *
 * NOTE: This intentionally does NOT change app logic; it just centralizes socket creation.
 */
export function createSocket(options = {}) {
  return io(SERVER_URL, options);
}

export function createTempSocket() {
  return createSocket({ autoConnect: true });
}

