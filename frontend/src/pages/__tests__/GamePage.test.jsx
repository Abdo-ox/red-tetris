import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import GamePage from '../GamePage';
import { FakeSocket } from '../../test/fakeSocket';

const socket = new FakeSocket();

vi.mock('../../middleware/socketMiddleware', () => {
  return {
    createSocket: () => socket,
  };
});

describe('GamePage', () => {
  let container;
  let root;

  beforeEach(() => {
    socket.emitted.length = 0;
    socket.connected = false;
    socket.closed = false;

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('emits join-room with URL params on connect', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/roomX/Charlie']}>
          <Routes>
            <Route path="/:room/:playerName" element={<GamePage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    socket.connected = true;
    await act(async () => {
      socket.trigger('connect');
    });

    expect(socket.emitted.some(e => e.event === 'join-room' && e.payload?.room === 'roomX' && e.payload?.playerName === 'Charlie')).toBe(true);
  });

  it('closes socket on unmount', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/r/p']}>
          <Routes>
            <Route path="/:room/:playerName" element={<GamePage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await act(async () => {
      root.unmount();
    });

    expect(socket.closed).toBe(true);
  });
});

