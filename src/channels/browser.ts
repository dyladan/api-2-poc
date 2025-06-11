// This is a partial polyfill for the Node.js channels API in a browser environment.
// It provides a way to create channels and subscribe to them

class ActiveChannel {
  // subscribers
  s!: ChannelListener[];
  // name
  n!: string;

  subscribe(subscription: ChannelListener) {
    this.s.push(subscription);
  }

  get hasSubscribers() {
    return true;
  }

  publish(data: any) {
    for (let i = 0; i < this.s.length; i++) {
      this.s[i](data, this.n);
    }
  }
}

class Channel {
  // subscribers
  s?: ChannelListener[];
  // name
  n: string;

  constructor(name: string) {
    this.s = undefined;
    this.n = name;
  }

  subscribe(subscription: ChannelListener) {
    Object.setPrototypeOf(this, ActiveChannel.prototype);
    this.s = [subscription];
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
