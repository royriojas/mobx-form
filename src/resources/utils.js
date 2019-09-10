export const deferred = () => {
  let resolve;
  let reject;

  const promise = new Promise((resolver, rejector) => {
    resolve = resolver;
    reject = rejector;
  });

  promise.resolve = arg => resolve(arg);

  promise.reject = arg => reject(arg);

  return promise;
};

export const sleep = (timeout = 1000) =>
  new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
