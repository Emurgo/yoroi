export const mockSwapStorage = () => {
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
const unknownError = () => Promise.reject('Unknown error');
export const mockSwapStorageDefault = () => {
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
//# sourceMappingURL=storage.mocks.js.map