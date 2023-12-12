import AsyncStorage from '@react-native-async-storage/async-storage';
const initialDeps = {
  storage: AsyncStorage
};
export function resolverStorageMaker() {
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
export const resolverStorageNoticedKey = 'resolver-notice';

// * === UTILS ===
// * NOTE copied from utils it should be imported from utils package later
export const parseBoolean = data => {
  const parsed = parseSafe(data);
  return isBoolean(parsed) ? parsed : undefined;
};
const parseSafe = text => {
  try {
    return JSON.parse(text);
  } catch (_) {
    return undefined;
  }
};
export const isBoolean = data => typeof data === 'boolean';
//# sourceMappingURL=storage.js.map