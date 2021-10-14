// @flow

import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {StyleSheet} from 'react-native'

import iconQR from '../../assets/img/qr_code.png'
import {SEND_ROUTES} from '../../RoutesList'
import {Button} from '../UiKit'
import {pastedFormatter} from './amountUtils'

export const ScannerButton = () => {
  const navigation = useNavigation()
  const route = useRoute()

  return (
    <Button
      style={styles.scannerButton}
      onPress={() =>
        navigation.navigate(SEND_ROUTES.ADDRESS_READER_QR, {
          onSuccess: (stringQR) => {
            const regex = /(cardano):([a-zA-Z1-9]\w+)\??/

            if (regex.test(stringQR)) {
              const address = stringQR.match(regex)[2]
              if (stringQR.indexOf('?') !== -1) {
                const index = stringQR.indexOf('?')
                const params = getParams(stringQR.substr(index))
                if ('amount' in params) {
                  setAddress(address, route)
                  setAmount(params.amount, route)
                }
              } else {
                setAddress(address, route)
                setAmount('', route)
              }
            } else {
              setAddress(stringQR, route)
              setAmount('', route)
            }
            navigation.navigate(SEND_ROUTES.MAIN)
          },
        })
      }
      iconImage={iconQR}
      title=""
      withoutBackground
    />
  )
}

const getParams = (params) => {
  const query = params.substr(1)
  const result = {}
  query.split('?').forEach((part) => {
    const item = part.split('=')
    result[item[0]] = decodeURIComponent(item[1])
  })
  return result
}

const setAddress = (address, route) => {
  const handlerAddress: ((string) => void) | void = (route.params?.onScanAddress: any)
  handlerAddress && handlerAddress(address)
}

const setAmount = (amount, route) => {
  const handlerAmount: ((string) => void) | void = (route.params?.onScanAmount: any)

  handlerAmount && handlerAmount(pastedFormatter(amount))
}

const styles = StyleSheet.create({
  scannerButton: {
    height: '80%',
  },
})
