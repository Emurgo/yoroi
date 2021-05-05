// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import {Button} from '../UiKit'
import SendScreen from './SendScreen'
import ConfirmScreen from './ConfirmScreen'
import AddressReaderQR from './AddressReaderQR'
import BiometricAuthScreen from './BiometricAuthScreen'
import iconQR from '../../assets/img/qr_code.png'
import {pastedFormatter} from './amountUtils'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'
import {SEND_ROUTES} from '../../RoutesList'

import styles from './styles/QrButton.style'

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
  const handlerAddress = route.params?.onScanAddress
  handlerAddress && handlerAddress(address)
}

const setAmount = (amount, route) => {
  const handlerAmount = route.params?.onScanAmount
  handlerAmount && handlerAmount(pastedFormatter(amount))
}

const Stack = createStackNavigator()

const SendScreenNavigator = () => (
  <Stack.Navigator
    initialRouteName={SEND_ROUTES.MAIN}
    screenOptions={({route}) => ({
      title: route.params?.title ?? undefined,
      ...defaultNavigationOptions,
      ...defaultStackNavigatorOptions,
    })}
  >
    <Stack.Screen
      name={SEND_ROUTES.MAIN}
      component={SendScreen}
      options={({navigation, route}) => ({
        title: route.params?.title ?? undefined,
        headerRight: () => (
          <Button
            style={styles.qrButton}
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
                      // note: after upgrading to react-navigation v5.x, the
                      // send screen is not unmounted after a tx is sent. If a
                      // new QR code without an amount field is scanned, the
                      // previous value may still remain in state
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
        ),
        ...defaultNavigationOptions,
      })}
    />
    <Stack.Screen
      name={SEND_ROUTES.ADDRESS_READER_QR}
      component={AddressReaderQR}
    />
    <Stack.Screen name={SEND_ROUTES.CONFIRM} component={ConfirmScreen} />
    <Stack.Screen
      name={SEND_ROUTES.BIOMETRICS_SIGNING}
      component={BiometricAuthScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
)

export default SendScreenNavigator
