import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ModalProvider} from '../../../../components'
import {AskToOpenWalletScreen} from './AskToOpenAWalletScreen'

storiesOf('Links AskToOpenAWallet', module)
  .addDecorator((story) => (
    <ModalProvider>
      <View style={styles.container}>{story()}</View>
    </ModalProvider>
  ))
  .add('initial', () => <AskToOpenWalletScreen />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
