const generate = (num: number, fn: Function): unknown[] => {
  let a = [];
  for (var i = 0; i < num; ++i) a.push(fn(i));
  return a;
};

const replicate = (num: number, val: unknown): unknown[] =>
  generate(num, () => val);

const concat = (a: unknown[], b: unknown[]): unknown[] => a.concat(b);

const flatten = (a: unknown[][]): unknown[] => {
  let r = [];
  for (let j = 0, J = a.length; j < J; ++j)
    for (let i = 0, I = a[j].length; i < I; ++i) r.push(a[j][i]);
  return r;
};

const chunksOf = (n: number, a: unknown[]): unknown[] => {
  let b = [];
  for (let i = 0, l = a.length; i < l; i += n) b.push(a.slice(i, i + n));
  return b;
};

export { generate, replicate, concat, flatten, chunksOf };
