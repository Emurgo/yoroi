import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {ModalProvider} from '../../../../components/Modal/ModalContext'
import {AskToRedirectScreen} from './AskToRedirectScreen'

storiesOf('Links AskToRedirect', module)
  .addDecorator((story) => (
    <ModalProvider>
      <View style={styles.container}>{story()}</View>
    </ModalProvider>
  ))
  .add('initial', () => <AskToRedirectScreen link="https://yoroi-wallet.com" />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
