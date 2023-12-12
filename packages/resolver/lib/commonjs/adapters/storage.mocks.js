"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeStorageMakerDefault = exports.makeStorageMaker = void 0;
const makeStorageMaker = () => {
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
exports.makeStorageMaker = makeStorageMaker;
const unknownError = () => Promise.reject('Unknown error');
const makeStorageMakerDefault = () => {
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
exports.makeStorageMakerDefault = makeStorageMakerDefault;
//# sourceMappingURL=storage.mocks.js.map