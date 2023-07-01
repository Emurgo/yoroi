import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import image from '../../assets/img/ledger_2.png'
import {WalletNameForm} from './WalletNameForm'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    padding: 16,
  },
  containerStyle: {
    borderColor: 'red',
    borderWidth: 1,
  },
})

storiesOf('WalletNameForm', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('default', () => <WalletNameForm onSubmit={action('submit')} />)
  .add('with image', () => <WalletNameForm onSubmit={action('submit')} image={image} />)
  .add('with containerStyle', () => (
    <WalletNameForm onSubmit={action('submit')} containerStyle={styles.containerStyle} />
  ))
  .add('with topContent', () => (
    <WalletNameForm
      onSubmit={action('submit')}
      topContent={
        <View style={styles.contentContainer}>
          <Text>Top Content</Text>
        </View>
      }
    />
  ))
  .add('with bottomContent', () => (
    <WalletNameForm
      onSubmit={action('submit')}
      bottomContent={
        <View style={styles.contentContainer}>
          <Text>Bottom Content</Text>
        </View>
      }
    />
  ))
  .add('with progress', () => (
    <WalletNameForm
      onSubmit={action('submit')}
      progress={{
        currentStep: 1,
        totalSteps: 4,
      }}
    />
  ))
  .add('isWaiting', () => (
    <WalletNameForm onSubmit={action('submit')} isWaiting /> // probably broken
  ))
