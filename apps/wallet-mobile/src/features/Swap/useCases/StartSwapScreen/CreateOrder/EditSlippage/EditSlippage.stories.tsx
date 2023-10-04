import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import {produce} from 'immer'
import React from 'react'
import {StyleSheet, Text} from 'react-native'

import {BottomSheet, DialogRef} from '../../../../../../components'
import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {COLORS} from '../../../../../../theme'
import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {BottomSheetState} from '../CreateOrder'
import {EditSlippage} from './EditSlippage'

storiesOf('Swap Edit Slippage', module)
  .add('initial %', () => {
    const dialog = React.useRef<null | DialogRef>(null)
    const [dialogState, setDialogtState] = React.useState<BottomSheetState>({
      title: '',
      content: '',
    })

    const openDialog = ({title, content}: BottomSheetState) => {
      setDialogtState({
        title,
        content,
      })
      dialog.current?.openDialog()
    }

    const onCloseBottomSheet = () => {
      setDialogtState({title: '', content: ''})
    }

    return (
      <>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SearchProvider>
            <SwapProvider swapManager={mockSwapManager}>
              <SwapFormProvider>
                <EditSlippage openDialog={openDialog} />
              </SwapFormProvider>
            </SwapProvider>
          </SearchProvider>
        </SelectedWalletProvider>

        <BottomSheet ref={dialog} title={dialogState.title} onClose={onCloseBottomSheet}>
          <Text style={styles.text}>{dialogState.content}</Text>
        </BottomSheet>
      </>
    )
  })
  .add('big %', () => {
    const mockSwapStateBigSlippage = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.slippage = 99.123456789
    })
    const dialog = React.useRef<null | DialogRef>(null)
    const [dialogState, setDialogtState] = React.useState<BottomSheetState>({
      title: '',
      content: '',
    })

    const openDialog = ({title, content}: BottomSheetState) => {
      setDialogtState({
        title,
        content,
      })
      dialog.current?.openDialog()
    }

    const onCloseBottomSheet = () => {
      setDialogtState({title: '', content: ''})
    }

    return (
      <>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SearchProvider>
            <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateBigSlippage}>
              <SwapFormProvider>
                <EditSlippage openDialog={openDialog} />
              </SwapFormProvider>
            </SwapProvider>
          </SearchProvider>
        </SelectedWalletProvider>

        <BottomSheet ref={dialog} title={dialogState.title} onClose={onCloseBottomSheet}>
          <Text style={styles.text}>{dialogState.content}</Text>
        </BottomSheet>
      </>
    )
  })

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    paddingTop: 10,
  },
  flex: {
    flex: 1,
  },
  actions: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_GRAY,
  },
  text: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#242838',
  },
})
