import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components'
import {BottomSheetModal} from '../../../../components/BottomSheetModal'
import {LoadingOverlay} from '../../../../components/LoadingOverlay'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useWalletNavigation} from '../../../../navigation'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useAuthOsWithEasyConfirmation} from '../../../../yoroi-wallets/auth'
import {useSignAndSubmitTx, useTokenInfos} from '../../../../yoroi-wallets/hooks'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {ConfirmTx} from './ConfirmTx'
import {TransactionSummary} from './TransactionSummary'

export const ConfirmTxScreen = () => {
  const [confirmationModal, setConfirmationModal] = React.useState<boolean>(false)

  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigate = useNavigateTo()
  const {track} = useMetrics()

  const {unsignedTx, createOrder} = useSwap()

  const {resetToTxHistory} = useWalletNavigation()

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: [createOrder.amounts.buy.tokenId, createOrder.amounts.sell.tokenId],
  })

  const {authWithOs, isLoading: authenticating} = useAuthOsWithEasyConfirmation(
    {id: wallet.id},
    {onSuccess: (rootKey) => signAndSubmitTx({unsignedTx, rootKey})},
  )

  const {signAndSubmitTx, isLoading: processingTx} = useSignAndSubmitTx(
    {wallet},
    {
      signTx: {useErrorBoundary: true},
      submitTx: {
        onSuccess: () => {
          const sellTokenInfo = tokenInfos.filter((tokenInfo) => tokenInfo.id === createOrder.amounts.sell.tokenId)[0]
          const buyTokenInfo = tokenInfos.filter((tokenInfo) => tokenInfo.id === createOrder.amounts.buy.tokenId)[0]

          track.swapOrderSubmitted({
            from_asset: [
              {asset_name: sellTokenInfo.name, asset_ticker: sellTokenInfo.ticker, policy_id: sellTokenInfo.group},
            ],
            to_asset: [
              {asset_name: buyTokenInfo.name, asset_ticker: buyTokenInfo.ticker, policy_id: buyTokenInfo.group},
            ],
            order_type: createOrder.type,
            slippage_tolerance: createOrder.slippage,
            from_amount: createOrder.amounts.sell.quantity,
            to_amount: createOrder.amounts.buy.quantity,
            pool_source: createOrder.selectedPool.provider,
            swap_fees: Number(createOrder.selectedPool.fee),
          })

          navigate.startSwap()
        },
        useErrorBoundary: true,
      },
    },
  )

  const txIsLoading = authenticating || processingTx

  return (
    <SafeAreaView style={styles.container}>
      <TransactionSummary />

      <Actions>
        <Button
          disabled={txIsLoading}
          testID="swapButton"
          shelleyTheme
          title={strings.confirm}
          onPress={() => {
            if (wallet.isEasyConfirmationEnabled) {
              authWithOs()
              return
            }
            setConfirmationModal(true)
          }}
        />
      </Actions>

      <BottomSheetModal
        isOpen={confirmationModal}
        title={wallet.isHW ? strings.chooseConnectionMethod : strings.signTransaction}
        onClose={() => {
          setConfirmationModal(false)
        }}
        contentContainerStyle={{justifyContent: 'space-between'}}
      >
        <ConfirmTx
          wallet={wallet}
          unsignedTx={unsignedTx}
          datum={{data: createOrder.datum}}
          onSuccess={() => resetToTxHistory()}
          onCancel={() => setConfirmationModal(false)}
        />
      </BottomSheetModal>

      <LoadingOverlay loading={txIsLoading} />
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'space-between',
  },
  actions: {
    paddingVertical: 16,
  },
})
