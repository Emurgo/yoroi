import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {Camera} from 'expo-camera'
import React from 'react'
import {Text, View} from 'react-native'

import {Button} from '../Button'
import {Spacer} from '../Spacer'
import {QRCodeScanner} from './QRCodeScanner'

storiesOf('QRCodeScanner', module).add('Default', () => <Wrapper />)

const Wrapper = () => {
  const [status] = Camera.useCameraPermissions()
  const [publicKeyHex, setPublicKeyHex] = React.useState(null)
  const [path, setPath] = React.useState(null)
  const [maskEnabled, setMaskEnabled] = React.useState(true)

  const handleOnRead = async ({data}) => {
    const parsedData = JSON.parse(data)

    setPublicKeyHex(parsedData.publicKeyHex)
    setPath(parsedData.path)
    action('onRead')

    return Promise.resolve(true)
  }

  return (
    <View style={{justifyContent: 'space-between', flex: 1}}>
      <QRCodeScanner onRead={handleOnRead} maskEnabled={maskEnabled} />

      <View style={{padding: 10}}>
        <Text style={{color: 'white'}}>QR DATA</Text>

        <Spacer height={5} />

        <Text style={{color: 'white'}}>{`publicKeyHex: ${publicKeyHex}`}</Text>

        <Text style={{color: 'white'}}>{`path: ${path}`}</Text>

        <Spacer height={20} />

        <Text style={{color: 'white'}}>PREMISSIONS STATUS</Text>

        <Text style={{color: 'white'}}>NOTE: To reset permissions, reinstall the app</Text>

        <Spacer height={5} />

        <Text style={{color: 'white'}}>{`status: ${status?.status}`}</Text>

        <Text style={{color: 'white'}}>{`granted: ${status?.granted}`}</Text>

        <Text style={{color: 'white'}}>{`expires: ${status?.expires}`}</Text>

        <Text style={{color: 'white'}}>{`canAskAgain: ${status?.canAskAgain}`}</Text>
      </View>

      <Button title={maskEnabled ? 'Remove Mask' : 'Add Mask'} onPress={() => setMaskEnabled(!maskEnabled)} />
    </View>
  )
}
