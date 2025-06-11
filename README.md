# API V2 Proof of Concept

This is an incomplete implementation of the OTel API using event-based communication with the SDK.

## No-op API without SDK

The API is fully self-contained.
Any objects received by the user come from the API only and not from the SDK.
When the user takes action on these objects, they emit events on a channel.
If there is no SDK, the events themselves have no effect.

Some methods, which require a response from the SDK, must mock those responses if none is received; See 2-way communication below.

## Extending the API


Incomplete SDK implementations which do not listen on a particular channel do not break the API.
Extensions to the API work by either adding a new channel, or adding a property to the event of an existing channel.

## 2-way communication

Because channel subscribers are run synchronously, the SDK can modify the event in order to communicate back to the API.
For example, when a span is started the SDK should modify the event to communicate information about the created span back to the API such as `isRecording` and the `SpanContext`.
If no span is returned by the SDK, values are assumed for these properties.

## Advantages

1. Code size is drastically reduced. There are no more `NOOP_*` classes or constants, no more namespacing (everything is simple functions), and no more use of `this` anywhere in the API.
2. All public surface is `types` and `interfaces` eliminating typescript version incompatibility with different versions of the same class implementations.
3. No more delegate tracers, meters, or loggers. As soon as the SDK starts listening to the channel it will begin receiving events.
   This results in a large code size and complexity reduction.
   It likely also results in a peformance improvement as there are no longer multiple layers of indirection.
4. API and SDK "shape" are no longer directly tied. SDK is free to store data in a more otlp-friendly way.

### Minification

Note that this does not represent exactly the savings because this API is not yet fully implemented, but it still shows a drastic improvement of `18.1KiB` (`76.4%`).

```
asset main.js 5.6 KiB [compared for emit] [minimized] (name: main)
modules by path ./build/src/*.js 10.1 KiB
  ./build/src/index.js 1.03 KiB [built] [code generated]
  ./build/src/channel.js 748 bytes [built] [code generated]
  ./build/src/context.js 1.17 KiB [built] [code generated]
  ./build/src/diag.js 802 bytes [built] [code generated]
  ./build/src/logs.js 1.02 KiB [built] [code generated]
  ./build/src/trace.js 5.39 KiB [built] [code generated]
modules by path ./build/src/metrics/*.js 5.02 KiB
  ./build/src/metrics/index.js 768 bytes [built] [code generated]
  ./build/src/metrics/counter.js 945 bytes [built] [code generated]
  ./build/src/metrics/gauge.js 942 bytes [built] [code generated]
  ./build/src/metrics/histogram.js 966 bytes [built] [code generated]
  ./build/src/metrics/observable_counter.js 861 bytes [built] [code generated]
  ./build/src/metrics/instrument.js 656 bytes [built] [code generated]
```

**Old API Webpack**

```
asset main.js 23.7 KiB [emitted] [minimized] (name: main)
runtime modules 221 bytes 1 module
modules by path ./build/src/trace/ 28.5 KiB 15 modules
modules by path ./build/src/*.js 12.2 KiB 7 modules
modules by path ./build/src/api/*.js 15.8 KiB 5 modules
modules by path ./build/src/baggage/ 6.53 KiB 4 modules
modules by path ./build/src/diag/ 7.92 KiB 4 modules
modules by path ./build/src/metrics/*.js 6.84 KiB 3 modules
modules by path ./build/src/context/*.js 3.45 KiB 2 modules
modules by path ./build/src/propagation/*.js 2.43 KiB 2 modules
modules by path ./build/src/internal/*.js 7.86 KiB 2 modules
modules by path ./build/src/platform/browser/*.js 2.34 KiB 2 modules
webpack 5.99.9 compiled successfully in 307 ms
```

## Open Questions

1. Is it more performant to do a `hasSubscribers` check before emitting an event, or simply to emit the event?
   Checking avoids allocating memory for the event object, leading me to suspect it is faster to branch and return early.
2. What's the best way to bridge the old API implementation?
   We can't assume every package and instrumentation in an application will be updated the new API.
   I think we need at least some period of at least 6-12 months where the SDK supports both _interchangeably_ and _interoperably_.
3. How deep do we want to go on interop?
   At least we want to make sure that if the end-user depends on a library which isn't yet updated, they can successfully use the new API.
   Do we also want to go the other direction?
   If they depend on a package that uses the new API but they're still using the old API for init, is it ok to drop that telemetry until the user updates their "main" API version?

## Possible interop ideas

1. A dummy SDK registered with the old API which calls the new API.
   Likely the SDK will have to register this dummy SDK itself with the old API.
2. SDK listens to both APIs. `ContextManager` MUST be shared between both APIs for context to behave correctly.
   This complicates the SDK but means users don't have to think about it at all.
3. Old API no-op implementation actually calls the new API instead of true no-op.
   This would require a minimum version of the 1.x API to be used, but seems to me to be the simplest option.
