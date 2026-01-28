import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => ({ mocked: true })),
  };
});

describe('socketMiddleware', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('createSocket calls io() with window.location.origin and options', async () => {
    const { io } = await import('socket.io-client');
    const { createSocket } = await import('../socketMiddleware');

    const sock = createSocket({ autoConnect: false });
    expect(sock).toEqual({ mocked: true });
    expect(io).toHaveBeenCalledWith(window.location.origin, { autoConnect: false });
  });

  it('createTempSocket calls io() with autoConnect: true', async () => {
    const { io } = await import('socket.io-client');
    const { createTempSocket } = await import('../socketMiddleware');

    createTempSocket();
    expect(io).toHaveBeenCalledWith(window.location.origin, { autoConnect: true });
  });
});

