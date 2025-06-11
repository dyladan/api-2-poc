export type Context = {
  /**
   * Get a value from the context.
   *
   * @param key key which identifies a context value
   */
  getValue(key: symbol): unknown;

  /**
   * Create a new context which inherits from this context and has
   * the given key set to the given value.
   *
   * @param key context key for which to set the value
   * @param value value to set for the given key
   */
  setValue(key: symbol, value: unknown): Context;

  /**
   * Return a new context which inherits from this context but does
   * not contain a value for the given key.
   *
   * @param key context key for which to clear a value
   */
  deleteValue(key: symbol): Context;
};

/**
 * Get a key to uniquely identify a context value
 *
 * @since 1.0.0
 */
export function createContextKey(description: string) {
  // The specification states that for the same input, multiple calls should
  // return different keys. Due to the nature of the JS dependency management
  // system, this creates problems where multiple versions of some package
  // could hold different keys for the same property.
  //
  // Therefore, we use Symbol.for which returns the same key for the same input.
  return Symbol.for(description);
}

function Context(ctx: Map<symbol, unknown> = new Map()): Context {
  return {
    getValue: (key: symbol) => ctx.get(key),
    setValue: (key: symbol, value: unknown): Context => {
      return Context(new Map(ctx).set(key, value));
    },
    deleteValue: (key: symbol): Context => {
      const newCtx = new Map(ctx);
      newCtx.delete(key);
      return Context(newCtx);
    },
  };
}

/**
 * The root context is used as the default parent context when there is no active context
 *
 * @since 1.0.0
 */
export const ROOT_CONTEXT = Context();
