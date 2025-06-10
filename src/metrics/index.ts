import { createCounter } from "./counter";
import { createGauge } from "./gauge";
import { createHistogram } from "./histogram";
import { createObservableCounter } from "./observable_counter";
import type { Meter, MeterOptions } from "./types";

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
} from "./types";

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
