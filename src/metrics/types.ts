import { Attributes } from "../types";

export type Meter = {
  createCounter: (options: InstrumentOptions) => Counter;
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
