import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {Boundary, Icon} from '../components'
import {useTransactionInfos, useWalletName} from '../hooks'
import {formatDateToSeconds} from '../legacy/format'
import {
  defaultStackNavigationOptions,
  defaultStackNavigationOptionsV2,
  TxHistoryRoutes,
  useWalletNavigation,
} from '../navigation'
import {ReceiveScreen} from '../Receive/ReceiveScreen'
import {useSelectedWallet} from '../SelectedWallet'
import {AddressReaderQR} from '../Send/AddressReaderQR'
import {AssetSelectorScreen} from '../Send/AssetSelectorScreen'
import {ConfirmScreen} from '../Send/ConfirmScreen'
import {SendProvider} from '../Send/Context/SendContext'
import {ScannerButton} from '../Send/ScannerButton'
import {SendScreen} from '../Send/SendScreen'
import {COLORS} from '../theme'
import {ModalInfo} from './ModalInfo'
import {TxDetails} from './TxDetails'
import {TxHistory} from './TxHistory'

const Stack = createStackNavigator<TxHistoryRoutes>()
export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const walletName = useWalletName(wallet)
  const transactionInfos = useTransactionInfos(wallet)
  const [modalInfoState, setModalInfoState] = React.useState(false)
  const showModalInfo = () => setModalInfoState(true)
  const hideModalInfo = () => setModalInfoState(false)

  return (
    <SendProvider key={wallet.id} wallet={wallet}>
      <Stack.Navigator screenOptions={defaultStackNavigationOptions} initialRouteName="history-list">
        <Stack.Screen
          name="history-list"
          component={TxHistory}
          options={{
            ...defaultStackNavigationOptionsV2,
            title: walletName,
            headerRight: () => <HeaderRightHistory />,
          }}
        />

        <Stack.Screen
          name="history-details"
          component={TxDetails}
          options={({route}) => ({
            title: formatDateToSeconds(transactionInfos[route.params.id]?.submittedAt),
          })}
        />

        <Stack.Screen
          name="receive"
          component={ReceiveScreen}
          options={{
            ...defaultStackNavigationOptionsV2,
            title: strings.receiveTitle,
            headerRight: () => <ModalInfoIconButton onPress={showModalInfo} style={styles.modalInfo} />,
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              backgroundColor: '#fff',
            },
          }}
        />

        <Stack.Screen
          name="send"
          options={{
            title: strings.sendTitle,
            headerRight: () => <ScannerButton />,
          }}
        >
          {() => (
            <Boundary>
              <SendScreen />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen name="select-asset" options={{title: strings.selectAssetTitle}}>
          {() => (
            <Boundary>
              <AssetSelectorScreen />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen //
          name="address-reader-qr"
          component={AddressReaderQR}
          options={{title: strings.qrScannerTitle}}
        />

        <Stack.Screen //
          name="send-confirm"
          component={ConfirmScreen}
          options={{title: strings.confirmTitle}}
        />
      </Stack.Navigator>

      <ModalInfo hideModalInfo={hideModalInfo} visible={modalInfoState}>
        <Text style={styles.receiveInfoText}>{strings.receiveInfoText}</Text>
      </ModalInfo>
    </SendProvider>
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
  const {navigateToSettings} = useWalletNavigation()

  return <SettingsIconButton style={styles.settingIconButton} onPress={() => navigateToSettings()} />
}

const styles = StyleSheet.create({
  receiveInfoText: {
    lineHeight: 24,
    fontSize: 16,
  },
  settingIconButton: {
    width: 40,
  },
  modalInfo: {
    paddingRight: 12,
  },
})
