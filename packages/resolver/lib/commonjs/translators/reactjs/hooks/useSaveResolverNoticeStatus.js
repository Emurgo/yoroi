"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSaveResolverNoticeStatus = void 0;
var _reactQuery = require("react-query");
var _ResolverProvider = require("../provider/ResolverProvider");
const useSaveResolverNoticeStatus = options => {
  const {
    saveResolverNoticeStatus
  } = (0, _ResolverProvider.useResolver)();
  const queryClient = (0, _reactQuery.useQueryClient)();
  const mutation = (0, _reactQuery.useMutation)({
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
exports.useSaveResolverNoticeStatus = useSaveResolverNoticeStatus;
//# sourceMappingURL=useSaveResolverNoticeStatus.js.map