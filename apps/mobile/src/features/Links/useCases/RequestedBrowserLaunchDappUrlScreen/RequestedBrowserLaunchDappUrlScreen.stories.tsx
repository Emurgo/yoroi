import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {RequestedBrowserLaunchDappUrlScreen} from './RequestedBrowserLaunchDappUrlScreen'

storiesOf('Links Browser Launch Dapp Url ShowDisclaimer', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('trusted source', () => (
    <RequestedBrowserLaunchDappUrlScreen
      params={{
        message: 'message - trusted',
        dappUrl: 'https://cardanoscan.io',
      }}
      isTrusted
      onContinue={action('onContinue')}
    />
  ))
  .add('untrusted source', () => (
    <RequestedBrowserLaunchDappUrlScreen
      params={{
        message: 'message - untrusted',
        dappUrl: 'https://cardanoscan.io',
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
