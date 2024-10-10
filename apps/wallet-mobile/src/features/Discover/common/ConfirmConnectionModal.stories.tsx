import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {View} from 'react-native'

import {Button} from '../../../components/Button/Button'
import {ConfirmConnectionModal, useOpenConfirmConnectionModal} from './ConfirmConnectionModal'

storiesOf('Discover ConfirmConnectionModal', module)
  .addDecorator((story) => <View style={{padding: 20}}>{story()}</View>)
  .add('initial', () => <Initial />)
  .add('With Button', () => <WithButton />)

const Initial = () => {
  return (
    <ConfirmConnectionModal
      logo="https://daehx1qv45z7c.cloudfront.net/cardano-spot.png"
      onConfirm={action('onConfirm')}
      name="Example DApp"
      website="example.com"
      showSingleAddressWarning={false}
    />
  )
}

const WithButton = () => {
  const {openConfirmConnectionModal} = useOpenConfirmConnectionModal()

  const handleOnPressNoWarning = () => {
    openConfirmConnectionModal({
      onConfirm: action('onConfirm'),
      website: 'example.com',
      name: 'Example DApp',
      logo: 'https://daehx1qv45z7c.cloudfront.net/cardano-spot.png',
      onClose: action('onClose'),
      showSingleAddressWarning: false,
    })
  }

  const handleOnPressWarning = () => {
    openConfirmConnectionModal({
      onConfirm: action('onConfirm'),
      website: 'example.com',
      name: 'Example DApp',
      logo: 'https://daehx1qv45z7c.cloudfront.net/cardano-spot.png',
      onClose: action('onClose'),
      showSingleAddressWarning: true,
    })
  }

  return (
    <View>
      <Button title="Open modal without warning" shelleyTheme onPress={handleOnPressNoWarning} />

      <Button title="Open modal with warning" shelleyTheme onPress={handleOnPressWarning} />
    </View>
  )
}
