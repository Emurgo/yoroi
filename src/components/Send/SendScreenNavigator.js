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
import HeaderBackButton from '../UiKit/HeaderBackButton'
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

const _SendScreenNavigator = // createStackNavigator(
[
  {
    [SEND_ROUTES.MAIN]: {
      screen: SendScreen,
      navigationOptions: ({navigation}) => ({
        title: navigation.getParam('title'),
        headerRight: (
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
                        setAddress(address, navigation)
                        setAmount(params.amount, navigation)
                      }
                    } else {
                      setAddress(address, navigation)
                    }
                  } else {
                    setAddress(stringQR, navigation)
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
      }),
    },
    [SEND_ROUTES.ADDRESS_READER_QR]: AddressReaderQR,
    [SEND_ROUTES.CONFIRM]: ConfirmScreen,
    [SEND_ROUTES.BIOMETRICS_SIGNING]: {
      screen: BiometricAuthScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: SEND_ROUTES.MAIN,
    navigationOptions: ({navigation}) => ({
      title: navigation.getParam('title'),
      headerLeft: <HeaderBackButton navigation={navigation} />,
      ...defaultNavigationOptions,
    }),
    ...defaultStackNavigatorOptions,
  },
]

const Stack = createStackNavigator()

// TODO(navigation): add header back button if necessary
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
        headerRight: (
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
                        setAddress(address, navigation)
                        setAmount(params.amount, navigation)
                      }
                    } else {
                      setAddress(address, navigation)
                    }
                  } else {
                    setAddress(stringQR, navigation)
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
    <Stack.Screen name={SEND_ROUTES.ADDRESS_READER_QR} component={AddressReaderQR} />
    <Stack.Screen name={SEND_ROUTES.CONFIRM} component={ConfirmScreen} />
    <Stack.Screen
      name={SEND_ROUTES.BIOMETRICS_SIGNING}
      component={BiometricAuthScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
)

export default SendScreenNavigator
