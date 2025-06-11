import { channel } from "../channel.js";
import type { Attributes } from "../types.ts";
import { createInstrument } from "./instrument.js";
import type {
  Counter,
  GaugeRecordEvent,
  InstrumentOptions,
  MeterOptions,
} from "./types.ts";

const ch = channel("metrics:counter:add");

export function createCounter(
  meter: MeterOptions,
  options: InstrumentOptions
): Counter {
  const instrument = createInstrument("counter", meter, options);

  if (!instrument) {
    return {
      add() {
        // No-op if instrument creation failed
      },
    };
  }

  // re-use event object to avoid allocation
  // also allows SDK to optimize lookups with weakmap
  const event: GaugeRecordEvent = {
    value: 0,
    instrument,
    meter,
  };

  return {
    add(value: number, attributes?: Attributes) {
      event.value = value;
      event.attributes = attributes;
      ch.publish(event);
    },
  };
}
