import { channel } from "diagnostics_channel";
import type { Attributes } from "../types";
import { createInstrument } from "./instrument";
import type { Histogram, InstrumentOptions, MeterOptions } from "./types";

const ch = channel("otel:metrics:histogram:record");

export function createHistogram(
  meter: MeterOptions,
  options: InstrumentOptions
): Histogram {
  const instrument = createInstrument("histogram", meter, options);
  if (!instrument) {
    return {
      record: () => {
        // No-op if instrument creation failed
      },
    };
  }
  return {
    record(value: number, attributes: Attributes = {}) {
      ch.publish({
        value,
        instrument,
        meter,
        attributes,
        timestamp: Date.now(),
      });
    },
  };
}