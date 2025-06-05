// This is a partial polyfill for the Node.js channels API in a browser environment.
// It provides a way to create channels and subscribe to them

class ActiveChannel {
  _subscribers: any;
  name: any;

  subscribe(subscription: ChannelListener) {
    if (typeof subscription !== "function") {
      throw new Error(
        'The "subscription" argument must be of type function',
        subscription
      );
    }
    this._subscribers.push(subscription);
  }

  unsubscribe(subscription: ChannelListener) {
    const index = this._subscribers.indexOf(subscription);
    if (index === -1) return false;

    this._subscribers.splice(index, 1);

    // When there are no more active subscribers, restore to fast prototype.
    if (!this._subscribers.length) {
      // eslint-disable-next-line no-use-before-define
      Object.setPrototypeOf(this, Channel.prototype);
    }

    return true;
  }

  get hasSubscribers() {
    return true;
  }

  publish(data: any) {
    for (let i = 0; i < this._subscribers.length; i++) {
      try {
        const onMessage = this._subscribers[i];
        onMessage(data, this.name);
      } catch (err) {
        process.nextTick(() => {
          throw err;
        });
      }
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

  static [Symbol.hasInstance](instance: any) {
    const prototype = Object.getPrototypeOf(instance);
    return (
      prototype === Channel.prototype || prototype === ActiveChannel.prototype
    );
  }

  subscribe(subscription: ChannelListener) {
    Object.setPrototypeOf(this, ActiveChannel.prototype);
    this._subscribers = [];
    this.subscribe(subscription);
  }

  unsubscribe() {
    return false;
  }

  get hasSubscribers() {
    return false;
  }

  publish(data: any) {}
}

// channels must be stored in a global symbol to allow multiple instances
// of the API to coexist without conflicts.
const channelsSymbol = Symbol.for("@opentelemetry/api:channels");
const channels: Record<string | symbol, WeakRef<Channel>> = (globalThis as any)[
  channelsSymbol
] ||
(globalThis as any)[channelsSymbol] ||
{};

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
