"use strict";

var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
var _storage = require("./storage");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
jest.mock('@react-native-async-storage/async-storage');
const mockedAsyncStorage = _asyncStorage.default;
describe('makeSwapStorage', () => {
  let swapStorage;
  beforeEach(() => {
    swapStorage = (0, _storage.makeSwapStorage)();
    mockedAsyncStorage.setItem.mockClear();
    mockedAsyncStorage.getItem.mockClear();
    mockedAsyncStorage.removeItem.mockClear();
  });
  it('should save slippage', async () => {
    const slippage = 0.1;
    await swapStorage.slippage.save(slippage);
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(_storage.swapStorageSlippageKey, JSON.stringify(slippage));
  });
  it('should read slippage', async () => {
    const slippage = 0.1;
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(slippage));
    const result = await swapStorage.slippage.read();
    expect(result).toEqual(slippage);
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(_storage.swapStorageSlippageKey);
  });
  it('should handle non-numeric values when reading slippage', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify('not a number'));
    const result = await swapStorage.slippage.read();
    expect(result).toEqual(0);
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(_storage.swapStorageSlippageKey);
  });
  it('should remove slippage', async () => {
    await swapStorage.slippage.remove();
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(_storage.swapStorageSlippageKey);
  });
});
//# sourceMappingURL=storage.test.js.map