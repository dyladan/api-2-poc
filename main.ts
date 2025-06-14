// import from root or from a specific API module
import { subscribe } from "api-2";
import { getLogger } from "api-2/logs";
import { getMeter } from "api-2/metrics";
import { getTracer } from "api-2/trace";
subscribe("diag", console.log);

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

const logger = getLogger({
  name: "my-logger",
  ...opts,
});

logger.emitEvent({
  level: "info",
  message: "Logger initialized successfully",
});

const tracer = getTracer({
  name: "my-tracer",
  ...opts,
});

const meter = getMeter({
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

const badCounter = meter.createCounter({
  // @ts-expect-error counter without name to test error handling
  name: undefined,
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
