/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {StyleSheet} from 'react-native'

import iconQR from '../../legacy/assets/img/qr_code.png'
import {Button} from '../../legacy/components/UiKit'
import {UI_V2} from '../../legacy/config/config'

export const ScannerButton = () => {
  const navigation = useNavigation()

  return (
    <Button
      style={styles.scannerButton}
      onPress={() => {
        if (UI_V2) {
          navigation.navigate('app-root', {
            screen: 'main-wallet-routes',
            params: {
              screen: 'history',
              params: {
                screen: 'address-reader-qr',
              },
            },
          })
        } else {
          navigation.navigate('app-root', {
            screen: 'main-wallet-routes',
            params: {
              screen: 'send-ada',
              params: {
                screen: 'address-reader-qr',
              },
            },
          })
        }
      }}
      iconImage={iconQR}
      title=""
      withoutBackground
    />
  )
}

const styles = StyleSheet.create({
  scannerButton: {
    height: '80%',
  },
})
