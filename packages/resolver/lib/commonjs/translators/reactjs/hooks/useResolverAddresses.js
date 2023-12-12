"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useResolverAddresses = void 0;
var _reactQuery = require("react-query");
var _ResolverProvider = require("../provider/ResolverProvider");
const useResolverAddresses = (_ref, options) => {
  let {
    receiver
  } = _ref;
  const {
    getCryptoAddress
  } = (0, _ResolverProvider.useResolver)();
  const queryClient = (0, _reactQuery.useQueryClient)();
  const query = (0, _reactQuery.useQuery)({
    queryKey: ['resolver', receiver],
    ...options,
    queryFn: () => getCryptoAddress(receiver),
    onSuccess: function () {
      var _options$onSuccess;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      options === null || options === void 0 || (_options$onSuccess = options.onSuccess) === null || _options$onSuccess === void 0 ? void 0 : _options$onSuccess.call(options, ...args);
      queryClient.invalidateQueries(['resolver', receiver]);
    }
  });
  return {
    ...query,
    addresses: query.data ?? []
  };
};
exports.useResolverAddresses = useResolverAddresses;
//# sourceMappingURL=useResolverAddresses.js.map