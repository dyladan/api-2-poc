import { createCounter } from "./counter";
import { createGauge } from "./gauge";
import { createHistogram } from "./histogram";
import { createObservableCounter } from "./observable_counter";
import type { InstrumentOptions, Meter, MeterOptions } from "./types";

export function getMeter(meterOptions: MeterOptions): Meter {
  return {
    createHistogram(options: InstrumentOptions) {
      return createHistogram(meterOptions, options);
    },
    createCounter(options: InstrumentOptions) {
      return createCounter(meterOptions, options);
    },
    createGauge(options: InstrumentOptions) {
      return createGauge(meterOptions, options);
    },
    createObservableCounter(options: InstrumentOptions) {
      return createObservableCounter(meterOptions, options);
    },
  };
}
