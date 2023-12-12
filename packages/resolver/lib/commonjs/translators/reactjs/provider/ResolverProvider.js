"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useResolver = exports.resolverReducer = exports.defaultResolverState = exports.defaultResolverActions = exports.ResolverProvider = void 0;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const defaultResolverActions = {
  saveResolverNoticeStatus: missingInit,
  readResolverNoticeStatus: missingInit,
  getCryptoAddress: missingInit,
  resolvedAddressSelectedChanged: missingInit,
  resetState: missingInit
};

/* istanbul ignore next */
exports.defaultResolverActions = defaultResolverActions;
function missingInit() {
  console.error('[@yoroi/resolver] missing initialization');
}
const defaultResolverState = {
  resolvedAddressSelected: null
};
exports.defaultResolverState = defaultResolverState;
const initialResolverProvider = {
  ...defaultResolverState,
  ...defaultResolverActions
};
const ResolverContext = /*#__PURE__*/React.createContext(initialResolverProvider);
const ResolverProvider = _ref => {
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
exports.ResolverProvider = ResolverProvider;
const useResolver = () => React.useContext(ResolverContext);
exports.useResolver = useResolver;
const resolverReducer = (state, action) => {
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
exports.resolverReducer = resolverReducer;
//# sourceMappingURL=ResolverProvider.js.map