import { useQuery, useQueryClient } from 'react-query';
import { useResolver } from '../provider/ResolverProvider';
export const useReadResolverNoticeStatus = () => {
  const {
    readResolverNoticeStatus
  } = useResolver();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['resolver'],
    queryFn: readResolverNoticeStatus,
    onSuccess: () => queryClient.invalidateQueries(['resolver'])
  });
  return {
    ...query,
    readResolverNoticeStatus: query.data
  };
};
//# sourceMappingURL=useReadResolverNoticeStatus.js.map