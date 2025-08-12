import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Alert} from 'react-native'
import {PinInput} from '~/features/Auth/ui/shared/PinInput/PinInput'

export const TempPinLoginScreen = () => {
  const navigation = useNavigation<any>()

  const checkPin = (pin: string) => {
    if (pin === '000000') {
      navigation.navigate('manage-wallets', {screen: 'wallet-selection'})
      return
    }
    Alert.alert('Incorret PIN')
  }

  return <PinInput pinMaxLength={6} title="Enter PIN" onDone={checkPin} />
}
