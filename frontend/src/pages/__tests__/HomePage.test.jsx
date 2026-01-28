import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

import HomePage from '../HomePage';
import { FakeSocket } from '../../test/fakeSocket';

let lastNavigateArg = null;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => (arg) => {
      lastNavigateArg = arg;
    },
  };
});

const socket = new FakeSocket();

vi.mock('../../middleware/socketMiddleware', () => {
  return {
    createTempSocket: () => socket,
  };
});

function setInputValue(container, inputId, value) {
  const el = container.querySelector(`#${inputId}`);
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('HomePage', () => {
  let container;
  let root;

  beforeEach(() => {
    lastNavigateArg = null;
    socket.emitted.length = 0;
    socket.closed = false;
    socket.connected = false;

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('creates a temp socket and emits join-room on connect after clicking the main button', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    setInputValue(container, 'roomId', 'room1');
    setInputValue(container, 'playerName', 'Alice');

    const btn = container.querySelector('button.btn.btn-create');
    expect(btn).toBeTruthy();

    await act(async () => {
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Simulate socket connection
    socket.connected = true;
    await act(async () => {
      socket.trigger('connect');
    });

    expect(socket.emitted.some(e => e.event === 'join-room' && e.payload?.room === 'room1' && e.payload?.playerName === 'Alice')).toBe(true);
  });

  it('navigates to /:room/:playerName after room-joined', async () => {
    vi.useFakeTimers();

    await act(async () => {
      root.render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    setInputValue(container, 'roomId', 'room2');
    setInputValue(container, 'playerName', 'Bob');

    const btn = container.querySelector('button.btn.btn-create');
    await act(async () => {
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    socket.connected = true;
    await act(async () => {
      socket.trigger('room-joined');
    });

    // navigation happens after setTimeout(..., 100)
    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    expect(lastNavigateArg).toBe('/room2/Bob');

    vi.useRealTimers();
  });
});

