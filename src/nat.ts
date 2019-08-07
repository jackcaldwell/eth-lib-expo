import BN from 'bn.js';
import * as Bytes from './bytes';

const fromBN = (bn: BN): string => '0x' + bn.toString('hex');

const toBN = (str: string): BN => new BN(str.slice(2), 16);

const bin = (method: 'add' | 'mul' | 'div' | 'sub'): Function => (
  a: string,
  b: string
): string => fromBN(toBN(a)[method](toBN(b)));

const add = bin('add');
const mul = bin('mul');
const div = bin('div');
const sub = bin('sub');

const fromString = (str: string): string => {
  const bn =
    '0x' +
    (str.slice(0, 2) === '0x'
      ? new BN(str.slice(2), 16)
      : new BN(str, 10)
    ).toString('hex');
  return bn === '0x0' ? '0x' : bn;
};

const toNumber = (a: string): number => toBN(a).toNumber();

const toEther = (wei: number): number =>
  toNumber(div(wei, fromString('10000000000'))) / 100000000;

const fromNumber = (a: number): string =>
  typeof a === 'string'
    ? /^0x/.test(a)
      ? a
      : '0x' + a
    : '0x' + new BN(a).toString('hex');

const fromEther = (eth: number): string =>
  mul(fromNumber(Math.floor(eth * 100000000)), fromString('10000000000'));

const toString = (a: string): string => toBN(a).toString(10);

const toUint256 = (a: string): string => Bytes.pad(32, a);

export {
  toString,
  fromString,
  toNumber,
  fromNumber,
  toEther,
  fromEther,
  toUint256,
  add,
  mul,
  div,
  sub,
};
