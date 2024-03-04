"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BanxaUrlReferralQueryStringParamsSchema = void 0;
var _zod = require("zod");
var _coinTypes = require("../helpers/coin-types");
var _fiatTypes = require("../helpers/fiat-types");
var _walletAddress = require("../helpers/wallet-address");
var _blockchainCode = require("../helpers/blockchain-code");
var _orderTypes = require("../helpers/order-types");
var _theme = require("../helpers/theme");
const BanxaUrlReferralQueryStringParamsSchema = _zod.z.object({
  orderType: _zod.z.string().refine(_orderTypes.banxaIsOrderType).optional(),
  fiatType: _zod.z.string().refine(_fiatTypes.banxaIsFiatType),
  fiatAmount: _zod.z.number().optional(),
  coinType: _zod.z.string().refine(_coinTypes.banxaIsCoinType),
  coinAmount: _zod.z.number().optional(),
  blockchain: _zod.z.string().refine(_blockchainCode.banxaIsBlockchainCode).optional(),
  walletAddress: _zod.z.string(),
  walletAddressTag: _zod.z.string().optional(),
  backgroundColor: _zod.z.string().optional(),
  primaryColor: _zod.z.string().optional(),
  secondaryColor: _zod.z.string().optional(),
  textColor: _zod.z.string().optional(),
  theme: _zod.z.string().refine(_theme.banxaIsTheme).optional(),
  returnUrl: _zod.z.string().optional()
}).refine(data => {
  return (data.coinType === 'ADA' || data.coinType === 'TADA') && (0, _walletAddress.banxaIsPossibleCardanoAddress)(data.walletAddress);
});
exports.BanxaUrlReferralQueryStringParamsSchema = BanxaUrlReferralQueryStringParamsSchema;
//# sourceMappingURL=zod-schema.js.map