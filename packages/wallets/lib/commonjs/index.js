"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _helpers = require("./helpers");
Object.keys(_helpers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _helpers[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _helpers[key];
    }
  });
});
var _parsers = require("./parsers");
Object.keys(_parsers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _parsers[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _parsers[key];
    }
  });
});
var _asyncStorage = require("./adapters/asyncStorage");
Object.keys(_asyncStorage).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _asyncStorage[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _asyncStorage[key];
    }
  });
});
var _storage = require("./translators/storage.reactjs");
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
var _storage2 = require("./storage");
Object.keys(_storage2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _storage2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _storage2[key];
    }
  });
});
//# sourceMappingURL=index.js.map