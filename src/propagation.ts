import { channel } from "./channels";

const injectChannel = channel("@opentelemetry/api/propagation:inject");
const extractChannel = channel("@opentelemetry/api/propagation:extract");

export function inject(
  spanContext: SpanContext,
  carrier: TextMapCarrier
): void {
  injectChannel.publish({
    spanContext,
    carrier,
  });
}

export function extract(
  carrier: TextMapCarrier
): SpanContext | null | undefined {
  const event: {
    carrier: TextMapCarrier;
    spanContext: SpanContext;
  } = { carrier, spanContext: {} };
  extractChannel.publish(event);
  return event.spanContext;
}

type SpanContext = {
  traceId?: string;
  spanId?: string;
};
type TextMapCarrier = Record<string, string>;
