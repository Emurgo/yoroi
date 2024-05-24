import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useNftModerationStatus} from '../../../yoroi-wallets/hooks'

export const useModeratedNftImage = ({wallet, fingerprint}: {wallet: YoroiWallet; fingerprint: string}) => {
  return useNftModerationStatus(
    {wallet, fingerprint},
    {refetchInterval: (moderationStatus) => (moderationStatus === 'pending' ? REFETCH_TIME_IN_MS : false)},
  )
}

const REFETCH_TIME_IN_MS = 3000
