export type PromiseWithResolvers<T, K = Error> = Promise<T> & { resolve: (arg: T) => void; reject: (arg: K) => void };

export const deferred = <T, K = Error>() => {
  let resolve: (arg: T) => void;
  let reject: (arg: K) => void;

  const promise = new Promise((resolver, rejector) => {
    resolve = resolver;
    reject = rejector;
  }) as PromiseWithResolvers<T, K>;

  promise.resolve = arg => resolve(arg);

  promise.reject = (arg: K) => reject(arg);

  return promise as PromiseWithResolvers<T, K>;
};

export const sleep = (timeout = 1000) =>
  new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
