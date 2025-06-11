import { channel } from "../channel";
import type { Attributes } from "../types";
import { createInstrument } from "./instrument";
import type {
  Counter,
  GaugeRecordEvent,
  InstrumentOptions,
  MeterOptions,
} from "./types";

const ch = channel(`@opentelemetry/api/metrics:counter:add`);

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
