"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asYoroiTokenId = exports.asYoroiPools = exports.asYoroiPool = exports.asYoroiOrders = exports.asYoroiOrder = exports.asYoroiBalanceTokens = exports.asYoroiBalanceToken = exports.asYoroiAmount = exports.asUtf8 = exports.asTokenFingerprint = exports.asOpenswapTokenId = exports.asOpenswapAmount = void 0;
var _cip14Js = _interopRequireDefault(require("@emurgo/cip14-js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const asOpenswapTokenId = yoroiTokenId => {
  const [policyId = '', assetName = ''] = yoroiTokenId.split('.');
  return {
    policyId,
    assetName
  };
};
exports.asOpenswapTokenId = asOpenswapTokenId;
const asYoroiTokenId = _ref => {
  let {
    policyId,
    name
  } = _ref;
  if (policyId === '') return '';
  return `${policyId}.${name}`;
};
exports.asYoroiTokenId = asYoroiTokenId;
const asOpenswapAmount = yoroiAmount => {
  const {
    tokenId,
    quantity: amount
  } = yoroiAmount;
  const {
    policyId,
    assetName
  } = asOpenswapTokenId(tokenId);
  return {
    amount,
    assetName,
    policyId
  };
};
exports.asOpenswapAmount = asOpenswapAmount;
const asYoroiOrder = openswapOrder => {
  const {
    from,
    to,
    deposit,
    ...rest
  } = openswapOrder;
  return {
    ...rest,
    from: asYoroiAmount(from),
    to: asYoroiAmount(to),
    // TODO: initialize the module with the primary token
    deposit: asYoroiAmount({
      amount: deposit,
      token: ''
    }) // token = wallet.primaryTokenInfo['id']
  };
};
exports.asYoroiOrder = asYoroiOrder;
const asYoroiBalanceToken = openswapToken => {
  const {
    info,
    price
  } = openswapToken;
  const balanceToken = {
    info: {
      id: asYoroiTokenId(info.address),
      group: info.address.policyId,
      fingerprint: asTokenFingerprint({
        policyId: info.address.policyId,
        assetNameHex: info.address.name
      }),
      name: asUtf8(info.address.name),
      decimals: info.decimalPlaces,
      description: info.description,
      image: info.image,
      kind: 'ft',
      symbol: info.symbol,
      icon: undefined,
      ticker: undefined,
      metadatas: {}
    },
    price: {
      ...price
    },
    status: info.status,
    supply: {
      ...info.supply
    }
  };
  return balanceToken;
};
exports.asYoroiBalanceToken = asYoroiBalanceToken;
const asYoroiPool = openswapPool => {
  const {
    batcherFee,
    fee,
    deposit,
    lpToken,
    tokenA,
    tokenB,
    timestamp,
    provider,
    price,
    poolId
  } = openswapPool;
  const pool = {
    batcherFee: asYoroiAmount(batcherFee),
    fee: asYoroiAmount({
      amount: fee.toString(),
      token: ''
    }),
    deposit: asYoroiAmount({
      amount: deposit.toString(),
      token: ''
    }),
    lpToken: asYoroiAmount(lpToken),
    tokenA: asYoroiAmount(tokenA),
    tokenB: asYoroiAmount(tokenB),
    lastUpdate: timestamp,
    provider,
    price,
    poolId
  };
  return pool;
};
exports.asYoroiPool = asYoroiPool;
const asYoroiAmount = openswapAmount => {
  const {
    amount,
    token
  } = openswapAmount;
  const [assetName = '', policyId = ''] = token.split('.');
  const subject = `${assetName}.${policyId}`;
  return {
    quantity: amount,
    tokenId: subject.length === 1 ? '' : subject
  };
};
exports.asYoroiAmount = asYoroiAmount;
const asYoroiPools = openswapPools => openswapPools.map(asYoroiPool);
exports.asYoroiPools = asYoroiPools;
const asYoroiBalanceTokens = openswapTokens => openswapTokens.map(asYoroiBalanceToken);
exports.asYoroiBalanceTokens = asYoroiBalanceTokens;
const asYoroiOrders = openswapOrders => openswapOrders.map(asYoroiOrder);

// TODO: later replace for @yoroi/utils
exports.asYoroiOrders = asYoroiOrders;
const asTokenFingerprint = _ref2 => {
  let {
    policyId,
    assetNameHex = ''
  } = _ref2;
  const assetFingerprint = _cip14Js.default.fromParts(Buffer.from(policyId, 'hex'), Buffer.from(assetNameHex, 'hex'));
  return assetFingerprint.fingerprint();
};
exports.asTokenFingerprint = asTokenFingerprint;
const asUtf8 = hex => Buffer.from(hex, 'hex').toString('utf-8');
exports.asUtf8 = asUtf8;
//# sourceMappingURL=transformers.js.map