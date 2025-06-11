import { channel } from "../channel.js";
import type { Attributes } from "../types.ts";
import { createInstrument } from "./instrument.js";
import type {
  Histogram,
  HistogramRecordEvent,
  InstrumentOptions,
  MeterOptions,
} from "./types.ts";

const ch = channel("metrics:histogram:record");

export function createHistogram(
  meter: MeterOptions,
  options: InstrumentOptions
): Histogram {
  const instrument = createInstrument("histogram", meter, options);
  if (!instrument) {
    return {
      record() {
        // No-op if instrument creation failed
      },
    };
  }

  // re-use event object to avoid allocation
  // also allows SDK to optimize lookups with weakmap
  const event: HistogramRecordEvent = {
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
