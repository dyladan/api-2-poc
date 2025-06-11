import { channel } from "../channel.js";
import type { Attributes } from "../types.ts";
import { createInstrument } from "./instrument.js";
import type { Gauge, GaugeRecordEvent, InstrumentOptions, MeterOptions } from "./types.ts";

const ch = channel("metrics:gauge:record");

export function createGauge(
  meter: MeterOptions,
  options: InstrumentOptions
): Gauge {
  const instrument = createInstrument("gauge", meter, options);
  if (!instrument) {
    return {
      record() {
        // No-op if instrument creation failed
      },
    };
  }

  // re-use event object to avoid allocation
  // also allows SDK to optimize lookups with weakmap
  const event: GaugeRecordEvent = {
    value: 0,
    instrument,
    meter,
  };

  return {
    record(value: number, attributes?: Attributes) {
      event.value = value;
      event.attributes = attributes;
      ch.publish(event);
    },
  };
}
