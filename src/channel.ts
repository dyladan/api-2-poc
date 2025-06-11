class Channel {
  public hasSubscribers = false;

  subscribe(subscription: ChannelListener) {
    this.publish = subscription;
    this.hasSubscribers = true;
  }

  publish(data: any) {}
}

// channels must be stored in a global symbol to allow multiple instances
// of the API to coexist without conflicts.
const channelsSymbol = Symbol.for("@opentelemetry/api:channels");
(globalThis as any)[channelsSymbol] = (globalThis as any)[channelsSymbol] || {};
const channels: Record<string, Channel> = (globalThis as any)[channelsSymbol];

export function channel(name: string): Channel {
  channels[name] = channels[name] || new Channel();
  return channels[name];
}

export type ChannelListener = (message: unknown) => void;

export function subscribe(name: string, onMessage: ChannelListener): void {
  channel(name).subscribe(onMessage);
}
