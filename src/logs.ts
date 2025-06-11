import { channel } from "./channels";
import type { Attributes } from "./types";

const emitEventChannel = channel("@opentelemetry/api/logs:emitEvent");
const isEnabledChannel = channel("@opentelemetry/api/logs:isEnabled");

export type Logger = {
  emitEvent: (options: EmitEventOptions) => void;
  isEnabled: () => boolean;
};

export function getLogger(logger: LoggerOptions): Logger {
  return {
    emitEvent(event: EmitEventOptions): void {
      if (!emitEventChannel.hasSubscribers) return;
      emitEventChannel.publish({
        event,
        logger,
      });
    },
    isEnabled(): boolean {
      if (!isEnabledChannel.hasSubscribers)
        return emitEventChannel.hasSubscribers;
      const event = {
        logger,
        // assumed enabled if there is a subscriber to the emitEvent channel
        isEnabled: emitEventChannel.hasSubscribers,
      };
      isEnabledChannel.publish(event);
      return event.isEnabled;
    },
  };
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LoggerOptions = {
  name: string;
  version?: string;
  schemaUrl?: string;
  attributes?: Attributes;
};

export type EmitEventOptions = {
  level: LogLevel;
  message: string;
  attributes?: Attributes;
  timestamp?: number;
};
