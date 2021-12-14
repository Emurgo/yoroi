import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {useSelector} from 'react-redux'

import BiometricAuthScreen from '../../legacy/components/Send/BiometricAuthScreen'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {SEND_ROUTES} from '../../legacy/RoutesList'
import {tokenBalanceSelector, tokenInfoSelector} from '../../legacy/selectors'
import {AddressReaderQR} from './AddressReaderQR'
import {AssetSelectorScreen} from './AssetSelectorScreen'
import {ConfirmScreen} from './ConfirmScreen'
import {ScannerButton} from './ScannerButton'
import {SendScreen} from './SendScreen'

/* eslint-disable @typescript-eslint/no-explicit-any */
type SendScreenNavigatorRoutes = {
  'send-ada': any
  'select-asset': any
  'address-reader-qr': any
  'send-ada-confirm': any
  'biometrics-signing': any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Stack = createStackNavigator<SendScreenNavigatorRoutes>()

export const SendScreenNavigator = () => {
  const strings = useStrings()

  const tokenBalance = useSelector(tokenBalanceSelector)
  const [selectedTokenIdentifier, setSelectedTokenIdentifier] = React.useState<string>(
    tokenBalance.getDefaultEntry().identifier,
  )
  const tokenInfos = useSelector(tokenInfoSelector)
  const [sendAll, setSendAll] = React.useState(false)

  return (
    <Stack.Navigator
      initialRouteName={SEND_ROUTES.MAIN}
      screenOptions={{
        ...defaultNavigationOptions,
        ...defaultStackNavigatorOptions,
      }}
    >
      <Stack.Screen
        name={SEND_ROUTES.MAIN}
        options={{
          title: strings.sendTitle,
          headerRight: () => <ScannerButton />,
          ...defaultNavigationOptions,
        }}
      >
        {() => (
          <SendScreen selectedTokenIdentifier={selectedTokenIdentifier} onSendAll={setSendAll} sendAll={sendAll} />
        )}
      </Stack.Screen>

      <Stack.Screen name={'select-asset'} options={{title: strings.selectAssetTitle}}>
        {({navigation}) => (
          <AssetSelectorScreen
            assetTokens={tokenBalance.values}
            assetTokenInfos={tokenInfos}
            onSelect={(token) => {
              setSendAll(false)
              setSelectedTokenIdentifier(token.identifier)
              navigation.navigate('send-ada')
            }}
            onSelectAll={() => {
              setSendAll(true)
              setSelectedTokenIdentifier(tokenBalance.getDefaultEntry().identifier)
              navigation.navigate('send-ada')
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name={SEND_ROUTES.ADDRESS_READER_QR}
        component={AddressReaderQR}
        options={{title: strings.qrScannerTitle}}
      />

      <Stack.Screen name={SEND_ROUTES.CONFIRM} component={ConfirmScreen} options={{title: strings.confirmTitle}} />

      <Stack.Screen
        name={SEND_ROUTES.BIOMETRICS_SIGNING}
        component={BiometricAuthScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

const messages = defineMessages({
  sendTitle: {
    id: 'components.send.sendscreen.title',
    defaultMessage: '!!!Send',
  },
  qrScannerTitle: {
    id: 'components.send.addressreaderqr.title',
    defaultMessage: '!!!Scan QR code address',
  },
  selectAssetTitle: {
    id: 'components.send.selectasset.title',
    defaultMessage: '!!!Select asset',
  },
  confirmTitle: {
    id: 'components.send.confirmscreen.title',
    defaultMessage: '!!!Send',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    sendTitle: intl.formatMessage(messages.sendTitle),
    qrScannerTitle: intl.formatMessage(messages.qrScannerTitle),
    selectAssetTitle: intl.formatMessage(messages.selectAssetTitle),
    confirmTitle: intl.formatMessage(messages.confirmTitle),
  }
}
