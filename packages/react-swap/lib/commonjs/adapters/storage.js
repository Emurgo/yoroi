"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeSwapStorage = makeSwapStorage;
exports.swapStorageSlippageKey = void 0;
var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const initialDeps = {
  storage: _asyncStorage.default
};
function makeSwapStorage() {
  let deps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialDeps;
  const {
    storage
  } = deps;
  const slippage = {
    save: newSlippage => storage.setItem(swapStorageSlippageKey, JSON.stringify(newSlippage)),
    read: () => storage.getItem(swapStorageSlippageKey).then(value => parseNumber(value) ?? 0),
    remove: () => storage.removeItem(swapStorageSlippageKey),
    key: swapStorageSlippageKey
  };
  const clear = async () => {
    await Promise.all([storage.removeItem(swapStorageSlippageKey)]);
  };
  return {
    slippage,
    clear
  };
}
const swapStorageSlippageKey = 'swap-slippage';

// * === UTILS ===
// * NOTE copied from utils it should be imported from utils package later
exports.swapStorageSlippageKey = swapStorageSlippageKey;
const parseNumber = data => {
  const parsed = parseSafe(data);
  return isNumber(parsed) ? parsed : undefined;
};
const parseSafe = text => {
  try {
    return JSON.parse(text);
  } catch (_) {
    return undefined;
  }
};
const isNumber = data => typeof data === 'number' && !Number.isNaN(data) && Number.isFinite(data);
//# sourceMappingURL=storage.js.map