import {
  createCombinedDelegationTxFromWallet,
  createDelegationTxFromWallet,
} from '@yoroi/cardano-wallet'
import {getYoroiDrepIdHex} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Branded, KeyHash} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {useFocusEffect} from '@react-navigation/native'
import {useQueryClient} from '@tanstack/react-query'
import * as React from 'react'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {useGovernanceParticipation} from '~/features/Staking/Governance/common/helpers'
import {useNavigateTo} from '~/features/Staking/Governance/common/navigation'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {PoolDetailScreen} from '~/features/Staking/Staking/PoolDetails/PoolDetailScreen'
import {PoolList} from '~/features/Staking/Staking/PoolList/PoolList'
import {usePrefetchPoolList} from '~/features/Staking/Staking/PoolList/usePoolList'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {GovernanceRequiredModal} from '~/ui/GovernanceRequiredModal/GovernanceRequiredModal'
import {LoadingOverlay} from '~/ui/LoadingOverlay/LoadingOverlay'
import {useModal} from '~/ui/Modal/context/ModalContext'

export const StakingCenter = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const queryClient = useQueryClient()

  const {wallet, meta} = useSelectedWallet()
  const {navigateToTxReview} = useWalletNavigation()
  const navigateTo = useNavigateTo()
  const prefetchPoolList = usePrefetchPoolList()
  const {isParticipating: isGovernanceParticipating} =
    useGovernanceParticipation()
  const {openModal, closeModal} = useModal()

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

  const [pendingPoolId, setPendingPoolId] = React.useState<string | null>(null)
  const [isBuildingTx, setIsBuildingTx] = React.useState(false)
  const [_buildError, setBuildError] = React.useState<Error | null>(null)

  const {clearSearch, hideSearch} = useSearch()

  useFocusEffect(
    React.useCallback(() => {
      // Clear search when leaving the screen
      return () => {
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
    setIsBuildingTx(false)
    setBuildError(null)
    queryClient.resetQueries({queryKey: [wallet.id, 'stakingInfo']})
  }, [queryClient, wallet.id])

  // Build transaction when pool is selected
  const buildDelegationTransaction = React.useCallback(
    async (poolId: string, includeGovernance: boolean) => {
      setIsBuildingTx(true)
      setBuildError(null)

      try {
        logger.debug('building delegation transaction', {
          poolId,
          includeGovernance,
        })

        let stakingTx: {cbor: string}

        if (includeGovernance) {
          // Create combined transaction with both stake pool and DRep delegation
          const yoroiDrepIdHex = getYoroiDrepIdHex(
            wallet.networkManager.network,
          )
          const drepValue: {KeyHash: KeyHash} = {
            KeyHash: Branded.asKeyHash(yoroiDrepIdHex),
          }
          stakingTx = await createCombinedDelegationTxFromWallet(wallet, {
            poolId,
            drepValue,
            addressMode: meta.addressMode,
          })
        } else {
          // Create stake-only delegation transaction
          stakingTx = await createDelegationTxFromWallet(wallet, {
            poolId,
            addressMode: meta.addressMode,
          })
        }

        setIsBuildingTx(false)

        navigateToTxReview({
          cbor: stakingTx.cbor,
          onSuccess,
          onError,
          context: 'delegate',
        })
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        logger.error(err, {origin: 'staking', operation: 'buildDelegationTx'})

        if (isInsufficientBalanceError(error)) {
          navigateTo.noFunds()
          setIsBuildingTx(false)
          setPendingPoolId(null)
          return
        }

        setBuildError(err)
        setIsBuildingTx(false)
        setPendingPoolId(null)
      }
    },
    [wallet, meta, navigateToTxReview, navigateTo, onSuccess, onError],
  )

  // Handle pool selection - check if governance modal is needed
  React.useEffect(() => {
    if (!pendingPoolId) return

    // If user is already participating in governance, proceed directly without modal
    if (isGovernanceParticipating) {
      const poolIdToUse = pendingPoolId
      setPendingPoolId(null)
      buildDelegationTransaction(poolIdToUse, false)
      return
    }

    // If user is not participating in governance, show modal
    const poolIdToUse = pendingPoolId
    setPendingPoolId(null) // Clear immediately to prevent re-triggering

    openModal({
      title: strings.staking.governanceRequiredTitle,
      content: <GovernanceRequiredModal.Content />,
      footer: (
        <GovernanceRequiredModal.Footer
          onDelegateToYoroiDRep={() => {
            closeModal()
            // Build transaction with governance delegation
            buildDelegationTransaction(poolIdToUse, true)
          }}
          onDelegateStakeOnly={() => {
            closeModal()
            // Build transaction without governance delegation
            buildDelegationTransaction(poolIdToUse, false)
          }}
        />
      ),
      height: 680,
    })
  }, [
    pendingPoolId,
    isGovernanceParticipating,
    openModal,
    closeModal,
    strings.staking.governanceRequiredTitle,
    buildDelegationTransaction,
  ])

  const handlePoolSelect = async (poolHash: string) => {
    logger.debug('selected pool from native list', {poolHash})
    setPendingPoolId(poolHash)
  }

  const handlePoolDetailDelegate = React.useCallback((poolId: string) => {
    logger.debug('selected pool from detail screen', {poolId})
    setPendingPoolId(poolId)
  }, [])

  const shouldDisplayPoolIDInput = !wallet.isMainnet
  const shouldDisplayPoolList = wallet.isMainnet

  return (
    <SafeAreaView
      edges={['right', 'bottom', 'left']}
      style={[a.flex_1, a.px_lg, ta.bg_color_max]}
    >
      {shouldDisplayPoolIDInput && (
        <PoolDetailScreen onPressDelegate={handlePoolDetailDelegate} />
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
