const times = (n: number, f: Function, x: number): number => {
  for (let i = 0; i < n; ++i) {
    x = f(x);
  }
  return x;
};

export { times };
