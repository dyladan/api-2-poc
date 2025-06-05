// This is a partial polyfill for the Node.js channels API in a browser environment.
// It provides a way to create channels and subscribe to them

class ActiveChannel {
  _subscribers: any;
  name: any;

  subscribe(subscription: ChannelListener) {
    this._subscribers.push(subscription);
  }

  get hasSubscribers() {
    return true;
  }

  publish(data: any) {
    for (let i = 0; i < this._subscribers.length; i++) {
      const onMessage = this._subscribers[i];
      onMessage(data, this.name);
    }
  }
}

class Channel {
  _subscribers: any;
  name: any;

  constructor(name: string | symbol) {
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
const channels: Record<string | symbol, WeakRef<Channel>> = (globalThis as any)[
  channelsSymbol
];

export function channel(name: string | symbol): Channel {
  const channel = channels[name];
  if (channel) {
    const channelInstance = channel.deref();
    if (channelInstance) {
      return channelInstance;
    } else {
      // If the channel was garbage collected, remove it from the map
      delete channels[name];
    }
  }

  if (typeof name !== "string" && typeof name !== "symbol") {
    throw new Error(
      'The "channel" argument must be one of type string or symbol',
      name
    );
  }

  const ch = new Channel(name);
  channels[name] = new WeakRef(ch);
  return ch;
}

export type ChannelListener = (message: unknown, name: string | symbol) => void;

export function subscribe(
  name: string | symbol,
  onMessage: ChannelListener
): void {
  channel(name).subscribe(onMessage);
}
