import { channel } from "../channel.js";
import { createInstrument } from "./instrument.js";
import type {
  ObservableCounter,
  InstrumentOptions,
  MeterOptions,
  ObservableCounterCallback,
} from "./types.ts";

const ch = channel("metrics:observable_counter:register_callback");

export function createObservableCounter(
  meter: MeterOptions,
  options: InstrumentOptions
): ObservableCounter {
  const instrument = createInstrument("ObservableCounter", meter, options);
  if (!instrument) {
    return {
      // invalid instruments never call their callbacks
      registerCallback() {},
    };
  }
  return {
    registerCallback(callback: ObservableCounterCallback): void {
      ch.publish({
        callback,
        instrument,
        meter,
      });
    },
  };
}
