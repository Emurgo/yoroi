import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ButtonCard} from './ButtonCard'

storiesOf('AddWallet ButtonCard', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with icon', () => (
    <ButtonCard title="Create new wallet" onPress={() => action('Create new wallet selected')} icon="create" />
  ))
  .add('without icon', () => (
    <ButtonCard title="Create new wallet" onPress={() => action('Create new wallet selected')} />
  ))
  .add('with subtitle', () => (
    <ButtonCard
      title="Cardano Mainnet"
      onPress={() => action('Create new wallet selected')}
      subTitle="Works with real ADA"
    />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
