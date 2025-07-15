import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text, View} from 'react-native'

import image from '../../../../assets/img/ledger_2.png'
import {WalletNameForm} from './WalletNameForm'

storiesOf('WalletNameForm', module)
  .addDecorator((story) => (
    <View style={[{flex: 1, padding: 16}]}>{story()}</View>
  ))
  .add('default', () => <WalletNameForm onSubmit={action('submit')} />)
  .add('with image', () => (
    <WalletNameForm onSubmit={action('submit')} image={image} />
  ))
  .add('with containerStyle', () => (
    <WalletNameForm
      onSubmit={action('submit')}
      containerStyle={[{borderColor: 'red', borderWidth: 1}]}
    />
  ))
  .add('with topContent', () => (
    <WalletNameForm
      onSubmit={action('submit')}
      topContent={
        <View style={[{padding: 16}]}>
          <Text>Top Content</Text>
        </View>
      }
    />
  ))
  .add('with bottomContent', () => (
    <WalletNameForm
      onSubmit={action('submit')}
      bottomContent={
        <View style={[{padding: 16}]}>
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
