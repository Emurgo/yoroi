export const makeStorageMaker = () => {
  const notice = {
    read: () => Promise.resolve(true),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-resolver-notice'
  };
  const clear = () => Promise.resolve();
  return {
    notice,
    clear
  };
};
const unknownError = () => Promise.reject('Unknown error');
export const makeStorageMakerDefault = () => {
  const notice = {
    read: unknownError,
    remove: unknownError,
    save: unknownError,
    key: 'mock-resolver-notice'
  };
  const clear = unknownError;
  return {
    notice,
    clear
  };
};
//# sourceMappingURL=storage.mocks.js.map