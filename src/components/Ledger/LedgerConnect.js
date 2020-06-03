// @flow

import React from 'react'
import {
  View,
  ScrollView,
  FlatList,
  Image,
  Platform,
  PermissionsAndroid,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
// import TransportHID from '@ledgerhq/react-native-hid'
import TransportHID from '@v-almonacid/react-native-hid'
import {BleError} from 'react-native-ble-plx'

import {
  BluetoothDisabledError,
  GeneralConnectionError,
  LedgerUserError,
} from '../../crypto/byron/ledgerUtils'
import {Text, BulletPointItem, Button} from '../UiKit'
import DeviceItem from './DeviceItem'
import {ledgerMessages, confirmationMessages} from '../../i18n/global-messages'
import {Logger} from '../../utils/logging'

import styles from './styles/LedgerConnect.style'
import bleImage from '../../assets/img/bluetooth.png'
import usbImage from '../../assets/img/ledger-nano-usb.png'

import type {ComponentType} from 'react'
import type {Device} from '@ledgerhq/react-native-hw-transport-ble'
import type {Navigation} from '../../types/navigation'
import type {DeviceId, DeviceObj} from '../../crypto/byron/ledgerUtils'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.title',
    defaultMessage: '!!!Connect to Ledger Device',
  },
  caption: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.caption',
    defaultMessage: '!!!Scanning bluetooth devices...',
  },
  introline: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.introline',
    defaultMessage: "!!!You'll need to:",
  },
  exportKey: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.exportKey',
    defaultMessage:
      '!!!Action needed: Please, export public key from your Ledger device.',
  },
  usbDeviceReady: {
    id: 'components.ledger.ledgerconnect.usbDeviceReady',
    defaultMessage:
      '!!!USB device is ready, please tap on Confirm to continue.',
  },
  error: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.error',
    defaultMessage:
      '!!!An error occurred while trying to connect with your hardware wallet:',
  },
})

const deviceAddition = (device) => ({devices}) => {
  return {
    devices: devices.some((i) => i.id === device.id)
      ? devices
      : devices.concat(device),
  }
}

type Props = {|
  intl: intlShape,
  defaultDevices: ?Array<Device>, // for storybook
  navigation: Navigation,
  onSelectUSB: (DeviceObj) => any,
  onSelectBLE: (DeviceId) => any,
  onComplete: () => any,
  useUSB?: boolean,
  onWaitingMessage?: string,
|}

type State = {|
  devices: Array<Device>,
  deviceId: ?DeviceId,
  deviceObj: ?DeviceObj,
  error: ?Error,
  refreshing: boolean,
  waiting: boolean,
|}

class LedgerConnect extends React.Component<Props, State> {
  state = {
    devices: this.props.defaultDevices ? this.props.defaultDevices : [],
    deviceId: null,
    deviceObj: null,
    error: null,
    refreshing: false,
    waiting: false,
  }

  _subscriptions: ?{unsubscribe: () => any} = null
  _bluetoothEnabled: ?boolean = null
  _transportLib: Object = null
  _isMounted: boolean = false

