import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '../../components'
import {COLORS} from '../../theme'

type Props = {
  disabled?: boolean
}
export const ScannerButton = ({disabled}: Props) => {
  const navigateTo = useNavigateTo()

  const color = disabled ? COLORS.TEXT_INPUT : 'black'

  return (
    <TouchableOpacity onPress={navigateTo.reader} disabled={disabled}>
      <Icon.Qr color={color} size={30} />
    </TouchableOpacity>
  )
}

const useNavigateTo = () => {
  const navigation = useNavigation()

  return {
    reader: () =>
      navigation.navigate('app-root', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'send-read-qr-code',
          },
        },
      }),
  }
}
