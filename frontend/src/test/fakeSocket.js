export class FakeSocket {
  constructor() {
    this.connected = false;
    this._handlers = new Map(); // event -> Set<fn>
    this.emitted = []; // { event, payload }
    this.closed = false;
  }

  on(event, fn) {
    if (!this._handlers.has(event)) this._handlers.set(event, new Set());
    this._handlers.get(event).add(fn);
    return this;
  }

  off(event, fn) {
    const set = this._handlers.get(event);
    if (set) set.delete(fn);
    return this;
  }

  emit(event, payload) {
    this.emitted.push({ event, payload });
    return this;
  }

  close() {
    this.closed = true;
    this.connected = false;
  }

  trigger(event, payload) {
    const set = this._handlers.get(event);
    if (!set) return;
    for (const fn of Array.from(set)) fn(payload);
  }
}