  async componentDidMount() {
    const {useUSB} = this.props
    this._transportLib = useUSB === true ? TransportHID : TransportBLE
    this._isMounted = true
    if (useUSB === false) {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        )
      }
      // check if bluetooth is available
      // no need to save a reference to this subscription's unsubscribe func
      // as it's just an empty method. Rather, we make sure sate is only
      // modified when component is mounted
      let previousAvailable = false
      TransportBLE.observeState({
        next: (e) => {
          if (this._isMounted) {
            Logger.debug('BLE observeState event', e)
            if (this._bluetoothEnabled == null && !e.available) {
              this.setState({
                error: new BluetoothDisabledError(),
                refreshing: false,
              })
            }
            if (e.available !== previousAvailable) {
              previousAvailable = e.available
              this._bluetoothEnabled = e.available
              if (e.available) {
                this.reload()
              } else {
                this.setState({
                  error: new BluetoothDisabledError(),
                  refreshing: false,
                  devices: [],
                })
              }
            }
          }
        },
      })
    }
    this.startScan()
  }

  componentWillUnmount() {
    this._unsubscribe()
    this._isMounted = false
  }

  startScan = () => {
    const {useUSB} = this.props
    this.setState({refreshing: true})

    this._subscriptions = this._transportLib.listen({
      complete: () => {
        Logger.debug('listen: subscription completed')
        this.setState({refreshing: false})
      },
      next: (e) => {
        if (e.type === 'add') {
          Logger.debug('listen: new device detected')
          if (useUSB === true) {
            // if a device is detected, save it in state immediately
            this.setState({
              refreshing: false,
              deviceObj: e.descriptor,
            })
          } else {
            // with bluetooth, new devices are appended in the screen
            this.setState(deviceAddition(e.descriptor))
          }
        }
      },
      error: (error) => {
        this.setState({error, refreshing: false, devices: []})
      },
    })
  }

  _unsubscribe: () => void = () => {
    if (this._subscriptions != null) {
      this._subscriptions.unsubscribe()
      this._subscriptions = null
    }
  }

  reload = () => {
    this._unsubscribe()
    this.setState({
      devices: this.props.defaultDevices ? this.props.defaultDevices : [],
      deviceId: null,
      deviceObj: null,
      error: null,
      refreshing: false,
    })
    this.startScan()
  }

  _onSelectDevice = (device) => {
    if (this.state.deviceId != null) return
    this._unsubscribe()
    const {onSelectBLE, onComplete} = this.props
    try {
      this.setState({
        deviceId: device.id.toString(),
        refreshing: false,
        waiting: true,
      })
      onSelectBLE(device.id.toString())
    } catch (e) {
      Logger.debug(e)
    } finally {
      this.setState({waiting: false})
    }
    onComplete()
  }

  _onConfirm = (deviceObj: ?DeviceObj): void => {
    if (deviceObj == null) return // should never happen
    this.props.onSelectUSB(deviceObj)
    this.props.onComplete()
  }

  renderItem = ({item}: {item: *}) => (
    <DeviceItem device={item} onSelect={() => this._onSelectDevice(item)} />
  )

  ListHeader = () => {
    const {error, waiting, deviceObj} = this.state
    const {intl, onWaitingMessage} = this.props

    const ListHeaderWrapper = ({msg, err}: {msg: string, err: ?string}) => (
      <View style={styles.listHeader}>
        <Text style={[styles.paragraph, styles.paragraphText]}>{msg}</Text>
        {err != null && (
          <Text style={[styles.error, styles.paragraphText]}>{err}</Text>
        )}
      </View>
    )
    let msg, errMsg
    if (error != null) {
      msg = intl.formatMessage(messages.error)
      if (error instanceof BluetoothDisabledError) {
        errMsg = intl.formatMessage(ledgerMessages.bluetoothDisabledError)
      } else if (
        error instanceof BleError ||
        error instanceof GeneralConnectionError ||
        error instanceof LedgerUserError
      ) {
        errMsg = intl.formatMessage(ledgerMessages.connectionError)
      } else {
        errMsg = String(error.message)
      }
    } else {
      if (waiting && onWaitingMessage != null) {
        msg = onWaitingMessage
      } else if (deviceObj != null) {
        msg = intl.formatMessage(messages.usbDeviceReady)
      }
    }
    if (msg == null) return null
    return (
      <ListHeaderWrapper
        msg={intl.formatMessage(messages.error)}
        err={errMsg}
      />
    )
  }

  render() {
    const {intl, useUSB} = this.props
    const {
      error,
      devices,
      refreshing,
      deviceId,
      deviceObj,
      waiting,
    } = this.state

    const rows = [
      intl.formatMessage(ledgerMessages.enterPin),
      intl.formatMessage(ledgerMessages.openApp),
    ]
    return (
      <>
        <View style={styles.container}>
          <View style={styles.heading}>
            <Image source={useUSB === true ? usbImage : bleImage} />
            {useUSB === false && (
              <Text secondary style={styles.caption}>
                {intl.formatMessage(messages.caption)}
              </Text>
            )}
          </View>
          {((useUSB === false && devices.length === 0) ||
            (useUSB === true && deviceObj == null)) && (
            <View style={styles.instructionsBlock}>
              <Text styles={styles.paragraphText}>
                {intl.formatMessage(messages.introline)}
              </Text>
              {rows.map((row, i) => (
                <BulletPointItem textRow={row} key={i} style={styles.item} />
              ))}
            </View>
          )}
          <ScrollView style={styles.scrollView}>
            <FlatList
              extraData={[error, deviceId]}
              style={styles.flatList}
              contentContainerStyle={styles.flatListContentContainer}
              data={devices}
              renderItem={this.renderItem}
              ListHeaderComponent={this.ListHeader}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl
                  onRefresh={this.reload}
                  refreshing={refreshing}
                  progressViewOffset={74 /* approx. the size of one elem */}
                />
              }
            />
          </ScrollView>
        </View>
        {useUSB === true && (
          <Button
            onPress={() => this._onConfirm(deviceObj)}
            title={intl.formatMessage(
              confirmationMessages.commonButtons.confirmButton,
            )}
            style={styles.button}
            disabled={refreshing || deviceObj == null || waiting}
          />
        )}
        {waiting && <ActivityIndicator />}
      </>
    )
  }
}

type ExternalProps = {|
  navigation: Navigation,
  intl: any,
  defaultDevices: ?Array<Device>,
  useUSB: boolean,
  onWaitingMessage: string,
  onSelectUSB: (DeviceObj) => any,
  onSelectBLE: (DeviceId) => any,
  onComplete: () => any,
|}

export default injectIntl((LedgerConnect: ComponentType<ExternalProps>))
