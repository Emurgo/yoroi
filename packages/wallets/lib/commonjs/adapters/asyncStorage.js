"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mountStorage = exports.mountMultiStorage = void 0;
var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
var _parsers = require("../parsers");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// -------
// ADAPTER + "FACTORY"
const mountStorage = path => {
  const withPath = key => `${path}${key}`;
  const withoutPath = value => value.slice(path.length);
  async function getItem(key) {
    let parse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _parsers.parseSafe;
    const item = await _asyncStorage.default.getItem(withPath(key));
    return parse(item);
  }
  async function multiGet(keys) {
    let parse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _parsers.parseSafe;
    const absolutePaths = keys.map(key => withPath(key));
    const items = await _asyncStorage.default.multiGet(absolutePaths);
    return items.map(_ref => {
      let [key, value] = _ref;
      return [withoutPath(key), parse(value)];
    });
  }
  return {
    join: folderName => mountStorage(`${path}${folderName}`),
    getItem,
    multiGet,
    setItem: async function (key, value) {
      let stringify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : JSON.stringify;
      const item = stringify(value);
      await _asyncStorage.default.setItem(withPath(key), item);
    },
    multiSet: async function (tuples) {
      let stringify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : JSON.stringify;
      const items = tuples.map(_ref2 => {
        let [key, value] = _ref2;
        return [withPath(key), stringify(value)];
      });
      await _asyncStorage.default.multiSet(items);
    },
    removeItem: async key => {
      await _asyncStorage.default.removeItem(withPath(key));
    },
    removeFolder: async folderName => {
      const keys = await _asyncStorage.default.getAllKeys();
      const filteredKeys = keys.filter(key => key.startsWith(path) && withoutPath(key).startsWith(folderName) && isFolderKey({
        key,
        path
      }));
      await _asyncStorage.default.multiRemove(filteredKeys);
    },
    multiRemove: async keys => {
      await _asyncStorage.default.multiRemove(keys.map(key => withPath(key)));
    },
    getAllKeys: () => {
      return _asyncStorage.default.getAllKeys().then(keys => keys.filter(key => key.startsWith(path) && isFileKey({
        key,
        path
      }))).then(filteredKeys => filteredKeys.map(withoutPath));
    },
    clear: async () => {
      const keys = await _asyncStorage.default.getAllKeys();
      const filteredKeys = keys.filter(key => key.startsWith(path));
      await _asyncStorage.default.multiRemove(filteredKeys);
    }
  };
};
exports.mountStorage = mountStorage;
const mountMultiStorage = options => {
  const {
    storage,
    dataFolder,
    keyExtractor,
    serializer = JSON.stringify,
    deserializer = _parsers.parseSafe
  } = options;
  const dataStorage = storage.join(dataFolder);
  const keys = () => dataStorage.getAllKeys();
  const remove = () => storage.removeFolder(dataFolder);
  const save = items => {
    const entries = items.map(record => {
      if (typeof keyExtractor === 'function') {
        return [keyExtractor(record), record];
      }
      return [String(record[keyExtractor]), record];
    });
    const entriesWithKeys = entries.filter(_ref3 => {
      let [key] = _ref3;
      return key != null && key !== '';
    });
    return dataStorage.multiSet(entriesWithKeys, serializer);
  };
  const read = () => {
    return dataStorage.getAllKeys().then(readKeys => dataStorage.multiGet(readKeys, deserializer));
  };
  return {
    keys,
    remove,
    save,
    read
  };
};

// -------
// HELPERS
exports.mountMultiStorage = mountMultiStorage;
const isFileKey = _ref4 => {
  let {
    key,
    path
  } = _ref4;
  return !key.slice(path.length).includes('/');
};
const isFolderKey = _ref5 => {
  let {
    key,
    path
  } = _ref5;
  return !isFileKey({
    key,
    path
  });
};
//# sourceMappingURL=asyncStorage.js.map