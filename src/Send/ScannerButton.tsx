import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {StyleSheet} from 'react-native'

import iconQR from '../../assets/img/qr_code.png'
import {pastedFormatter} from '../../legacy/components/Send/amountUtils'
import {Button} from '../../legacy/components/UiKit'
import {SEND_ROUTES} from '../../legacy/RoutesList'

export const ScannerButton = () => {
  const navigation = useNavigation()
  const route = useRoute()

  return (
    <Button
      style={styles.scannerButton}
      onPress={() =>
        navigation.navigate(SEND_ROUTES.ADDRESS_READER_QR, {
          onSuccess: (stringQR: string) => {
            const regex = /(cardano):([a-zA-Z1-9]\w+)\??/

            if (regex.test(stringQR)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const address = (stringQR.match(regex) as any)[2]

              if (stringQR.indexOf('?') !== -1) {
                const index = stringQR.indexOf('?')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const params: any = getParams(stringQR.substr(index))

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
  const handlerAddress: ((string) => void) | void = route.params?.onScanAddress
  handlerAddress && handlerAddress(address)
}

const setAmount = (amount, route) => {
  const handlerAmount: ((string) => void) | void = route.params?.onScanAmount

  handlerAmount && handlerAmount(pastedFormatter(amount))
}

const styles = StyleSheet.create({
  scannerButton: {
    height: '80%',
  },
})
