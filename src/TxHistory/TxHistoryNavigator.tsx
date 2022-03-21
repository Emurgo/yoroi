import {useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'
import {useSelector} from 'react-redux'

import BiometricAuthScreen from '../../legacy/components/Send/BiometricAuthScreen'
import {Button} from '../../legacy/components/UiKit'
import {UI_V2} from '../../legacy/config/config'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {TX_HISTORY_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {tokenBalanceSelector, transactionsInfoSelector} from '../../legacy/selectors'
import {COLORS} from '../../legacy/styles/config'
import {formatDateToSeconds} from '../../legacy/utils/format'
import iconGear from '../assets/img/icon/gear.png'
import {Boundary, Icon} from '../components'
import {useWalletName} from '../hooks'
import {buildOptionsWithDefault, TxHistoryStackParamList, TxHistoryStackRootProps} from '../navigation'
import {ReceiveScreen} from '../Receive/ReceiveScreen'
import {useSelectedWallet} from '../SelectedWallet'
import {AddressReaderQR} from '../Send/AddressReaderQR'
import {AssetSelectorScreen} from '../Send/AssetSelectorScreen'
import {ConfirmScreen} from '../Send/ConfirmScreen'
import {ScannerButton} from '../Send/ScannerButton'
import {SendScreen} from '../Send/SendScreen'
import {ModalInfo} from './ModalInfo'
import {TxDetails} from './TxDetails'
import {TxHistory} from './TxHistory'

const Stack = createStackNavigator<TxHistoryStackParamList>()

export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)
  const transactionInfos = useSelector(transactionsInfoSelector)
  const tokenBalance = useSelector(tokenBalanceSelector)
  const [modalInfoState, setModalInfoState] = React.useState(false)
  const showModalInfo = () => setModalInfoState(true)
  const hideModalInfo = () => setModalInfoState(false)
  const [selectedTokenIdentifier, setSelectedTokenIdentifier] = React.useState(
    tokenBalance.getDefaultEntry().identifier,
  )
  const [sendAll, setSendAll] = React.useState(false)

  return (
    <>
      <Stack.Navigator screenOptions={defaultStackNavigatorOptions} initialRouteName={TX_HISTORY_ROUTES.MAIN}>
        <Stack.Screen
          name="history-list"
          component={TxHistory}
          options={
            UI_V2
              ? buildOptionsWithDefault({title: walletName, headerRight: () => <HeaderRightHistory />})
              : buildOptionsWithDefaultV1(walletName || '')
          }
        />

        <Stack.Screen
          name="history-details"
          component={TxDetails}
          options={({route}) => ({
            title: formatDateToSeconds(transactionInfos[route.params.id].submittedAt),
            ...defaultNavigationOptions,
          })}
        />

        <Stack.Screen
          name="receive"
          component={ReceiveScreen}
          options={buildOptionsWithDefault({
            title: strings.receiveTitle,
            headerRight: () => <ModalInfoIconButton onPress={showModalInfo} />,
            backgroundColor: '#fff',
          })}
        />

        <Stack.Screen
          name="send"
          options={{
            title: strings.sendTitle,
            headerRight: () => <ScannerButton />,
            ...defaultNavigationOptions,
          }}
        >
          {() => (
            <Boundary>
              <SendScreen selectedTokenIdentifier={selectedTokenIdentifier} onSendAll={setSendAll} sendAll={sendAll} />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen name="select-asset" options={{title: strings.selectAssetTitle}}>
          {({navigation}: {navigation: TxHistoryStackRootProps}) => (
            <AssetSelectorScreen
              assetTokens={tokenBalance.values}
              onSelect={(token) => {
                setSendAll(false)
                setSelectedTokenIdentifier(token.identifier)
                navigation.navigate('send')
              }}
              onSelectAll={() => {
                setSendAll(true)
                setSelectedTokenIdentifier(tokenBalance.getDefaultEntry().identifier)
                navigation.navigate('send')
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="address-reader-qr" component={AddressReaderQR} options={{title: strings.qrScannerTitle}} />

        <Stack.Screen //
          name="send-confirm"
          component={ConfirmScreen}
          options={{title: strings.confirmTitle}}
        />

        <Stack.Screen name="biometrics-signing" component={BiometricAuthScreen} options={{headerShown: false}} />
      </Stack.Navigator>
      <ModalInfo hideModalInfo={hideModalInfo} visible={modalInfoState}>
        <Text style={styles.receiveInfoText}>{strings.receiveInfoText}</Text>
      </ModalInfo>
    </>
  )
}

const messages = defineMessages({
  receiveTitle: {
    id: 'components.receive.receivescreen.title',
    defaultMessage: '!!!Receive',
  },
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
  receiveInfoText: {
    id: 'components.receive.receivescreen.infoText',
    defaultMessage:
      '!!!Share this address to receive payments. ' +
      'To protect your privacy, new addresses are ' +
      'generated automatically once you use them.',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    receiveTitle: intl.formatMessage(messages.receiveTitle),
    sendTitle: intl.formatMessage(messages.sendTitle),
    qrScannerTitle: intl.formatMessage(messages.qrScannerTitle),
    selectAssetTitle: intl.formatMessage(messages.selectAssetTitle),
    confirmTitle: intl.formatMessage(messages.confirmTitle),
    receiveInfoText: intl.formatMessage(messages.receiveInfoText),
  }
}

const ModalInfoIconButton = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity {...props}>
      <Icon.Info size={25} color={COLORS.ACTION_GRAY} />
    </TouchableOpacity>
  )
}

const SettingsIconButton = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity {...props}>
      <Icon.Settings size={30} color={COLORS.ACTION_GRAY} />
    </TouchableOpacity>
  )
}

const HeaderRightHistory = () => {
  const navigation = useNavigation()

  return <SettingsIconButton onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)} />
}

const buildOptionsWithDefaultV1 =
  (title: string) =>
  ({navigation}) => ({
    ...defaultNavigationOptions,
    headerRight: () => (
      <Button
        onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}
        iconImage={iconGear}
        title=""
        withoutBackground
      />
    ),
    title,
  })

const styles = StyleSheet.create({
  receiveInfoText: {
    lineHeight: 24,
    fontSize: 16,
  },
})
