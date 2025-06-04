import { channel } from "diagnostics_channel";
import type { Attributes } from "./types";

const emitEventChannel = channel("otel:logs:emitEvent");
const isEnabledChannel = channel("otel:logs:isEnabled");

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
      const enabled = isEnabledChannel.hasSubscribers;
      isEnabledChannel.publish({
        logger: loggerOptions,
        enabled,
      });
      return enabled;
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