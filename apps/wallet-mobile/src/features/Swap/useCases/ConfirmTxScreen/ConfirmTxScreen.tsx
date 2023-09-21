import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {BottomSheet, BottomSheetRef, Button, Spacer} from '../../../../components'
import {LoadingOverlay} from '../../../../components/LoadingOverlay'
import {useWalletNavigation} from '../../../../navigation'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useAuthOsWithEasyConfirmation} from '../../../../yoroi-wallets/auth'
import {useSignAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {ConfirmTx} from './ConfirmTx'
import {TransactionSummary} from './TransactionSummary'

export const ConfirmTxScreen = () => {
  const bottomSheetRef = React.useRef<null | BottomSheetRef>(null)

  const openBottomSheet = () => {
    bottomSheetRef.current?.openBottomSheet()
  }

  const closeBottomSheet = () => {
    bottomSheetRef.current?.closeBottomSheet()
  }

  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigate = useNavigateTo()

  const {unsignedTx, createOrder} = useSwap()

  const {resetToTxHistory} = useWalletNavigation()

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
            openBottomSheet()
          }}
        />
      </Actions>

      <BottomSheet
        height={wallet.isHW ? 430 : 350}
        ref={bottomSheetRef}
        title={wallet.isHW ? strings.chooseConnectionMethod : strings.signTransaction}
        isExtendable={false}
      >
        <View style={styles.modalContent}>
          <ConfirmTx
            wallet={wallet}
            unsignedTx={unsignedTx}
            datum={{data: createOrder.datum}}
            onSuccess={resetToTxHistory}
            onCancel={closeBottomSheet}
          />

          <Spacer height={16} />
        </View>
      </BottomSheet>

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
