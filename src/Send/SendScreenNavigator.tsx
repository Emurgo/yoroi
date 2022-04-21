import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {useSelector} from 'react-redux'

import {Boundary} from '../components'
import {tokenBalanceSelector} from '../legacy/selectors'
import {defaultStackNavigationOptions, SendRouteNavigation, SendRoutes} from '../navigation'
import {AddressReaderQR} from './AddressReaderQR'
import {AssetSelectorScreen} from './AssetSelectorScreen'
import {ConfirmScreen} from './ConfirmScreen'
import {ScannerButton} from './ScannerButton'
import {SendScreen} from './SendScreen'

const Stack = createStackNavigator<SendRoutes>()
export const SendScreenNavigator = () => {
  const strings = useStrings()

  const tokenBalance = useSelector(tokenBalanceSelector)
  const [selectedTokenIdentifier, setSelectedTokenIdentifier] = React.useState(
    tokenBalance.getDefaultEntry().identifier,
  )
  const [sendAll, setSendAll] = React.useState(false)
  const [receiver, setReceiver] = React.useState('')
  const [amount, setAmount] = React.useState('')

  // when the selected asset is no longer available
  const selectedAsset = tokenBalance.values.find(({identifier}) => identifier === selectedTokenIdentifier)
  if (!selectedAsset) {
    setSelectedTokenIdentifier(tokenBalance.getDefaultEntry().identifier)
  }

  return (
    <Stack.Navigator initialRouteName="send-ada-main" screenOptions={defaultStackNavigationOptions}>
      <Stack.Screen
        name="send-ada-main"
        options={{
          title: strings.sendTitle,
          headerRight: () => <ScannerButton />,
        }}
      >
        {() => (
          <Boundary>
            <SendScreen
              selectedTokenIdentifier={selectedTokenIdentifier}
              onSendAll={setSendAll}
              sendAll={sendAll}
              receiver={receiver}
              setReceiver={setReceiver}
              amount={amount}
              setAmount={setAmount}
            />
          </Boundary>
        )}
      </Stack.Screen>

      <Stack.Screen name="select-asset" options={{title: strings.selectAssetTitle}}>
        {({navigation}: {navigation: SendRouteNavigation}) => (
          <AssetSelectorScreen
            assetTokens={tokenBalance.values}
            onSelect={(token) => {
              setSendAll(false)
              setSelectedTokenIdentifier(token.identifier)
              navigation.navigate('send-ada-main')
            }}
            onSelectAll={() => {
              setSendAll(true)
              setSelectedTokenIdentifier(tokenBalance.getDefaultEntry().identifier)
              navigation.navigate('send-ada-main')
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen //
        name="address-reader-qr"
        options={{title: strings.qrScannerTitle}}
      >
        {() => <AddressReaderQR setQrReceiver={setReceiver} setQrAmount={setAmount} />}
      </Stack.Screen>

      <Stack.Screen //
        name="send-ada-confirm"
        component={ConfirmScreen}
        options={{title: strings.confirmTitle}}
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
