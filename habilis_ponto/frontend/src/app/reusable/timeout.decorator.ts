/**
 * Decorador que encapsula a função em um timeout
 * @param time - Tempo de expera para o timeout
 */
function timeout(time = 0) {
  // tslint:disable-next-line:only-arrow-functions
  return function(target: object, key: string | symbol, descriptor: PropertyDescriptor) {
    const orig = descriptor.value;
    descriptor.value = function(...args: any[]) {
      setTimeout(() => {
        orig.apply(this, args);
      }, time);
    };

  };
}
