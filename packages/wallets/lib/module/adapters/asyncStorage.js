import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseSafe } from '../parsers';

// -------
// ADAPTER + "FACTORY"
export const mountStorage = path => {
  const withPath = key => `${path}${key}`;
  const withoutPath = value => value.slice(path.length);
  async function getItem(key) {
    let parse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : parseSafe;
    const item = await AsyncStorage.getItem(withPath(key));
    return parse(item);
  }
  async function multiGet(keys) {
    let parse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : parseSafe;
    const absolutePaths = keys.map(key => withPath(key));
    const items = await AsyncStorage.multiGet(absolutePaths);
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
      await AsyncStorage.setItem(withPath(key), item);
    },
    multiSet: async function (tuples) {
      let stringify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : JSON.stringify;
      const items = tuples.map(_ref2 => {
        let [key, value] = _ref2;
        return [withPath(key), stringify(value)];
      });
      await AsyncStorage.multiSet(items);
    },
    removeItem: async key => {
      await AsyncStorage.removeItem(withPath(key));
    },
    removeFolder: async folderName => {
      const keys = await AsyncStorage.getAllKeys();
      const filteredKeys = keys.filter(key => key.startsWith(path) && withoutPath(key).startsWith(folderName) && isFolderKey({
        key,
        path
      }));
      await AsyncStorage.multiRemove(filteredKeys);
    },
    multiRemove: async keys => {
      await AsyncStorage.multiRemove(keys.map(key => withPath(key)));
    },
    getAllKeys: () => {
      return AsyncStorage.getAllKeys().then(keys => keys.filter(key => key.startsWith(path) && isFileKey({
        key,
        path
      }))).then(filteredKeys => filteredKeys.map(withoutPath));
    },
    clear: async () => {
      const keys = await AsyncStorage.getAllKeys();
      const filteredKeys = keys.filter(key => key.startsWith(path));
      await AsyncStorage.multiRemove(filteredKeys);
    }
  };
};
export const mountMultiStorage = options => {
  const {
    storage,
    dataFolder,
    keyExtractor,
    serializer = JSON.stringify,
    deserializer = parseSafe
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