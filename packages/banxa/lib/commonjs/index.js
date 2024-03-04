"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Banxa = void 0;
Object.defineProperty(exports, "BanxaErrorMessages", {
  enumerable: true,
  get: function () {
    return _errors.BanxaErrorMessages;
  }
});
Object.defineProperty(exports, "banxaDomainProduction", {
  enumerable: true,
  get: function () {
    return _domains.banxaDomainProduction;
  }
});
Object.defineProperty(exports, "banxaDomainSandbox", {
  enumerable: true,
  get: function () {
    return _domains.banxaDomainSandbox;
  }
});
Object.defineProperty(exports, "banxaModuleMaker", {
  enumerable: true,
  get: function () {
    return _module.banxaModuleMaker;
  }
});
Object.defineProperty(exports, "banxaSupportUrl", {
  enumerable: true,
  get: function () {
    return _domains.banxaSupportUrl;
  }
});
var _domains = require("./translators/domains");
var _module = require("./translators/module");
var _errors = require("./adapters/errors");
let Banxa;
exports.Banxa = Banxa;
(function (_Banxa) {})(Banxa || (exports.Banxa = Banxa = {}));
//# sourceMappingURL=index.js.map