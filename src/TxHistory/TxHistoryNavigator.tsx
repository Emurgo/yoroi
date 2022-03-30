import {useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'
import {useSelector} from 'react-redux'

import {Button} from '../../legacy/components/UiKit'
import {UI_V2} from '../../legacy/config/config'
import {tokenBalanceSelector, transactionsInfoSelector} from '../../legacy/selectors'
import {COLORS} from '../../legacy/styles/config'
import {formatDateToSeconds} from '../../legacy/utils/format'
import iconGear from '../assets/img/icon/gear.png'
import {Boundary, Icon} from '../components'
import {useWalletName} from '../hooks'
import {
  AppRouteParams,
  defaultNavigationOptions,
  defaultOptionsV2,
  defaultStackNavigatorOptions,
  TxHistoryRouteParams,
  TxHistoryRoutes,
} from '../navigation'
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

const Stack = createStackNavigator<TxHistoryRoutes>()
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
  const [receiver, setReceiver] = React.useState('')
  const [amount, setAmount] = React.useState('')

  return (
    <>
      <Stack.Navigator screenOptions={defaultStackNavigatorOptions} initialRouteName="history-list">
        <Stack.Screen
          name="history-list"
          component={TxHistory}
          options={({navigation}: {navigation: AppRouteParams}) => {
            if (UI_V2) {
              return {
                ...defaultOptionsV2,
                title: walletName,
                headerRight: () => <HeaderRightHistory />,
              }
            }
            return {
              ...defaultNavigationOptions,
              headerRight: () => (
                <Button
                  onPress={() =>
                    navigation.navigate('app-root', {
                      screen: 'settings',
                      params: {
                        screen: 'settings-main',
                      },
                    })
                  }
                  iconImage={iconGear}
                  title=""
                  withoutBackground
                />
              ),
              title: walletName,
            }
          }}
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
          options={{
            ...defaultOptionsV2,
            title: strings.receiveTitle,
            headerRight: () => <ModalInfoIconButton onPress={showModalInfo} />,
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
            ...defaultNavigationOptions,
          }}
        >
          {() => (
            <Boundary>
              <SendScreen
                selectedTokenIdentifier={selectedTokenIdentifier}
                onSendAll={setSendAll}
                sendAll={sendAll}
                amount={amount}
                setAmount={setAmount}
                receiver={receiver}
                setReceiver={setReceiver}
              />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen name="select-asset" options={{title: strings.selectAssetTitle}}>
          {({navigation}: {navigation: TxHistoryRouteParams}) => (
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

        <Stack.Screen //
          name="address-reader-qr"
          options={{title: strings.qrScannerTitle}}
        >
          {() => <AddressReaderQR setQrAmount={setAmount} setQrReceiver={setReceiver} />}
        </Stack.Screen>

        <Stack.Screen //
          name="send-confirm"
          component={ConfirmScreen}
          options={{title: strings.confirmTitle}}
        />
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

  return (
    <SettingsIconButton
      onPress={() =>
        navigation.navigate('app-root', {
          screen: 'settings',
          params: {
            screen: 'settings-main',
          },
        })
      }
    />
  )
}

const styles = StyleSheet.create({
  receiveInfoText: {
    lineHeight: 24,
    fontSize: 16,
  },
})
