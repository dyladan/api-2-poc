import { subscribe } from "./channels";
subscribe("@opentelemetry/api/diag", console.log);

import { createLogger } from "./logs";
import { createMeter } from "./metrics";
import { createTracer } from "./trace";

// Uncomment the following line to start the SDK
import { startSDK } from "./sdk";
startSDK();

const opts = {
  version: "1.0.0",
  schemaUrl: "https://example.com/my-logger-schema",
  attributes: {
    service: "my-service",
    environment: "production",
  },
};

const logger = createLogger({
  name: "my-logger",
  ...opts,
});

logger.emitEvent({
  level: "info",
  message: "Logger initialized successfully",
});

const tracer = createTracer({
  name: "my-tracer",
  ...opts,
});

const meter = createMeter({
  name: "my-meter",
  ...opts,
});

logger.emitEvent({
  level: "info",
  message: "Tracer and meter initialized",
});

if (!logger.isEnabled()) {
  console.warn("Logger is not enabled");
}

const span = tracer.startSpan({
  name: "my-span",
  attributes: {
    operation: "test-operation",
  },
});

const requests = meter.createCounter({
  name: "request_count",
  description: "Count of requests",
  unit: "requests",
  attributes: {
    endpoint: "/api/v1/resource",
    method: "GET",
  },
});

const events = meter.createCounter({
  name: "event_count",
});

const badCounter = (meter as any).createCounter({
  //   name: "counter_without_name",
  description: "Count of requests",
  unit: "requests",
  attributes: {
    endpoint: "/api/v1/resource",
    method: "GET",
  },
});

events.add(1);
events.add(3);
requests.add(5);
badCounter.add(7);
requests.add(11);
badCounter.add(13);

span.end();

logger.emitEvent({
  level: "info",
  message: "Span ended successfully",
});
