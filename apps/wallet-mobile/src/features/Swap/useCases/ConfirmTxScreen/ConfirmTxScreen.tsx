import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Dialog, DialogRef, Spacer} from '../../../../components'
import {LoadingOverlay} from '../../../../components/LoadingOverlay'
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
  const confirmTxDialogRef = React.useRef<null | DialogRef>(null)

  const openConfirmTxDialog = () => {
    confirmTxDialogRef.current?.openDialog()
  }

  const closeConfirmTxDialog = () => {
    confirmTxDialogRef.current?.closeDialog()
  }
  const infoDialogRef = React.useRef<null | DialogRef>(null)

  const [infoDialogState, setInfoDialogState] = React.useState<{
    title: string
    content: string
  }>({
    title: '',
    content: '',
  })

  const openInfo = ({title, content}: {title: string; content: string}) => {
    setInfoDialogState({title, content})
    infoDialogRef.current?.openDialog()
  }

  const closeInfoBottomSheet = () => {
    setInfoDialogState({title: '', content: ''})
  }
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigate = useNavigateTo()
  const {track} = useMetrics()

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
      <TransactionSummary openInfo={openInfo} />

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
            openConfirmTxDialog()
          }}
        />
      </Actions>

      <Dialog
        height={wallet.isHW ? 430 : 350}
        ref={confirmTxDialogRef}
        title={wallet.isHW ? strings.chooseConnectionMethod : strings.signTransaction}
      >
        <View style={styles.modalContent}>
          <ConfirmTx
            wallet={wallet}
            unsignedTx={unsignedTx}
            onSuccess={() => {
              closeConfirmTxDialog()
              navigate.submittedTx()
            }}
            onCancel={closeConfirmTxDialog}
          />

          <Spacer height={16} />
        </View>
      </Dialog>

      <Dialog title={infoDialogState.title} ref={infoDialogRef} onClose={closeInfoBottomSheet}>
        <Text style={styles.text}>{infoDialogState.content}</Text>
      </Dialog>

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
  text: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#242838',
  },
})
