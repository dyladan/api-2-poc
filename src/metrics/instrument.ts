import { error } from "../diag.js";
import type { InstrumentDescriptor, InstrumentOptions, MeterOptions } from "./types.ts";

export function createInstrument<T extends string>(
  type: T,
  meter: MeterOptions,
  options: InstrumentOptions
): InstrumentDescriptor | undefined {
  if (!options.name) {
    error(`Instrument name is required`, {
      type,
      meter,
      options,
    });
    return undefined;
  }
  return {
    name: options.name,
    description: options.description || "",
    unit: options.unit || "1", // Default unit if not provided
    attributes: options.attributes || {},
    type,
  };
}
