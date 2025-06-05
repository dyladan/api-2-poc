import { subscribe } from "diagnostics_channel";

const isLogsEnabled = true; // POC: set false to disable logs

export function startSDK() {
  startTracingSDK();
  startMetricsSDK();
  startLogsSDK();
  startPropagationSDK();
}

function startPropagationSDK() {
  subscribe("@opentelemetry/api/propagation:inject", (event: any) => {
    event.carrier["trace-id"] = event.options.traceId;
    event.carrier["span-id"] = event.options.spanId;
  });
  subscribe("@opentelemetry/api/propagation:extract", (event: any) => {
    event.options = {
      traceId: event.carrier["trace-id"],
      spanId: event.carrier["span-id"],
    };
  });
}

function startLogsSDK() {
  subscribe("@opentelemetry/api/logs:emitEvent", (event: any) => {
    if (!isLogsEnabled) {
      return; // skip logging if logs are disabled
    }
    console.log(`[${event.event.level}] ${event.event.message} - ${JSON.stringify(event.event.attributes)}`);
  });
  subscribe("@opentelemetry/api/logs:isEnabled", (event: any) => {
    event.isEnabled = isLogsEnabled;
  });
}

function startMetricsSDK() {
  // weak map to store meters and their instruments
  // if the meter is not used anymore, it will be garbage collected
  // implementation is intentionally incomplete for POC purposes
  // real impl would store different metric streams for each set of attributes
  const meters = new WeakMap();

  subscribe("@opentelemetry/api/metrics:counter:add", (event: any) => {
    console.log(
      `Counter "${event.meter.name}#${event.instrument.name}" incremented by ${event.value}`
    );
    if (!meters.has(event.meter)) {
      meters.set(event.meter, new WeakMap());
    }
    const meterMap = meters.get(event.meter);
    if (!meterMap.has(event.instrument)) {
      meterMap.set(event.instrument, 0);
    }
    const currentValue = meterMap.get(event.instrument);
    meterMap.set(event.instrument, currentValue + event.value);
    console.log(
      `Current value for "${event.meter.name}#${
        event.instrument.name
      }": ${meterMap.get(event.instrument)}`
    );
  });
  subscribe("@opentelemetry/api/metrics:histogram:record", (event: any) => {
    console.log(
      `Histogram "${event.meter.name}#${event.instrument.name}" recorded value ${event.value}`
    );
  });
}

function startTracingSDK() {
  subscribe("@opentelemetry/api/trace:startSpan", (event: any) => {
    console.log(
      `Span "${event.tracer.name}#${event.options.name}" started with attributes:`,
      event.options.attributes
    );
    event.span = {
      isRecording: true,
      context: {
        spanId: "span-id-placeholder", // placeholder for span ID
        traceFlags: 0, // default trace flags
        traceId: "trace-id-placeholder", // placeholder for trace ID
      },
      name: event.options.name || "nameless-span",
      attributes: event.options.attributes || {},
    };
  });
  subscribe("@opentelemetry/api/trace:endSpan", (event: any) => {
    console.log(`Span "${event.tracer.name}#${event.span.name}" ended`);
  });
}
