import { channel } from "./channel";
import type { Attributes, AttributeValue } from "./types";

const tracePrefix = "trace:";
const propagationPrefix = "propagation:";
const startSpanChannel = channel(`${tracePrefix}startSpan`),
  endSpanChannel = channel(`${tracePrefix}endSpan`),
  addAttributeChannel = channel(`${tracePrefix}addAttribute`),
  setStatusChannel = channel(`${tracePrefix}setStatus`),
  addEventChannel = channel(`${tracePrefix}addEvent`),
  addLinkChannel = channel(`${tracePrefix}addLink`),
  injectChannel = channel(`${propagationPrefix}inject`),
  extractChannel = channel(`${propagationPrefix}extract`);

const nopSpan = {
  isRecording: false,
  context: { spanId: "", traceFlags: 0, traceId: "" },
};
export function getTracer(tracerOptions: TracerOptions): Tracer {
  const tracer = {
    name: tracerOptions.name,
    version: tracerOptions.version,
    schemaUrl: tracerOptions.schemaUrl,
    attributes: tracerOptions.attributes || {},
  };
  return {
    startSpan(options: SpanOptions): Span {
      const startSpanEvent: {
        options: SpanOptions;
        tracer: TracerOptions;
        span?: StartSpanResponse;
      } = { options, tracer };
      startSpanChannel.publish(startSpanEvent);

      // span comes from SDK
      // if no SDK is registered or it does not return a span,
      // we use a no-op span assumed not to be recording
      const span = startSpanEvent.span || nopSpan;

      // Reuse a single event object for all events to avoid allocation
      const eventObj: any = { span, tracer };

      return {
        end(endTime?: number): void {
          if (!endSpanChannel.hasSubscribers) return;
          eventObj.endTime = endTime;
          endSpanChannel.publish(eventObj);
        },
        addAttribute(key: string, value: AttributeValue): void {
          if (!addAttributeChannel.hasSubscribers) return;
          eventObj.key = key;
          eventObj.value = value;
          addAttributeChannel.publish(eventObj);
        },
        setStatus(status: SpanStatus): void {
          if (!setStatusChannel.hasSubscribers) return;
          eventObj.status = status;
          setStatusChannel.publish(eventObj);
        },
        addEvent(event: SpanEvent): void {
          if (!addEventChannel.hasSubscribers) return;
          eventObj.event = event;
          addEventChannel.publish(eventObj);
        },
        addLink(link: Link): void {
          if (!addLinkChannel.hasSubscribers) return;
          eventObj.link = link;
          addLinkChannel.publish(eventObj);
        },
        isRecording(): boolean {
          return span.isRecording;
        },
        getContext(): SpanContext {
          return span.context;
        },
      };
    },
  };
}

export function inject(
  spanContext: SpanContext,
  carrier: TextMapCarrier
): void {
  if (injectChannel.hasSubscribers) {
    injectChannel.publish({ spanContext, carrier });
  }
}

export function extract(carrier: TextMapCarrier): Partial<SpanContext> {
  const spanContext: Partial<SpanContext> = {};
  if (extractChannel.hasSubscribers) {
    extractChannel.publish({ carrier, spanContext });
  }
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
  getContext: () => SpanContext;
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
  context: SpanContext;
};
