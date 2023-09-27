import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import {produce} from 'immer'
import React from 'react'
import {StyleSheet, Text} from 'react-native'

import {BottomSheet, BottomSheetRef} from '../../../../../../components'
import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {COLORS} from '../../../../../../theme'
import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {BottomSheetState} from '../CreateOrder'
import {EditSlippage} from './EditSlippage'

storiesOf('Swap Edit Slippage', module)
  .add('initial %', () => {
    const bottomSheetRef = React.useRef<null | BottomSheetRef>(null)
    const [bottomSheetState, setBottomSheetState] = React.useState<BottomSheetState>({
      title: '',
      content: '',
    })

    const openBottomSheet = ({title, content}: BottomSheetState) => {
      setBottomSheetState({
        title,
        content,
      })
      bottomSheetRef.current?.openBottomSheet()
    }

    const onCloseBottomSheet = () => {
      setBottomSheetState({title: '', content: ''})
    }

    return (
      <>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SearchProvider>
            <SwapProvider swapManager={mockSwapManager}>
              <SwapFormProvider>
                <EditSlippage openBottomSheet={openBottomSheet} />
              </SwapFormProvider>
            </SwapProvider>
          </SearchProvider>
        </SelectedWalletProvider>

        <BottomSheet ref={bottomSheetRef} title={bottomSheetState.title} onClose={onCloseBottomSheet}>
          <Text style={styles.text}>{bottomSheetState.content}</Text>
        </BottomSheet>
      </>
    )
  })
  .add('big %', () => {
    const mockSwapStateBigSlippage = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.slippage = 99.123456789
    })
    const bottomSheetRef = React.useRef<null | BottomSheetRef>(null)
    const [bottomSheetState, setBottomSheetState] = React.useState<BottomSheetState>({
      title: '',
      content: '',
    })

    const openBottomSheet = ({title, content}: BottomSheetState) => {
      setBottomSheetState({
        title,
        content,
      })
      bottomSheetRef.current?.openBottomSheet()
    }

    const onCloseBottomSheet = () => {
      setBottomSheetState({title: '', content: ''})
    }

    return (
      <>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SearchProvider>
            <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateBigSlippage}>
              <SwapFormProvider>
                <EditSlippage openBottomSheet={openBottomSheet} />
              </SwapFormProvider>
            </SwapProvider>
          </SearchProvider>
        </SelectedWalletProvider>

        <BottomSheet ref={bottomSheetRef} title={bottomSheetState.title} onClose={onCloseBottomSheet}>
          <Text style={styles.text}>{bottomSheetState.content}</Text>
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
