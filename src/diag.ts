import { channel } from "./channels";

const ch = channel("@opentelemetry/api/diag");

export function error(message: string, body?: any) {
  if (!ch.hasSubscribers) return;
  ch.publish({ level: "error", message, body });
}

export function warn(message: string, body?: any) {
  if (!ch.hasSubscribers) return;
  ch.publish({ level: "warn", message, body });
}

export function info(message: string, body?: any) {
  if (!ch.hasSubscribers) return;
  ch.publish({ level: "info", message, body });
}

export function debug(message: string, body?: any) {
  if (!ch.hasSubscribers) return;
  ch.publish({ level: "debug", message, body });
}

export function trace(message: string, body?: any) {
  if (!ch.hasSubscribers) return;
  ch.publish({ level: "trace", message, body });
}
