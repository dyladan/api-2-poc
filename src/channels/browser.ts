// This is a partial polyfill for the Node.js channels API in a browser environment.
// It provides a way to create channels and subscribe to them

class ActiveChannel {
  _subscribers!: ChannelListener[];
  name!: string;

  subscribe(subscription: ChannelListener) {
    this._subscribers.push(subscription);
  }

  get hasSubscribers() {
    return true;
  }

  publish(data: any) {
    for (let i = 0; i < this._subscribers.length; i++) {
      this._subscribers[i](data, this.name);
    }
  }
}

class Channel {
  _subscribers?: ChannelListener[];
  name: string;

  constructor(name: string) {
    this._subscribers = undefined;
    this.name = name;
  }

  subscribe(subscription: ChannelListener) {
    Object.setPrototypeOf(this, ActiveChannel.prototype);
    this._subscribers = [subscription];
  }

  get hasSubscribers() {
    return false;
  }

  publish(data: any) {}
}

// channels must be stored in a global symbol to allow multiple instances
// of the API to coexist without conflicts.
const channelsSymbol = Symbol.for("@opentelemetry/api:channels");
(globalThis as any)[channelsSymbol] = (globalThis as any)[channelsSymbol] || {};
const channels: Record<string, Channel> = (globalThis as any)[
  channelsSymbol
];

export function channel(name: string): Channel {
  channels[name] = channels[name] || new Channel(name);
  return channels[name];
}

export type ChannelListener = (message: unknown, name: string) => void;

export function subscribe(
  name: string,
  onMessage: ChannelListener
): void {
  channel(name).subscribe(onMessage);
}
