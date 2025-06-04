import { subscribe } from "diagnostics_channel";

const isLogsEnabled = true; // POC: set false to disable logs

export function startSDK() {
  // weak map to store meters and their instruments
  // if the meter is not used anymore, it will be garbage collected
  // implementation is intentionally incomplete for POC purposes
  // real impl would store different metric streams for each set of attributes
  const meters = new WeakMap();

  subscribe("otel:tracing:startSpan", (event: any) => {
    console.log(
      `Span "${event.tracer.name}#${event.span.name}" started with attributes:`,
      event.span.attributes
    );
  });
  subscribe("otel:tracing:endSpan", (event: any) => {
    console.log(
      `Span "${event.tracer.name}#${event.span.name}" ended with attributes:`,
      event.span.attributes
    );
  });
  subscribe("otel:tracing:isEnabled", (event: any) => {
    event.enabled = true; // always enabled for POC
  });
  subscribe("otel:metrics:counter:add", (event: any) => {
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
  subscribe("otel:metrics:histogram:record", (event: any) => {
    console.log(
      `Histogram "${event.meter.name}#${event.instrument.name}" recorded value ${event.value}`
    );
  });
  subscribe("otel:logs:emitEvent", (event: any) => {
    if (!isLogsEnabled) {
      return; // skip logging if logs are disabled
    }
    console.log(
      `Log event emitted by "${event.logger.name}": ${event.event.message}`,
      event.event.attributes
    );
  });
  subscribe("otel:logs:isEnabled", (event: any) => {
    event.isEnabled = isLogsEnabled;
  });
}
