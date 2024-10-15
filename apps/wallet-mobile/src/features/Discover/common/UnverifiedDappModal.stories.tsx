import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {View} from 'react-native'

import {Button} from '../../../components/Button/Button'
import {UnverifiedDappModal, useOpenUnverifiedDappModal} from './UnverifiedDappModal'

storiesOf('Discover UnverifiedDappModal', module)
  .addDecorator((story) => <View style={{padding: 20}}>{story()}</View>)
  .add('initial', () => <Initial />)
  .add('With Button', () => <WithButton />)

const Initial = () => {
  return <UnverifiedDappModal onConfirm={action('onConfirm')} />
}

const WithButton = () => {
  const {openUnverifiedDappModal} = useOpenUnverifiedDappModal()

  const handleOnPress = () => {
    openUnverifiedDappModal({
      onConfirm: action('onConfirm'),
      onClose: action('onClose'),
    })
  }

  return <Button title="Open Modal" onPress={handleOnPress} />
}
