# API V2 Proof of Concept

> [!IMPORTANT]  
> This is a proof of concept only.
> It should not be considered official in any capacity.
> It is not meant to be a complete implementation, but to show what is achievable if we leave certain assumptions behind.
> It is not backwards compatible with the existing API or SDK.

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

### True Double-Emit ESM and CJS

Makes use of typescript composite projects to emit standards-compliant ESM as well as CommonJS.
This also yields minification improvements below.

### Webpack Bundling

Loading the entire API as a single minified and bundled file significantly reduces the impact on application start time.
CJS and ESM bundles both included in the NPM package.

### Minification-friendliness

Several of the improvements above such as no classes, no `this`, and no namespacing mean this version minifies significantly more efficiently than the current production API.
Note that this does not represent exactly the savings because this API is not yet fully implemented, but it still shows a `85%` improvement of `20.25KiB`.

```
asset index.js 3.45 KiB [emitted] [javascript module] [minimized] (name: main)
orphan modules 12.2 KiB [orphan] 11 modules
./build/esm/index.js + 11 modules 12.4 KiB [built] [code generated]
webpack 5.99.9 compiled successfully in 178 ms

asset index.cjs 3.83 KiB [emitted] [minimized] (name: main)
orphan modules 12.2 KiB [orphan] 11 modules
runtime modules 670 bytes 3 modules
./build/esm/index.js + 11 modules 12.4 KiB [built] [code generated]
webpack 5.99.9 compiled successfully in 163 ms
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
