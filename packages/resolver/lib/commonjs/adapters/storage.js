"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseBoolean = exports.isBoolean = void 0;
exports.resolverStorageMaker = resolverStorageMaker;
exports.resolverStorageNoticedKey = void 0;
var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const initialDeps = {
  storage: _asyncStorage.default
};
function resolverStorageMaker() {
  let deps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialDeps;
  const {
    storage
  } = deps;
  const notice = {
    save: newNoticed => storage.setItem(resolverStorageNoticedKey, JSON.stringify(newNoticed)),
    read: () => storage.getItem(resolverStorageNoticedKey).then(value => parseBoolean(value) ?? false),
    remove: () => storage.removeItem(resolverStorageNoticedKey),
    key: resolverStorageNoticedKey
  };
  const clear = async () => {
    await Promise.all([storage.removeItem(resolverStorageNoticedKey)]);
  };
  return {
    notice,
    clear
  };
}
const resolverStorageNoticedKey = 'resolver-notice';

// * === UTILS ===
// * NOTE copied from utils it should be imported from utils package later
exports.resolverStorageNoticedKey = resolverStorageNoticedKey;
const parseBoolean = data => {
  const parsed = parseSafe(data);
  return isBoolean(parsed) ? parsed : undefined;
};
exports.parseBoolean = parseBoolean;
const parseSafe = text => {
  try {
    return JSON.parse(text);
  } catch (_) {
    return undefined;
  }
};
const isBoolean = data => typeof data === 'boolean';
exports.isBoolean = isBoolean;
//# sourceMappingURL=storage.js.map