# OpenTelemetry API Channels Reference

This document describes the diagnostics channels and their events

## Channels Overview

### Self-Diagnostic Channel

- **@opentelemetry/api/diag**
  - **Events:** `{ level: "error" | "warn" | "info" | "debug" | "trace", message: string, body?: any }`
  - **Description:** Used for internal diagnostics and logging.

### Logs Channels

- **@opentelemetry/api/logs:emitEvent**
  - **Events:** `{ event: { level, message, attributes, timestamp }, logger }`
  - **Description:** Emitted when a log event is created.

- **@opentelemetry/api/logs:isEnabled**
  - **Events:** `{ logger, isEnabled }`
  - **Description:** Used to check if logging is enabled for a logger.

### Metrics Channels

- **@opentelemetry/api/metrics:counter:add**
  - **Events:** `{ value, instrument, meter, attributes, timestamp }`
  - **Description:** Emitted when a counter is incremented.

- **@opentelemetry/api/metrics:histogram:record**
  - **Events:** `{ value, instrument, meter, attributes, timestamp }`
  - **Description:** Emitted when a histogram records a value.

### Trace Channels

- **@opentelemetry/api/trace:startSpan**
  - **Events:** `{ span, tracer }`
  - **Description:** Emitted when a span is started.

- **@opentelemetry/api/trace:endSpan**
  - **Events:** `{ span, tracer }`
  - **Description:** Emitted when a span is ended.

- **@opentelemetry/api/trace:addAttribute**
  - **Events:** `{ span, tracer, key, value }`
  - **Description:** Emitted when an attribute is added to a span.

- **@opentelemetry/api/trace:setStatus**
  - **Events:** `{ span, tracer, status }`
  - **Description:** Emitted when a span's status is set.

- **@opentelemetry/api/trace:isEnabled**
  - **Events:** `{ enabled }`
  - **Description:** Used to check if tracing is enabled.

### Propagation Channels

- **@opentelemetry/api/propagation:inject**
  - **Events:** `{ carrier, spanContext }`
  - **Description:** Used to inject span context into a carrier.

- **@opentelemetry/api/propagation:extract**
  - **Events:** `{ carrier, spanContext }`
  - **Description:** Used to extract span context from a carrier.
