import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer} from '../../../../components'
import {LoadingOverlay} from '../../../../components/LoadingOverlay'
import {useModal} from '../../../../features/Modal/ModalContext'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useAuthOsWithEasyConfirmation} from '../../../../yoroi-wallets/auth'
import {useSignAndSubmitTx, useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {ConfirmTx} from './ConfirmTx'
import {TransactionSummary} from './TransactionSummary'

export const ConfirmTxScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigate = useNavigateTo()
  const {track} = useMetrics()
  const {openModal, closeModal} = useModal()

  const {unsignedTx, createOrder} = useSwap()
  const sellTokenInfo = useTokenInfo({
    wallet,
    tokenId: createOrder.amounts.sell.tokenId,
  })
  const buyTokenInfo = useTokenInfo({
    wallet,
    tokenId: createOrder.amounts.buy.tokenId,
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
          if (!createOrder.selectedPool) return
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

          navigate.submittedTx()
        },
        onError: () => {
          navigate.failedTx()
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
            openModal(
              wallet.isHW ? strings.chooseConnectionMethod : strings.signTransaction,
              <View style={styles.modalContent}>
                <ConfirmTx
                  wallet={wallet}
                  unsignedTx={unsignedTx}
                  onSuccess={() => {
                    closeModal()
                    navigate.submittedTx()
                  }}
                  onCancel={closeModal}
                />

                <Spacer height={16} />
              </View>,
              wallet.isHW ? 430 : 350,
            )
          }}
        />
      </Actions>

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
  modalContent: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: 16,
  },
})
