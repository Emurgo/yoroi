import React from 'react';
import { rootStorage } from '../storage';
import { invalid } from '../helpers';
const StorageContext = /*#__PURE__*/React.createContext(undefined);
export const StorageProvider = _ref => {
  let {
    children,
    storage = rootStorage
  } = _ref;
  return /*#__PURE__*/React.createElement(StorageContext.Provider, {
    value: storage
  }, children);
};
export const useStorage = () => React.useContext(StorageContext) ?? invalid('Missing StorageProvider');
//# sourceMappingURL=storage.reactjs.js.map