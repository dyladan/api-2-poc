import { createCounter } from "./counter";
import type { InstrumentOptions, Meter, MeterOptions } from "./types";

export function createMeter(meterOptions: MeterOptions): Meter {
  return {
    createCounter(options: InstrumentOptions) {
      return createCounter(meterOptions, options);
    },
  };
}
