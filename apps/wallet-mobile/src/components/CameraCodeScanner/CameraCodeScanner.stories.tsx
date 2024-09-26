import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {BarCodeScannerResult} from 'expo-barcode-scanner'
import {Camera} from 'expo-camera'
import React from 'react'
import {Text, View} from 'react-native'

import {Button} from '../Button/NewButton'
import {Spacer} from '../Spacer/Spacer'
import {CameraCodeScanner} from './CameraCodeScanner'

storiesOf('QRCodeScanner', module).add('Default', () => <Wrapper />)

const Wrapper = () => {
  const [status] = Camera.useCameraPermissions()
  const [publicKeyHex, setPublicKeyHex] = React.useState(null)
  const [path, setPath] = React.useState(null)
  const [withMask, setWithMask] = React.useState(true)

  const handleOnRead = async ({data}: BarCodeScannerResult) => {
    const parsedData = JSON.parse(data)

    setPublicKeyHex(parsedData.publicKeyHex)
    setPath(parsedData.path)
    action('onRead')

    return Promise.resolve(true)
  }

  return (
    <View style={{justifyContent: 'space-between', flex: 1}}>
      <CameraCodeScanner onRead={handleOnRead} withMask={withMask} />

      <View style={{padding: 10}}>
        <Info text="QR DATA" />

        <Spacer height={5} />

        <Info text={`publicKeyHex: ${publicKeyHex}`} />

        <Info text={`path: ${path}`} />

        <Spacer height={20} />

        <Info text="PREMISSIONS STATUS" />

        <Info text="NOTE: To reset permissions, reinstall the app" />

        <Spacer height={5} />

        <Info text={`status: ${status?.status}`} />

        <Info text={`granted: ${status?.granted}`} />

        <Info text={`expires: ${status?.expires}`} />

        <Info text={`canAskAgain: ${status?.canAskAgain}`} />
      </View>

      <Button title={withMask ? 'Remove Mask' : 'Add Mask'} onPress={() => setWithMask(!withMask)} />
    </View>
  )
}

const Info = ({text}: {text: string}) => <Text style={{color: 'white'}}>{text}</Text>
