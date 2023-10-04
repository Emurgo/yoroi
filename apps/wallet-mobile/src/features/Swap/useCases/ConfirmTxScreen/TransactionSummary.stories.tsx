import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {BottomSheet, DialogRef, DialogState} from '../../../../components'
import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {mocks} from '../../common/mocks'
import {SwapFormProvider} from '../../common/SwapFormProvider'
import {TransactionSummary} from './TransactionSummary'

storiesOf('TransactionSummary', module) //
  .add('default', () => {
    return (
      <View style={styles.container}>
        <TxSummary />
      </View>
    )
  })

const TxSummary = () => {
  const dialogRef = React.useRef<null | DialogRef>(null)
  const [dialogState, setDialogState] = React.useState<{
    title: string
    content: string
  }>({
    title: '',
    content: '',
  })

  const openDialog = ({title, content}: DialogState) => {
    setDialogState({
      title,
      content,
    })
    dialogRef.current?.openDialog()
  }

  const onCloseBottomSheet = () => {
    setDialogState({title: '', content: ''})
  }

  return (
    <>
      <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
        <SwapProvider
          initialState={{
            ...mockSwapStateDefault,
            unsignedTx: walletMocks.yoroiUnsignedTx,
            createOrder: {...mocks.confirmTx.createOrder},
          }}
          swapManager={{
            ...mockSwapManager,
          }}
        >
          <SwapFormProvider>
            <TransactionSummary openInfo={openDialog} />
          </SwapFormProvider>
        </SwapProvider>
      </SelectedWalletProvider>

      <BottomSheet ref={dialogRef} title={dialogState.title} onClose={onCloseBottomSheet}>
        <View style={{flex: 1, padding: 8}}>
          <Text style={styles.text}>{dialogState.content}</Text>
        </View>
      </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#242838',
  },
})
