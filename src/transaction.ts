import * as Account from './account';
import * as Nat from './nat';
import * as Bytes from './bytes';
import * as RLP from './rlp';

const keccak256 = require('./hash').keccak256;

interface Transaction {
  nonce: string;
  gasPrice: string;
  gas: string;
  value: string;
  chainId: string;
  to: string;
  data: string;
  from: string;
}

// EthereumRPC, IncompleteTransaction -> Promise Transaction
const addDefaults = (rpc: Function, tx: Transaction): Promise<Transaction> => {
  var baseDefaults = [
    tx.chainId || rpc('net_version', []),
    tx.gasPrice || rpc('eth_gasPrice', []),
    tx.nonce || rpc('eth_getTransactionCount', [tx.from, 'latest']),
    tx.value || '0x0',
    tx.data || '0x',
  ];
  const noAddress = (address: string): boolean =>
    !address || address === '' || address === '0x';
  return Promise.all(baseDefaults).then(
    ([chainIdNum, gasPrice, nonce, value, data]) => {
      var chainId = Nat.fromNumber(chainIdNum);
      var gasEstimator = tx.gas
        ? Promise.resolve(null)
        : rpc('eth_estimateGas', [
            {
              from: noAddress(tx.from) ? null : tx.from,
              to: noAddress(tx.to) ? null : tx.to,
              value: tx.value,
              nonce: tx.nonce,
              data: tx.data,
            },
          ]);
      return gasEstimator.then((gasEstimate: { error: string }) => {
        if (gasEstimate.error) {
          throw gasEstimate.error;
        }
        return {
          chainId: chainId,
          from: noAddress(tx.from) ? '0x' : tx.from.toLowerCase(),
          to: noAddress(tx.to) ? '0x' : tx.to.toLowerCase(),
          gasPrice: gasPrice,
          gas: tx.gas ? tx.gas : Nat.div(Nat.mul(gasEstimate, '0x6'), '0x5'),
          nonce: nonce,
          value: value,
          data: data ? data.toLowerCase() : null,
        };
      });
    }
  );
};

// Transaction -> Bytes
const signingData = (tx: Transaction): string => {
  return RLP.encode([
    Bytes.fromNat(tx.nonce),
    Bytes.fromNat(tx.gasPrice),
    Bytes.fromNat(tx.gas),
    tx.to ? tx.to.toLowerCase() : '0x',
    Bytes.fromNat(tx.value),
    tx.data,
    Bytes.fromNat(tx.chainId || '0x1'),
    '0x',
    '0x',
  ]);
};

// Transaction, Account -> Bytes
const sign = (tx: Transaction, account: Account.AccountInterface): string => {
  const data = signingData(tx);
  const signature = Account.makeSigner(
    Nat.toNumber(tx.chainId || '0x1') * 2 + 35
  )(keccak256(data), account.privateKey);
  const rawTransaction = RLP.decode(data)
    .slice(0, 6)
    .concat(...Account.decodeSignature(signature));
  return RLP.encode(rawTransaction);
};

// Bytes -> Address
const recover = (rawTransaction: string): string => {
  const values = RLP.decode(rawTransaction);
  const signature = Account.encodeSignature(values.slice(6, 9));
  const recovery = Bytes.toNumber(values[6]);
  const extraData: string | string[] =
    recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), '0x', '0x'];
  const data = values.slice(0, 6).concat(...extraData);
  const dataHex = RLP.encode(data);
  return Account.recover(keccak256(dataHex), signature);
};

module.exports = {
  addDefaults,
  signingData,
  sign,
  recover,
};
