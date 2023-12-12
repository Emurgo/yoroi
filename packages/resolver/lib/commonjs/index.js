"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _module = require("./translators/module");
Object.keys(_module).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _module[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _module[key];
    }
  });
});
var _storage = require("./adapters/storage");
Object.keys(_storage).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _storage[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _storage[key];
    }
  });
});
var _api = require("./adapters/api");
Object.keys(_api).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _api[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _api[key];
    }
  });
});
var _isDomain = require("./utils/isDomain");
Object.keys(_isDomain).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isDomain[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isDomain[key];
    }
  });
});
var _useReadResolverNoticeStatus = require("./translators/reactjs/hooks/useReadResolverNoticeStatus");
Object.keys(_useReadResolverNoticeStatus).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _useReadResolverNoticeStatus[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _useReadResolverNoticeStatus[key];
    }
  });
});
var _useResolverAddresses = require("./translators/reactjs/hooks/useResolverAddresses");
Object.keys(_useResolverAddresses).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _useResolverAddresses[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _useResolverAddresses[key];
    }
  });
});
var _useSaveResolverNoticeStatus = require("./translators/reactjs/hooks/useSaveResolverNoticeStatus");
Object.keys(_useSaveResolverNoticeStatus).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _useSaveResolverNoticeStatus[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _useSaveResolverNoticeStatus[key];
    }
  });
});
var _ResolverProvider = require("./translators/reactjs/provider/ResolverProvider");
Object.keys(_ResolverProvider).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ResolverProvider[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ResolverProvider[key];
    }
  });
});
//# sourceMappingURL=index.js.map