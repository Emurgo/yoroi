import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {BottomSheet, BottomSheetRef, Button, Spacer} from '../../../../components'
import {LoadingOverlay} from '../../../../components/LoadingOverlay'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useAuthOsWithEasyConfirmation} from '../../../../yoroi-wallets/auth'
import {useSignAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {ConfirmTx} from './ConfirmTx'
import {TransactionSummary} from './TransactionSummary'

export const ConfirmTxScreen = () => {
  const confirmTxBottomSheetRef = React.useRef<null | BottomSheetRef>(null)

  const openConfirmTxDialog = () => {
    confirmTxBottomSheetRef.current?.openDialog()
  }

  const closeConfirmTxDialog = () => {
    confirmTxBottomSheetRef.current?.closeBottomSheet()
  }
  const infoBottomSheetRef = React.useRef<null | BottomSheetRef>(null)

  const [infoBottomSheetState, setInfoBottomSheetSate] = React.useState<{
    title: string
    content: string
  }>({
    title: '',
    content: '',
  })

  const openInfo = ({title, content}: {title: string; content: string}) => {
    setInfoBottomSheetSate({title, content})
    infoBottomSheetRef.current?.openDialog()
  }

  const closeInfoBottomSheet = () => {
    setInfoBottomSheetSate({title: '', content: ''})
  }
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigate = useNavigateTo()

  const {unsignedTx} = useSwap()

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

      <BottomSheet
        height={wallet.isHW ? 430 : 350}
        ref={confirmTxBottomSheetRef}
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
      </BottomSheet>

      <BottomSheet title={infoBottomSheetState.title} ref={infoBottomSheetRef} onClose={closeInfoBottomSheet}>
        <Text style={styles.text}>{infoBottomSheetState.content}</Text>
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
  text: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#242838',
  },
})
