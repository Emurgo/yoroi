"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mockSwapStorageDefault = exports.mockSwapStorage = void 0;
const mockSwapStorage = () => {
  const slippage = {
    read: () => Promise.resolve(0.1),
    remove: () => Promise.resolve(),
    save: _newSlippage => Promise.resolve(),
    key: 'mock-swap-slippage'
  };
  const clear = () => Promise.resolve();
  return {
    slippage,
    clear
  };
};
exports.mockSwapStorage = mockSwapStorage;
const unknownError = () => Promise.reject('Unknown error');
const mockSwapStorageDefault = () => {
  const slippage = {
    read: unknownError,
    remove: unknownError,
    save: unknownError,
    key: 'mock-swap-slippage'
  };
  const clear = unknownError;
  return {
    slippage,
    clear
  };
};
exports.mockSwapStorageDefault = mockSwapStorageDefault;
//# sourceMappingURL=storage.mocks.js.map