// const Bytes = require('./bytes');
// const Nat = require('./nat');
// const elliptic = require('elliptic');
// const rlp = require('./rlp');
// const secp256k1 = new elliptic.ec('secp256k1'); // eslint-disable-line
// const { keccak256, keccak256s } = require('./hash');

import * as Bytes from './bytes';
import { keccak256, keccak256s } from './hash';
import * as Nat from './nat';

const toChecksum = (address: string): string => {
  const addressHash = keccak256s(address.slice(2));
  let checksumAddress = '0x';
  for (let i = 0; i < 40; i++)
    checksumAddress +=
      parseInt(addressHash[i + 2], 16) > 7
        ? address[i + 2].toUpperCase()
        : address[i + 2];
  return checksumAddress;
};

interface Account {
  address: string;
  privateKey: string;
}

const fromPrivate = (privateKey: string): Account => {
  const buffer = new Buffer(privateKey.slice(2), 'hex');
  const ecKey = secp256k1.keyFromPrivate(buffer);
  const publicKey = '0x' + ecKey.getPublic(false, 'hex').slice(2);
  const publicHash = keccak256(publicKey);
  const address = toChecksum('0x' + publicHash.slice(-40));
  return {
    address: address,
    privateKey: privateKey,
  };
};

const create = async (entropy: string): Promise<Account> => {
  const innerHex = keccak256(
    Bytes.concat(await Bytes.random(32), entropy || (await Bytes.random(32)))
  );
  const middleHex = Bytes.concat(
    Bytes.concat(await Bytes.random(32), innerHex),
    await Bytes.random(32)
  );
  const outerHex = keccak256(middleHex);
  return fromPrivate(outerHex);
};

const encodeSignature = ([v, r, s]: string[]): string =>
  Bytes.flatten([r, s, v]);

const decodeSignature = (hex: string): string[] => [
  Bytes.slice(64, Bytes.length(hex), hex),
  Bytes.slice(0, 32, hex),
  Bytes.slice(32, 64, hex),
];

const makeSigner = (addToV: number): Function => (
  hash: string,
  privateKey: string
): string => {
  const signature = secp256k1
    .keyFromPrivate(new Buffer(privateKey.slice(2), 'hex'))
    .sign(new Buffer(hash.slice(2), 'hex'), { canonical: true });
  return encodeSignature([
    Nat.fromString(Bytes.fromNumber(addToV + signature.recoveryParam)),
    Bytes.pad(32, Bytes.fromNat('0x' + signature.r.toString(16))),
    Bytes.pad(32, Bytes.fromNat('0x' + signature.s.toString(16))),
  ]);
};

const sign = makeSigner(27); // v=27|28 instead of 0|1...

const recover = (hash: string, signature: string): string => {
  const vals = decodeSignature(signature);
  const vrs = {
    v: Bytes.toNumber(vals[0]),
    r: vals[1].slice(2),
    s: vals[2].slice(2),
  };
  const ecPublicKey = secp256k1.recoverPubKey(
    new Buffer(hash.slice(2), 'hex'),
    vrs,
    vrs.v < 2 ? vrs.v : 1 - (vrs.v % 2)
  ); // because odd vals mean v=0... sadly that means v=0 means v=1... I hate that
  const publicKey = '0x' + ecPublicKey.encode('hex', false).slice(2);
  const publicHash = keccak256(publicKey);
  const address = toChecksum('0x' + publicHash.slice(-40));
  return address;
};

export {
  create,
  toChecksum,
  fromPrivate,
  sign,
  makeSigner,
  recover,
  encodeSignature,
  decodeSignature,
};
