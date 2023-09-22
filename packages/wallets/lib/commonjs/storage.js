"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rootStorage = void 0;
var _asyncStorage = require("./adapters/asyncStorage");
const rootStorage = (0, _asyncStorage.mountStorage)('/');
exports.rootStorage = rootStorage;
//# sourceMappingURL=storage.js.map