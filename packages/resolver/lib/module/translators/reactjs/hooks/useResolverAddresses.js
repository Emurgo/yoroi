import { useQuery, useQueryClient } from 'react-query';
import { useResolver } from '../provider/ResolverProvider';
export const useResolverAddresses = (_ref, options) => {
  let {
    receiver
  } = _ref;
  const {
    getCryptoAddress
  } = useResolver();
  const queryClient = useQueryClient();
  const query = useQuery({
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
//# sourceMappingURL=useResolverAddresses.js.map