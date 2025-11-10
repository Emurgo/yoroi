import {useQuery} from '@tanstack/react-query'
import {ContractService, SmartContractInfo} from '../services/contract-service'

const contractService = new ContractService({
  apiUrl: process.env.EXPO_PUBLIC_CONTRACT_SERVICE_URL || 'https://api.example.com'
})

/**
 * Hook to fetch smart contract information for an address
 */
export const useSmartContractInfo = (address: string | null) => {
  return useQuery<SmartContractInfo | null>({
    queryKey: ['smartContractInfo', address],
    queryFn: () => (address ? contractService.getContractInfo(address) : null),
    enabled: !!address && ContractService.isContractAddress(address),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

/**
 * Hook to fetch smart contract information for multiple addresses
 */
export const useManySmartContractInfo = (addresses: string[]) => {
  return useQuery<Record<string, SmartContractInfo | null>>({
    queryKey: ['smartContractInfo', addresses],
    queryFn: () => contractService.getManyContractInfo(addresses),
    enabled: addresses.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

