export const getCnsCryptoAddress = async _receiverDomain => {
  if (_receiverDomain === 'javibueno.blockchain') {
    return Promise.resolve('addr1qxzq9xdegwl9kejevt37zlj680497nltz5e6t7a0ctk8p2x0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwqr9he6q');
  }
  return Promise.reject('not-implemented');
};
//# sourceMappingURL=cns.js.map