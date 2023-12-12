"use strict";

var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
var _storage = require("./storage");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
jest.mock('@react-native-async-storage/async-storage');
const mockedAsyncStorage = _asyncStorage.default;
describe('resolverStorageMaker', () => {
  let resolverStorage;
  beforeEach(() => {
    jest.clearAllMocks();
    resolverStorage = (0, _storage.resolverStorageMaker)();
  });
  it('notice.save', async () => {
    const notice = true;
    await resolverStorage.notice.save(notice);
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(_storage.resolverStorageNoticedKey, JSON.stringify(notice));
  });
  it('notice.read', async () => {
    const notice = true;
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(notice));
    const result = await resolverStorage.notice.read();
    expect(result).toEqual(notice);
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(_storage.resolverStorageNoticedKey);
  });
  it('notice.read should fallback to false when wrong data', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify('not a boolean'));
    const result = await resolverStorage.notice.read();
    expect(result).toEqual(false);
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(_storage.resolverStorageNoticedKey);
    mockedAsyncStorage.getItem.mockResolvedValue('[1, 2, ]');
    const result2 = await resolverStorage.notice.read();
    expect(result2).toEqual(false);
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(_storage.resolverStorageNoticedKey);
  });
  it('notice.remove', async () => {
    await resolverStorage.notice.remove();
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(_storage.resolverStorageNoticedKey);
  });
  it('clear', async () => {
    await resolverStorage.clear();
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledTimes(1);
  });
});
//# sourceMappingURL=storage.test.js.map