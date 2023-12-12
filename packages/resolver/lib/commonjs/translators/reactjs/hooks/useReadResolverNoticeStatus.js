"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReadResolverNoticeStatus = void 0;
var _reactQuery = require("react-query");
var _ResolverProvider = require("../provider/ResolverProvider");
const useReadResolverNoticeStatus = () => {
  const {
    readResolverNoticeStatus
  } = (0, _ResolverProvider.useResolver)();
  const queryClient = (0, _reactQuery.useQueryClient)();
  const query = (0, _reactQuery.useQuery)({
    queryKey: ['resolver'],
    queryFn: readResolverNoticeStatus,
    onSuccess: () => queryClient.invalidateQueries(['resolver'])
  });
  return {
    ...query,
    readResolverNoticeStatus: query.data
  };
};
exports.useReadResolverNoticeStatus = useReadResolverNoticeStatus;
//# sourceMappingURL=useReadResolverNoticeStatus.js.map