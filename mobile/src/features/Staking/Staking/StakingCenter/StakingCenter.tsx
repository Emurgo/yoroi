import {atoms as a, useTheme} from '@yoroi/theme'

import {useFocusEffect} from '@react-navigation/native'
import {useQueryClient} from '@tanstack/react-query'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStakingTx} from '~/features/Dashboard/ui/shared/StakePoolInfos'
import {PoolDetailScreen} from '~/features/Staking/Staking/PoolDetails/PoolDetailScreen'
import {PoolList} from '~/features/Staking/Staking/PoolList/PoolList'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {showConfirmationDialog} from '~/kernel/dialogs'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {LoadingOverlay} from '~/ui/LoadingOverlay/LoadingOverlay'

export const StakingCenter = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const queryClient = useQueryClient()

  const {wallet, meta} = useSelectedWallet()
  const intl = useIntl()
  const {navigateToTxReview} = useWalletNavigation()

  const [selectedPoolId, setSelectedPoolId] = React.useState<string | null>(
    null,
  )
  const [showLoadingModal, setShowLoadingModal] = React.useState(false)

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSelectedPoolId(null) // any pool can be reselected once go back from signing
      }
    }, []),
  )

  const onSuccess = React.useCallback(() => {
    queryClient.resetQueries({queryKey: [wallet.id, 'stakingInfo']})
  }, [queryClient, wallet.id])

  const onError = React.useCallback(() => {
    setSelectedPoolId(null)
    queryClient.resetQueries({queryKey: [wallet.id, 'stakingInfo']})
  }, [queryClient, wallet.id])

  const {stakingTx} = useStakingTx(
    {wallet, poolId: selectedPoolId ?? undefined, meta},
    {queryKey: [wallet.id, 'stakingTx'], enabled: selectedPoolId != null},
  )

  React.useEffect(() => {
    if (!stakingTx) return
    if (selectedPoolId == null) return
    navigateToTxReview({
      cbor: stakingTx.cbor,
      onSuccess,
      onError,
      context: 'delegate',
    })
  }, [stakingTx, selectedPoolId, navigateToTxReview, onSuccess, onError])

  const handlePoolSelect = async (poolHash: string) => {
    logger.debug('selected pool from native list', {poolHash})

    // Show confirmation dialog before proceeding
    const confirmed = await showConfirmationDialog(
      {
        title: {
          id: 'components.stakingcenter.confirmDelegation.title',
          defaultMessage: strings.staking.confirmDelegation.title,
        },
        message: {
          id: 'components.stakingcenter.confirmDelegation.message',
          defaultMessage: strings.staking.confirmDelegation.message,
        },
        btnYesLabel: {
          id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
          defaultMessage: strings.staking.confirmDelegation.delegateButtonLabel,
        },
        btnNoLabel: {
          id: 'global.cancel',
          defaultMessage: strings.staking.confirmDelegation.cancelButtonLabel,
        },
      },
      intl,
    )
    if (confirmed === 'Yes') {
      setShowLoadingModal(true)
      setSelectedPoolId(poolHash)
    }
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

      {showLoadingModal && (
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
