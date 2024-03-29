import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {RequestedAdaPaymentWithLinkScreen} from './RequestedAdaPaymentWithLinkScreen'

storiesOf('Links ShowDisclaimer', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('trusted source', () => (
    <RequestedAdaPaymentWithLinkScreen
      params={{
        message: 'message',
        link: 'web+cardano://$stackchain?amount1',
      }}
      isTrusted
      onContinue={action('onContinue')}
    />
  ))
  .add('untrusted source', () => (
    <RequestedAdaPaymentWithLinkScreen
      params={{
        message: 'message',
        link: 'web+cardano://$stackchain?amount1',
      }}
      onContinue={action('onContinue')}
    />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
