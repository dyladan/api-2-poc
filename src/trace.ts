import { channel } from "./channels";
import { Context } from "./context";
import type { Attributes, AttributeValue, TimeInput } from "./types";

const packageNamePrefix = "@opentelemetry/api/";
const propagationPrefix = `${packageNamePrefix}propagation:`;
const injectChannel = channel(`${propagationPrefix}inject`),
  extractChannel = channel(`${propagationPrefix}extract`);

const noopTracerProvider = {
  getTracer() {
    function startSpan() {
      // This is a no-op tracer, so we return a no-op span
      function nop() {}
      const spanId = "0000000000000000";
      return {
        end: nop,
        addAttribute: nop,
        setStatus: nop,
        addEvent: nop,
        addLink: nop,
        isRecording: () => false,
        getContext: () => ({
          spanId,
          traceId: spanId + spanId,
          traceFlags: 0,
        }),
      };
    }
    return {
      startSpan,
      startActiveSpan: function <F extends (span: Span) => ReturnType<F>>(
        name: string,
        fn: F
      ): ReturnType<F> {
        return fn(startSpan());
      },
    };
  },
};

export function registerGlobalTracerProvider(
  tracerProvider: TracerProvider
): void {
  // Register the tracer provider globally
  (globalThis as any).OTEL_TRACER_PROVIDER = tracerProvider;
}

export function getTracer(
  name: string,
  version?: string,
  options?: TracerOptions
): Tracer {
  const tracer = (
    (globalThis as any).OTEL_TRACER_PROVIDER || noopTracerProvider
  ).getTracer(name, version, options);
  return {
    startSpan(name, options, context): Span {
      // span comes from SDK
      // if no SDK is registered or it does not return a span,
      // we use a no-op span assumed not to be recording
      const span = tracer.startSpan(name, options, context);

      return {
        end(endTime?: number): void {
          span.end(endTime);
        },
        addAttribute(key: string, value: AttributeValue): void {
          span.addAttribute(key, value);
        },
        setStatus(status: SpanStatus): void {
          span.setStatus(status);
        },
        addEvent(event: SpanEvent): void {
          span.addEvent(event);
        },
        addLink(link: Link): void {
          span.addLink(link);
        },
        isRecording: () => span.isRecording(),
        getContext: () => span.getContext(),
      };
    },
    startActiveSpan: function <F extends (span: Span) => unknown>(
      name: string,
      fn: F
    ): ReturnType<F> {
      throw new Error("Function not implemented.");
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

/**
 * An interface describes additional metadata of a tracer.
 *
 * @since 1.3.0
 */
export interface TracerOptions {
  /**
   * The schemaUrl of the tracer or instrumentation library
   */
  schemaUrl?: string;
}
/**
 * Tracer provides an interface for creating {@link Span}s.
 *
 * @since 1.0.0
 */
export interface Tracer {
  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   *
   * This method do NOT modify the current Context.
   *
   * @param name The name of the span
   * @param [options] SpanOptions used for span creation
   * @param [context] Context to use to extract parent
   * @returns Span The newly created span
   * @example
   *     const span = tracer.startSpan('op');
   *     span.setAttribute('key', 'value');
   *     span.end();
   */
  startSpan(name: string, options?: SpanOptions, context?: Context): Span;

  /**
   * Starts a new {@link Span} and calls the given function passing it the
   * created span as first argument.
   * Additionally the new span gets set in context and this context is activated
   * for the duration of the function call.
   *
   * @param name The name of the span
   * @param [options] SpanOptions used for span creation
   * @param [context] Context to use to extract parent
   * @param fn function called in the context of the span and receives the newly created span as an argument
   * @returns return value of fn
   * @example
   *     const something = tracer.startActiveSpan('op', span => {
   *       try {
   *         do some work
   *         span.setStatus({code: SpanStatusCode.OK});
   *         return something;
   *       } catch (err) {
   *         span.setStatus({
   *           code: SpanStatusCode.ERROR,
   *           message: err.message,
   *         });
   *         throw err;
   *       } finally {
   *         span.end();
   *       }
   *     });
   *
   * @example
   *     const span = tracer.startActiveSpan('op', span => {
   *       try {
   *         do some work
   *         return span;
   *       } catch (err) {
   *         span.setStatus({
   *           code: SpanStatusCode.ERROR,
   *           message: err.message,
   *         });
   *         throw err;
   *       }
   *     });
   *     do some more work
   *     span.end();
   */
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    context: Context,
    fn: F
  ): ReturnType<F>;
}

/**
 * Options needed for span creation
 *
 * @since 1.0.0
 */
export interface SpanOptions {
  /**
   * The SpanKind of a span
   * @default {@link SpanKind.INTERNAL}
   */
  kind?: SpanKind;

  /** A span's attributes */
  attributes?: Attributes;

  /** {@link Link}s span to other spans */
  links?: Link[];

  /** A manually specified start time for the created `Span` object. */
  startTime?: TimeInput;

  /** The new span should be a root span. (Ignore parent from context). */
  root?: boolean;
}

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

/**
 * A registry for creating named {@link Tracer}s.
 *
 * @since 1.0.0
 */
export interface TracerProvider {
  /**
   * Returns a Tracer, creating one if one with the given name and version is
   * not already created.
   *
   * This function may return different Tracer types (e.g.
   * {@link NoopTracerProvider} vs. a functional tracer).
   *
   * @param name The name of the tracer or instrumentation library.
   * @param version The version of the tracer or instrumentation library.
   * @param options The options of the tracer or instrumentation library.
   * @returns Tracer A Tracer with the given name and version
   */
  getTracer(name: string, version?: string, options?: TracerOptions): Tracer;
}
