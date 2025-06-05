import { channel } from "./channels";
import type { Attributes, AttributeValue } from "./types";

// example showing code size reduction opportunities
const p = "@opentelemetry/api/";
const ct = (m: string) => channel(`${p}trace:${m}`);
const cp = (m: string) => channel(`${p}propagation:${m}`);
const startSpanChannel = ct("startSpan"),
  endSpanChannel = ct("endSpan"),
  addAttributeChannel = ct("addAttribute"),
  setStatusChannel = ct("setStatus"),
  addEventChannel = ct("addEvent"),
  addLinkChannel = ct("addLink"),
  spanContextChannel = ct("spanContext"),
  injectChannel = cp("inject"),
  extractChannel = cp("extract");

export function createTracer(tracerOptions: TracerOptions): Tracer {
  const tracer = {
    name: tracerOptions.name,
    version: tracerOptions.version,
    schemaUrl: tracerOptions.schemaUrl,
    attributes: tracerOptions.attributes || {},
  };
  return {
    startSpan(options: SpanOptions): Span {
      const startSpanEvent: { options: SpanOptions; tracer: TracerOptions; span?: StartSpanResponse } = { options, tracer };
      startSpanChannel.publish(startSpanEvent);

      const span = startSpanEvent.span || { isRecording: false };

      return {
        end: function (endTime: number = Date.now()): void {
          endSpanChannel.publish({ span, tracer });
        },
        addAttribute: function (
          key: string,
          value: string | number | boolean
        ): void {
          addAttributeChannel.publish({ span, tracer, key, value });
        },
        setStatus: function (status: SpanStatus): void {
          setStatusChannel.publish({ span, tracer, status });
        },
        addEvent: function (event: SpanEvent): void {
          addEventChannel.publish({ span, tracer, event });
        },
        addLink: function (link: Link): void {
          addLinkChannel.publish({ span, tracer, link });
        },
        isRecording: function (): boolean {
          return span.isRecording;
        },
        spanContext: function (): SpanContext {
          const event: {
            span: StartSpanResponse;
            tracer: TracerOptions;
            spanContext?: SpanContext;
          } = { span, tracer };
          spanContextChannel.publish(event);
          return (
            event.spanContext || {
              spanId: "",
              traceFlags: 0,
              traceId: "",
            }
          );
        },
      };
    },
  };
}

export function inject(
  spanContext: SpanContext,
  carrier: TextMapCarrier
): void {
  injectChannel.publish({ spanContext, carrier });
}

export function extract(carrier: TextMapCarrier): Partial<SpanContext> {
  const spanContext: Partial<SpanContext> = {};
  extractChannel.publish({ carrier, spanContext });
  return spanContext;
}

export type TextMapCarrier = Record<string, string>;

export type Span = {
  end: (endTime?: number) => void;
  addAttribute: (key: string, value: AttributeValue) => void;
  setStatus: (status: SpanStatus) => void;
  addEvent: (event: SpanEvent) => void;
  addLink: (link: Link) => void;
  isRecording: () => boolean;
  spanContext: () => SpanContext;
};

export type SpanEvent = {
  name: string;
  attributes?: Attributes;
  time?: number;
};

export type SpanStatus = {
  /** The status code of this message. */
  code: SpanStatusCode;
  /** A developer-facing error message. */
  message?: string;
};

export const enum SpanStatusCode {
  /**
   * The default status.
   */
  UNSET = 0,
  /**
   * The operation has been validated by an Application developer or
   * Operator to have completed successfully.
   */
  OK = 1,
  /**
   * The operation contains an error.
   */
  ERROR = 2,
}

export type TracerOptions = {
  name: string;
  version?: string;
  schemaUrl?: string;
  attributes?: Record<string, string | number | boolean>;
};
export type Tracer = {
  startSpan: (options: SpanOptions) => Span;
};

export type SpanOptions = {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  startTime?: number;
  endTime?: number;
  kind?: SpanKind;
  links?: Link[];
  root?: boolean;
};

export const enum SpanKind {
  /**
   * Indicates that the span kind is not specified.
   * This should never be used and is only here for OTLP compatibility.
   */
  UNSET = 0,

  /** Default value. Indicates that the span is used internally. */
  INTERNAL = 1,

  /**
   * Indicates that the span covers server-side handling of an RPC or other
   * remote request.
   */
  SERVER = 2,

  /**
   * Indicates that the span covers the client-side wrapper around an RPC or
   * other remote request.
   */
  CLIENT = 3,

  /**
   * Indicates that the span describes producer sending a message to a
   * broker. Unlike client and server, there is no direct critical path latency
   * relationship between producer and consumer spans.
   */
  PRODUCER = 4,

  /**
   * Indicates that the span describes consumer receiving a message from a
   * broker. Unlike client and server, there is no direct critical path latency
   * relationship between producer and consumer spans.
   */
  CONSUMER = 5,
}

export type Link = {
  context: SpanContext;
  attributes?: Attributes;
};
export type SpanContext = {
  isRemote?: boolean;
  spanId: string;
  traceFlags: number;
  traceId: string;
  traceState?: TraceState;
};

export type TraceState = {
  get(key: string): undefined | string;
  serialize(): string;
  set(key: string, value: string): TraceState;
  unset(key: string): TraceState;
};

export type StartSpanResponse = {
  isRecording: boolean;
}