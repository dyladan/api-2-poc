import { channel } from "../channels";
import type { Attributes } from "../types";
import { createInstrument } from "./instrument";
import type {
  Histogram,
  HistogramRecordEvent,
  InstrumentOptions,
  MeterOptions,
} from "./types";

const ch = channel("@opentelemetry/api/metrics:histogram:record");

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
