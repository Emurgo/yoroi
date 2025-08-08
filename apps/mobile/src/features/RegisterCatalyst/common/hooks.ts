import {Catalyst, useCatalyst} from '@yoroi/staking'
import {App} from '@yoroi/types'
import {useEffect, useState} from 'react'

import {usePortfolioPrimaryBalance} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {throwLoggedError} from '~/kernel/logger/helpers/throw-logged-error'
import {YoroiWallet} from '~/wallets/cardano/types'
import {isShelley} from '~/wallets/cardano/utils'

export const useCanVote = (wallet: YoroiWallet) => {
  const {meta} = useSelectedWallet()
  const amount = usePortfolioPrimaryBalance({wallet})
  const {fund} = useCatalystCurrentFund()

  // Default to false if fund data is not available yet
  const sufficientFunds = fund
    ? amount.quantity >= fund.info.votingPowerThreshold
    : false

  return {
    canVote: !meta.isReadOnly && isShelley(meta.implementation),
    sufficientFunds,
  }
}

export function useCatalystCurrentFund() {
  const catalyst = useCatalyst()
  const [data, setData] = useState<{
    status: Catalyst.FundStatus
    info: Catalyst.FundInfo
  } | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await catalyst.getFundInfo()

        console.log(`response getFundInfo: ${JSON.stringify(response)}`)
        if (response.tag === 'left') {
          throwLoggedError(new Error(response.error.message))
        }

        const info = response.value.data

        const result = {
          info,
          status: catalyst.fundStatus(info),
        }

        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [catalyst])

  if (error) throw error
  if (data == null)
    throw new App.Errors.InvalidState('useCatalystFundStatus: no data')

  return {
    query: {
      data,
      error,
      isLoading,
      isError: error !== null,
    },
    fund: data,
  }
}
