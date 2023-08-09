import AssetFingerprint from '@emurgo/cip14-js';
export const asOpenswapTokenId = yoroiTokenId => {
  const [policyId = '', assetName = ''] = yoroiTokenId.split('.');
  return {
    policyId,
    assetName
  };
};
export const asYoroiTokenId = _ref => {
  let {
    policyId,
    name
  } = _ref;
  if (policyId === '') return '';
  return `${policyId}.${name}`;
};
export const asOpenswapAmount = yoroiAmount => {
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
export const asYoroiOrder = openswapOrder => {
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

export const asYoroiBalanceToken = openswapToken => {
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
export const asYoroiPool = openswapPool => {
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
export const asYoroiAmount = openswapAmount => {
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
export const asYoroiPools = openswapPools => openswapPools.map(asYoroiPool);
export const asYoroiBalanceTokens = openswapTokens => openswapTokens.map(asYoroiBalanceToken);
export const asYoroiOrders = openswapOrders => openswapOrders.map(asYoroiOrder);

// TODO: later replace for @yoroi/utils
export const asTokenFingerprint = _ref2 => {
  let {
    policyId,
    assetNameHex = ''
  } = _ref2;
  const assetFingerprint = AssetFingerprint.fromParts(Buffer.from(policyId, 'hex'), Buffer.from(assetNameHex, 'hex'));
  return assetFingerprint.fingerprint();
};
export const asUtf8 = hex => Buffer.from(hex, 'hex').toString('utf-8');
//# sourceMappingURL=transformers.js.map