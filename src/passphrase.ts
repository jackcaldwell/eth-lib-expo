import * as Hash from './hash';
import * as Bytes from './bytes';
import * as Desubits from './desubits';

// Bytes -> Bytes
const bytesAddChecksum = (bytes: string): string => {
  const hash = Hash.keccak256(bytes);
  const sum = Bytes.slice(0, 1, hash);
  return Bytes.concat(bytes, sum);
};

// Bytes -> Bool
const bytesChecksum = (bytes: string): boolean => {
  const length = Bytes.length(bytes);
  const prefix = Bytes.slice(0, length - 1, bytes);
  return bytesAddChecksum(prefix) === bytes;
};

// () ~> Passphrase
const create = async (): Promise<string> => {
  const bytes = bytesAddChecksum(await Bytes.random(11));
  const seed = Desubits.fromBytes(bytes);
  const passphrase = seed.replace(/([a-z]{8})/g, '$1 ');
  return passphrase;
};

// Passphrase -> Bytes
const toBytes = (passphrase: string): string => {
  const bytes = Desubits.toBytes(passphrase);
  return bytes;
};

// Passphrase -> Bool
const checksum = (passphrase: string): boolean =>
  bytesChecksum(toBytes(passphrase));

// Passphrase -> Bytes
const toMasterKey = (passphrase: string): string => {
  let hash = Hash.keccak256;
  let bytes = toBytes(passphrase);
  for (let i = 0, l = Math.pow(2, 12); i < l; ++i) bytes = hash(bytes);
  return bytes;
};

export { create, checksum, toMasterKey };
