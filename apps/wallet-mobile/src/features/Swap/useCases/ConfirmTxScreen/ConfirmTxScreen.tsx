import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {InteractionManager, StyleSheet, useWindowDimensions, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, Spacer} from '../../../../components'
import {LoadingOverlay} from '../../../../components/LoadingOverlay'
import {useModal} from '../../../../components/Modal/ModalContext'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useSignAndSubmitTx, useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {YoroiSignedTx} from '../../../../yoroi-wallets/types'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {useAuthOsWithEasyConfirmation} from '../../../Auth/common/hooks'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {ConfirmTx} from './ConfirmTx'
import {TransactionSummary} from './TransactionSummary'

const BOTTOM_ACTION_SECTION = 220

export const ConfirmTxScreen = () => {
  const [contentHeight, setContentHeight] = React.useState(0)
  const strings = useStrings()
  const styles = useStyles()
  const {wallet, meta} = useSelectedWallet()
  const navigate = useNavigateTo()
  const {track} = useMetrics()
  const {openModal, closeModal} = useModal()
  const {height: deviceHeight} = useWindowDimensions()
  const signedTxRef = React.useRef<YoroiSignedTx | null>(null)

  const {unsignedTx, orderData} = useSwap()
  const sellTokenInfo = useTokenInfo({
    wallet,
    tokenId: orderData.amounts.sell.tokenId,
  })
  const buyTokenInfo = useTokenInfo({
    wallet,
    tokenId: orderData.amounts.buy.tokenId,
  })

  const minReceived = Quantities.denominated(
    orderData.selectedPoolCalculation?.buyAmountWithSlippage?.quantity ?? Quantities.zero,
    buyTokenInfo.decimals ?? 0,
  )

  const couldReceiveNoAssets = Quantities.isZero(minReceived)

  const {authWithOs, isLoading: authenticating} = useAuthOsWithEasyConfirmation(
    {id: wallet.id},
    {onSuccess: (rootKey) => signAndSubmitTx({unsignedTx, rootKey})},
  )

  const trackSwapOrderSubmitted = () => {
    if (orderData.selectedPoolCalculation === undefined) return
    track.swapOrderSubmitted({
      from_asset: [
        {asset_name: sellTokenInfo.name, asset_ticker: sellTokenInfo.ticker, policy_id: sellTokenInfo.group},
      ],
      to_asset: [{asset_name: buyTokenInfo.name, asset_ticker: buyTokenInfo.ticker, policy_id: buyTokenInfo.group}],
      order_type: orderData.type,
      slippage_tolerance: orderData.slippage,
      from_amount: orderData.amounts.sell.quantity,
      to_amount: orderData.amounts.buy.quantity,
      pool_source: orderData.selectedPoolCalculation.pool.provider,
      swap_fees: Number(orderData.selectedPoolCalculation.cost.batcherFee),
    })
  }

  const {signAndSubmitTx, isLoading: processingTx} = useSignAndSubmitTx(
    {wallet},
    {
      signTx: {
        useErrorBoundary: true,
        onSuccess: (signedTx) => {
          signedTxRef.current = signedTx
        },
      },
      submitTx: {
        onSuccess: () => {
          trackSwapOrderSubmitted()
          navigate.submittedTx(signedTxRef.current?.signedTx.id ?? '')
        },
        onError: () => {
          navigate.failedTx()
        },
        useErrorBoundary: true,
      },
    },
  )

  const onPasswordTxSuccess = (signedTx: YoroiSignedTx) => {
    trackSwapOrderSubmitted()
    closeModal()
    InteractionManager.runAfterInteractions(() => {
      navigate.submittedTx(signedTx.signedTx.id)
    })
  }

  const txIsLoading = authenticating || processingTx
  const isButtonDisabled = txIsLoading || couldReceiveNoAssets

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <View style={styles.container}>
        <KeyboardAvoidingView keyboardVerticalOffset={120}>
          <ScrollView style={styles.scroll}>
            <View
              onLayout={(event) => {
                const {height} = event.nativeEvent.layout
                setContentHeight(height + BOTTOM_ACTION_SECTION)
              }}
            >
              <TransactionSummary />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <LoadingOverlay loading={txIsLoading} />
      </View>

      <Actions
        style={{
          ...(deviceHeight < contentHeight && styles.actionBorder),
        }}
      >
        <Button
          disabled={isButtonDisabled}
          testID="swapButton"
          shelleyTheme
          title={strings.confirm}
          onPress={() => {
            if (meta.isEasyConfirmationEnabled) {
              authWithOs()
              return
            }
            openModal(
              meta.isHW ? strings.chooseConnectionMethod : strings.signTransaction,
              <View style={styles.modalContent}>
                <ConfirmTx
                  wallet={wallet}
                  unsignedTx={unsignedTx}
                  onSuccess={onPasswordTxSuccess}
                  onCancel={closeModal}
                />

                <Spacer height={16} />
              </View>,
              meta.isHW ? 430 : 350,
            )
          }}
        />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => {
  const styles = useStyles()
  return <View style={[styles.actions, style]} {...props} />
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray_cmin,
      paddingTop: 16,
    },
    container: {
      flex: 1,
      backgroundColor: color.gray_cmin,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    actions: {
      padding: 16,
      backgroundColor: color.gray_cmin,
    },
    modalContent: {
      flex: 1,
      alignSelf: 'stretch',
      ...atoms.px_lg,
    },
    scroll: {
      paddingHorizontal: 16,
    },
    actionBorder: {
      borderTopWidth: 1,
      borderTopColor: color.gray_c200,
    },
  })
  return styles
}
