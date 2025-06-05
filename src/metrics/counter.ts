import { channel } from "../channels";
import type { Attributes } from "../types";
import { createInstrument } from "./instrument";
import type { Counter, InstrumentOptions, MeterOptions } from "./types";

const ch = channel(`@opentelemetry/api/metrics:counter:add`);

export function createCounter(
  meter: MeterOptions,
  options: InstrumentOptions
): Counter {
  const instrument = createInstrument("counter", meter, options);

  if (!instrument) {
    return {
      add: () => {
        // No-op if instrument creation failed
      },
    };
  }

  return {
    add(value: number, attributes: Attributes = {}) {
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
