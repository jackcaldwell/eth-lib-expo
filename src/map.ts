interface KeyedObject {
  [key: string]: number;
}

const merge = (a: KeyedObject): Function => (b: KeyedObject): KeyedObject => {
  let c: { [key: string]: number } = {};
  for (let key in a) c[key] = a[key];
  for (let key in b) c[key] = b[key];
  return c;
};

const remove = (removeKey: string): Function => (a: {
  [key: string]: number;
}): KeyedObject => {
  let b: { [key: string]: number } = {};
  for (let key in a) if (key !== removeKey) b[key] = a[key];
  return b;
};

export { merge, remove };
