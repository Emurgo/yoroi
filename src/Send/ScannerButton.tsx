import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '../components'

export const ScannerButton = () => {
  const navigateTo = useNavigateTo()

  return (
    <TouchableOpacity onPress={navigateTo.reader}>
      <Icon.Qr color="black" size={30} />
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
            screen: 'address-reader-qr',
          },
        },
      }),
  }
}
