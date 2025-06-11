import { channel } from "../channels";
import { createInstrument } from "./instrument";
import type {
  ObservableCounter,
  InstrumentOptions,
  MeterOptions,
  ObservableCounterCallback,
} from "./types";

const ch = channel(
  "@opentelemetry/api/metrics:observable_counter:register_callback"
);

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
