import { channel } from "diagnostics_channel";

const startSpanChannel = channel(`otel:tracing:startSpan`);
const endSpanChannel = channel(`otel:tracing:endSpan`);
const addAttributeChannel = channel(`otel:tracing:addAttribute`);
const setStatusChannel = channel(`otel:tracing:setStatus`);
const isEnabledChannel = channel(`otel:tracing:isEnabled`);

export function createTracer(tracerOptions: TracerOptions): Tracer {
  return {
    startSpan(options: SpanOptions): Span {
      const span: SpanOptions = {
        name: options.name,
        attributes: options.attributes || {},
        startTime: options.startTime || Date.now(),
      };

      startSpanChannel.publish({
        span,
        tracer: tracerOptions,
      });

      return {
        end(endTime: number = Date.now()): void {
          span.endTime = endTime;
          endSpanChannel.publish({
            span,
            tracer: tracerOptions,
          });
        },
        addAttribute: function (
          key: string,
          value: string | number | boolean
        ): void {
          addAttributeChannel.publish({
            span,
            tracer: tracerOptions,
            key,
            value,
          });
        },
        setStatus: function (status: "ok" | "error"): void {
          setStatusChannel.publish({
            span,
            tracer: tracerOptions,
            status,
          });
        },
      };
    },
    isEnabled: () => {
      // depends on the synchronous nature of diagnostics_channel
      // subscribers should overwrite the isEnabled property
      const isEnabled = isEnabledChannel.hasSubscribers;
      isEnabledChannel.publish({
        tracer: tracerOptions,
        enabled: isEnabled,
      });
      return isEnabled;
    },
  };
}

export type Span = {
  end: () => void;
  addAttribute: (key: string, value: string | number | boolean) => void;
  setStatus: (status: "ok" | "error") => void;
};

export type TracerOptions = {
  name: string;
  version?: string;
  schemaUrl?: string;
  attributes?: Record<string, string | number | boolean>;
};
export type Tracer = {
  startSpan: (options: SpanOptions) => Span;
  isEnabled: () => boolean;
};

export type SpanOptions = {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  startTime?: number;
  endTime?: number;
};
