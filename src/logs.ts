import { channel } from "./channels";
import type { Attributes } from "./types";

const emitEventChannel = channel("@opentelemetry/api/logs:emitEvent");
const isEnabledChannel = channel("@opentelemetry/api/logs:isEnabled");

export type Logger = {
  emitEvent: (options: EmitEventOptions) => void;
  isEnabled: () => boolean;
};

export function createLogger(loggerOptions: LoggerOptions): Logger {
  return {
    emitEvent(options: EmitEventOptions): void {
      const event = {
        level: options.level,
        message: options.message,
        attributes: options.attributes || {},
        timestamp: options.timestamp || Date.now(),
      };
      emitEventChannel.publish({
        event,
        logger: loggerOptions,
      });
    },
    isEnabled: () => {
      const event = {
        logger: loggerOptions,
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