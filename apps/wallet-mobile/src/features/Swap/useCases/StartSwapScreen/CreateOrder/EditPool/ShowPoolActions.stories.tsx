import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {BottomSheet, BottomSheetRef} from '../../../../../../components'
import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {COLORS} from '../../../../../../theme'
import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {BottomSheetState} from '../CreateOrder'
import {ShowPoolActions} from './ShowPoolActions'

storiesOf('Swap Pool Actions', module).add('initial', () => {
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
            <SwapFormProvider initialState={{isBuyTouched: true}}>
              <ShowPoolActions openBottomSheet={openBottomSheet} />
            </SwapFormProvider>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>

      <BottomSheet ref={bottomSheetRef} title={bottomSheetState.title} onClose={onCloseBottomSheet}>
        <View style={{flex: 1, padding: 8}}>
          <Text style={styles.text}>{bottomSheetState.content}</Text>
        </View>
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
