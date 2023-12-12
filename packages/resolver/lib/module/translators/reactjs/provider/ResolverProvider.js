import * as React from 'react';
export const defaultResolverActions = {
  saveResolverNoticeStatus: missingInit,
  readResolverNoticeStatus: missingInit,
  getCryptoAddress: missingInit,
  resolvedAddressSelectedChanged: missingInit,
  resetState: missingInit
};

/* istanbul ignore next */
function missingInit() {
  console.error('[@yoroi/resolver] missing initialization');
}
export const defaultResolverState = {
  resolvedAddressSelected: null
};
const initialResolverProvider = {
  ...defaultResolverState,
  ...defaultResolverActions
};
const ResolverContext = /*#__PURE__*/React.createContext(initialResolverProvider);
export const ResolverProvider = _ref => {
  let {
    children,
    resolverModule
  } = _ref;
  const [state, dispatch] = React.useReducer(resolverReducer, {
    ...defaultResolverState
  });
  const actions = React.useRef({
    saveResolverNoticeStatus: noticed => resolverModule.notice.save(noticed),
    readResolverNoticeStatus: resolverModule.notice.read,
    getCryptoAddress: receiver => resolverModule.address.getCryptoAddress(receiver),
    resolvedAddressSelectedChanged: resolvedAddressSelected => dispatch({
      type: 'resolvedAddressSelectedChanged',
      resolvedAddressSelected
    }),
    resetState: () => dispatch({
      type: 'resetState'
    })
  }).current;
  const context = React.useMemo(() => ({
    ...state,
    ...actions
  }), [actions, state]);
  return /*#__PURE__*/React.createElement(ResolverContext.Provider, {
    value: context
  }, children);
};
export const useResolver = () => React.useContext(ResolverContext);
export const resolverReducer = (state, action) => {
  switch (action.type) {
    case 'resolvedAddressSelectedChanged':
      return {
        ...state,
        resolvedAddressSelected: action.resolvedAddressSelected
      };
    case 'resetState':
      return {
        ...defaultResolverState
      };
    default:
      return state;
  }
};
//# sourceMappingURL=ResolverProvider.js.map