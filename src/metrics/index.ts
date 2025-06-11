import { createCounter } from "./counter.js";
import { createGauge } from "./gauge.js";
import { createHistogram } from "./histogram.js";
import { createObservableCounter } from "./observable_counter.js";
import type { Meter, MeterOptions } from "./types.ts";

export type {
  Counter,
  CounterAddEvent,
  Gauge,
  GaugeRecordEvent,
  Histogram,
  HistogramRecordEvent,
  InstrumentDescriptor,
  InstrumentOptions,
  Meter,
  MeterOptions,
  NumberValueEvent,
  ObservableCounter,
  ObservableCounterCallback,
  RecordValueCallback,
} from "./types.ts";

export function getMeter(meterOptions: MeterOptions): Meter {
  const memoizeMetricFn =
    <T, K>(metricFn: (meterOptions: MeterOptions, metricOptions: T) => K) =>
    (metricOptions: T): K =>
      metricFn(meterOptions, metricOptions);
  return {
    createHistogram: memoizeMetricFn(createHistogram),
    createCounter: memoizeMetricFn(createCounter),
    createGauge: memoizeMetricFn(createGauge),
    createObservableCounter: memoizeMetricFn(createObservableCounter),
  };
}
