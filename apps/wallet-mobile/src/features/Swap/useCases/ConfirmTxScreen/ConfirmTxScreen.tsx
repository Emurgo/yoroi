import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components'
import {BottomSheetModal} from '../../../../components/BottomSheetModal'
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
  const [confirmationModal, setConfirmationModal] = React.useState<boolean>(false)

  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigate = useNavigateTo()

  const {unsignedTx, createOrder} = useSwap()

  console.log('TESTTSTSTSTR', {datum: createOrder.datum, datumHash: createOrder.datumHash})

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
