import { createCounter } from "./counter";
import type { InstrumentOptions, Meter, MeterOptions } from "./types";

export function getMeter(meterOptions: MeterOptions): Meter {
  return {
    createCounter(options: InstrumentOptions) {
      return createCounter(meterOptions, options);
    },
  };
}
