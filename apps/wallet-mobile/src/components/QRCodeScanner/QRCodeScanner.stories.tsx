import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {Camera} from 'expo-camera'
import React from 'react'
import {Text, View} from 'react-native'

import {Spacer} from '../Spacer'
import {QRCodeScanner} from './QRCodeScanner'

storiesOf('QRCodeScanner', module).add('Default', () => <Wrapper />)

const Wrapper = () => {
  const [status] = Camera.useCameraPermissions()
  const [publicKeyHex, setPublicKeyHex] = React.useState(null)
  const [path, setPath] = React.useState(null)

  const handleOnRead = async ({data}) => {
    const parsedData = JSON.parse(data)
    setPublicKeyHex(parsedData.publicKeyHex)
    setPath(parsedData.path)
    action('onRead')
    return Promise.resolve(false)
  }

  return (
    <View style={{justifyContent: 'space-between', flex: 1}}>
      <QRCodeScanner onRead={handleOnRead} />

      <View style={{padding: 30, justifyContent: 'center'}}>
        <Text>QR DATA</Text>

        <Spacer height={5} />

        <Text>{`publicKeyHex: ${publicKeyHex}`}</Text>

        <Text>{`path: ${path}`}</Text>

        <Spacer height={20} />

        <Text>PREMISSIONS STATUS</Text>

        <Text>NOTE: To reset permissions, reinstall the app</Text>

        <Spacer height={5} />

        <Text>{`status: ${status?.status}`}</Text>

        <Text>{`granted: ${status?.granted}`}</Text>

        <Text>{`expires: ${status?.expires}`}</Text>

        <Text>{`canAskAgain: ${status?.canAskAgain}`}</Text>
      </View>
    </View>
  )
}
