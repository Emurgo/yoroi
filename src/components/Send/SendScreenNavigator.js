// @flow

import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {useSelector} from 'react-redux'

import iconQR from '../../assets/img/qr_code.png'
import type {TokenEntry} from '../../crypto/MultiToken'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../navigationOptions'
import {SEND_ROUTES} from '../../RoutesList'
import {tokenBalanceSelector, tokenInfoSelector} from '../../selectors'
import {Button} from '../UiKit'
import AddressReaderQR from './AddressReaderQR'
import {pastedFormatter} from './amountUtils'
import AssetSelectorScreen from './AssetSelectorScreen/AssetSelectorScreen'
import BiometricAuthScreen from './BiometricAuthScreen'
import ConfirmScreen from './ConfirmScreen'
import SendScreen from './SendScreen'
import styles from './styles/QrButton.style'

const messages = defineMessages({
  sendTitle: {
    id: 'components.send.sendscreen.title',
    defaultMessage: '!!!Send',
  },
  qrScannerTitle: {
    id: 'components.send.addressreaderqr.title',
    defaultMessage: '!!!Scan QR code address',
  },
  confirmTitle: {
    id: 'components.send.confirmscreen.title',
    defaultMessage: '!!!Send',
  },
})

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

type SendScreenNavigatorRoutes = {
  'send-ada': any,
  'select-asset': any,
  'address-reader-qr': any,
  'send-ada-confirm': any,
  'biometrics-signing': any,
}

const Stack = createStackNavigator<any, SendScreenNavigatorRoutes, any>()

const SendScreenNavigator = () => {
  const intl = useIntl()

  const tokenBalance = useSelector(tokenBalanceSelector)
  const [selectedAsset, setSelectedAsset] = React.useState<TokenEntry>(tokenBalance.getDefaultEntry())
  const tokenInfos = useSelector(tokenInfoSelector)
  const [sendAll, setSendAll] = React.useState(false)

  return (
    <Stack.Navigator
      initialRouteName={SEND_ROUTES.MAIN}
      screenOptions={({route}) => ({
        // $FlowFixMe mixed is incompatible with string
        title: route.params?.title ?? undefined,
        ...defaultNavigationOptions,
        ...defaultStackNavigatorOptions,
      })}
    >
      <Stack.Screen
        name={SEND_ROUTES.MAIN}
        options={({navigation, route}) => ({
          title: intl.formatMessage(messages.sendTitle),
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
      >
        {() => <SendScreen selectedAsset={selectedAsset} onSendAll={setSendAll} sendAll={sendAll} />}
      </Stack.Screen>

      <Stack.Screen name={'select-asset'} options={{title: 'Select Asset'}}>
        {({navigation}) => (
          <AssetSelectorScreen
            assetTokens={tokenBalance.values}
            assetTokenInfos={tokenInfos}
            onSelect={(token) => {
              setSendAll(false)
              setSelectedAsset(token)
              navigation.navigate('send-ada')
            }}
            onSelectAll={() => {
              setSendAll(true)
              setSelectedAsset(tokenBalance.getDefaultEntry())
              navigation.navigate('send-ada')
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name={SEND_ROUTES.ADDRESS_READER_QR}
        component={AddressReaderQR}
        options={{title: intl.formatMessage(messages.qrScannerTitle)}}
      />

      <Stack.Screen
        name={SEND_ROUTES.CONFIRM}
        component={ConfirmScreen}
        options={{title: intl.formatMessage(messages.confirmTitle)}}
      />

      <Stack.Screen
        name={SEND_ROUTES.BIOMETRICS_SIGNING}
        component={BiometricAuthScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

export default SendScreenNavigator
