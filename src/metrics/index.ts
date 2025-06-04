import { createCounter } from "./counter";
import type { Meter, MeterOptions, InstrumentOptions } from "./types";

export function createMeter(meterOptions: MeterOptions): Meter {
  return {
    createCounter(options: InstrumentOptions) {
      return createCounter(meterOptions, options);
    },
  };
}
