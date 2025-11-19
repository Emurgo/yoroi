import {atoms as a, useTheme} from '@yoroi/theme'

import {useFocusEffect} from '@react-navigation/native'
import {useQueryClient} from '@tanstack/react-query'
import * as React from 'react'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {PoolDetailScreen} from '~/features/Staking/Staking/PoolDetails/PoolDetailScreen'
import {PoolList} from '~/features/Staking/Staking/PoolList/PoolList'
import {usePrefetchPoolList} from '~/features/Staking/Staking/PoolList/usePoolList'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {LoadingOverlay} from '~/ui/LoadingOverlay/LoadingOverlay'
import {createDelegationTxFromWallet} from '~/wallets/cardano/transaction-recipes'

export const StakingCenter = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const queryClient = useQueryClient()

  const {wallet, meta} = useSelectedWallet()
  const {navigateToTxReview} = useWalletNavigation()
  const prefetchPoolList = usePrefetchPoolList()

  // Add search to navigation header
  useSearchOnNavBar({
    title: strings.dashboard.stakingCenterTitle,
    placeholder: strings.staking.searchPools,
  })

  // Prefetch pool list (pages 1 and 2) when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      prefetchPoolList()
    }, [prefetchPoolList]),
  )

  const [selectedPoolId, setSelectedPoolId] = React.useState<string | null>(
    null,
  )
  const [isBuildingTx, setIsBuildingTx] = React.useState(false)
  const [_buildError, setBuildError] = React.useState<Error | null>(null)

  const {clearSearch, hideSearch} = useSearch()

  useFocusEffect(
    React.useCallback(() => {
      // Clear search when leaving the screen
      return () => {
        setSelectedPoolId(null) // any pool can be reselected once go back from signing
        setIsBuildingTx(false)
        setBuildError(null)
        clearSearch()
        hideSearch()
      }
    }, [clearSearch, hideSearch]),
  )

  const onSuccess = React.useCallback(() => {
    queryClient.resetQueries({queryKey: [wallet.id, 'stakingInfo']})
  }, [queryClient, wallet.id])

  const onError = React.useCallback(() => {
    setSelectedPoolId(null)
    setIsBuildingTx(false)
    setBuildError(null)
    queryClient.resetQueries({queryKey: [wallet.id, 'stakingInfo']})
  }, [queryClient, wallet.id])

  // Build transaction when pool is selected
  React.useEffect(() => {
    if (!selectedPoolId) return

    let cancelled = false

    const buildTransaction = async () => {
      setIsBuildingTx(true)
      setBuildError(null)

      try {
        logger.debug('building delegation transaction', {
          poolId: selectedPoolId,
        })

        const stakingTx = await createDelegationTxFromWallet(wallet, {
          poolId: selectedPoolId,
          addressMode: meta.addressMode,
        })

        if (cancelled) return

        setIsBuildingTx(false)

        navigateToTxReview({
          cbor: stakingTx.cbor,
          onSuccess,
          onError,
          context: 'delegate',
        })
      } catch (error) {
        if (cancelled) return

        const err = error instanceof Error ? error : new Error(String(error))
        logger.error(err, {origin: 'staking', operation: 'buildDelegationTx'})
        setBuildError(err)
        setIsBuildingTx(false)
        setSelectedPoolId(null)
      }
    }

    buildTransaction()

    return () => {
      cancelled = true
    }
  }, [selectedPoolId, wallet, meta, navigateToTxReview, onSuccess, onError])

  const handlePoolSelect = async (poolHash: string) => {
    logger.debug('selected pool from native list', {poolHash})
    setSelectedPoolId(poolHash)
  }

  const shouldDisplayPoolIDInput = !wallet.isMainnet
  const shouldDisplayPoolList = wallet.isMainnet

  return (
    <SafeAreaView
      edges={['right', 'bottom', 'left']}
      style={[a.flex_1, a.px_lg, ta.bg_color_max]}
    >
      {shouldDisplayPoolIDInput && (
        <PoolDetailScreen onPressDelegate={setSelectedPoolId} />
      )}

      {shouldDisplayPoolList && <PoolList onPoolSelect={handlePoolSelect} />}

      {isBuildingTx && (
        <LoadingOverlay
          isLoading
          content={
            <View
              style={[a.p_lg, ta.bg_color_max, a.rounded_md, a.align_center]}
            >
              <Text style={[a.body_1_lg_regular, ta.text_primary_max, a.pb_sm]}>
                {strings.staking.loading}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
