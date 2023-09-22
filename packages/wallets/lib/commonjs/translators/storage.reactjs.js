"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useStorage = exports.StorageProvider = void 0;
var _react = _interopRequireDefault(require("react"));
var _storage = require("../storage");
var _helpers = require("../helpers");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const StorageContext = /*#__PURE__*/_react.default.createContext(undefined);
const StorageProvider = _ref => {
  let {
    children,
    storage = _storage.rootStorage
  } = _ref;
  return /*#__PURE__*/_react.default.createElement(StorageContext.Provider, {
    value: storage
  }, children);
};
exports.StorageProvider = StorageProvider;
const useStorage = () => _react.default.useContext(StorageContext) ?? (0, _helpers.invalid)('Missing StorageProvider');
exports.useStorage = useStorage;
//# sourceMappingURL=storage.reactjs.js.map