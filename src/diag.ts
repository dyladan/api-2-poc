import { channel } from "./channel";

const ch = channel("@opentelemetry/api/diag");

function publish(level: string, message: string, body?: any) {
  if (!ch.hasSubscribers) return;
  ch.publish({ level, message, body });
}

export function error(message: string, body?: any): void {
  publish("error", message, body);
}

export function warn(message: string, body?: any): void {
  publish("warn", message, body);
}

export function info(message: string, body?: any): void {
  publish("info", message, body);
}

export function debug(message: string, body?: any): void {
  publish("debug", message, body);
}

export function trace(message: string, body?: any): void {
  publish("trace", message, body);
}
