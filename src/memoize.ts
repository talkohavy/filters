/**
 * Memoization utility for filter functions
 * Caches results for identical items and filter schemes
 */
function memoizeFilter(fn: (item: any) => boolean): (item: any) => boolean {
  const cache = new WeakMap<object, Map<string, boolean>>();
  return (item: any) => {
    if (typeof item !== 'object' || item === null) {
      // Only memoize for objects
      return fn(item);
    }
    let itemCache = cache.get(item);
    if (!itemCache) {
      itemCache = new Map();
      cache.set(item, itemCache);
    }
    // Use JSON.stringify of the function as a cache key (works for static filter functions)
    const key = fn.toString();
    if (itemCache.has(key)) {
      return itemCache.get(key)!;
    }
    const result = fn(item);
    itemCache.set(key, result);
    return result;
  };
}

export { memoizeFilter };
