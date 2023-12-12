import { useMutation, useQueryClient } from 'react-query';
import { useResolver } from '../provider/ResolverProvider';
export const useSaveResolverNoticeStatus = options => {
  const {
    saveResolverNoticeStatus
  } = useResolver();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...options,
    mutationKey: ['resolver'],
    mutationFn: saveResolverNoticeStatus,
    onSuccess: function () {
      var _options$onSuccess;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      options === null || options === void 0 || (_options$onSuccess = options.onSuccess) === null || _options$onSuccess === void 0 ? void 0 : _options$onSuccess.call(options, ...args);
      queryClient.invalidateQueries(['resolver']);
    }
  });
  return {
    ...mutation,
    saveResolverNoticeStatus: mutation.mutate
  };
};
//# sourceMappingURL=useSaveResolverNoticeStatus.js.map