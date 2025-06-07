import { Attributes } from "../types";

export type Meter = {
  createCounter: (options: InstrumentOptions) => Counter;
  createGauge: (options: InstrumentOptions) => Gauge;
  createHistogram: (options: InstrumentOptions) => Histogram;
  createObservableCounter: (options: InstrumentOptions) => ObservableCounter;
};

export type MeterOptions = {
  name: string;
  version?: string;
  schemaUrl?: string;
  attributes?: Attributes;
};

export type Counter = {
  add: (value: number, attributes?: Attributes) => void;
};

export type Gauge = {
  record: (value: number, attributes?: Attributes) => void;
};

export type ObservableCounter = {
  registerCallback: (callback: ObservableCounterCallback) => void;
};

export type ObservableCounterCallback = (record: RecordValueCallback) => void;

export type RecordValueCallback = (
  value: number,
  attributes?: Attributes
) => void;

export type InstrumentOptions = {
  name: string;
  attributes?: Attributes;
  unit?: string;
  description?: string;
  type?: string;
};

export type Histogram = {
  record: (value: number, attributes?: Attributes) => void;
};

export type GaugeRecordEvent = NumberValueEvent
export type HistogramRecordEvent = NumberValueEvent
export type CounterAddEvent = NumberValueEvent;

export type NumberValueEvent = {
  value: number;
  instrument: InstrumentDescriptor;
  meter: MeterOptions;
  attributes?: Attributes;
};

export type InstrumentDescriptor = {
  name: string;
  description: string;
  unit: string;
  attributes: Attributes;
  type: string;
};
