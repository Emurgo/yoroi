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
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
import TransportHID from '@v-almonacid/react-native-hid'

import {
  BluetoothDisabledError,
  RejectedByUserError,
} from '../../crypto/shelley/ledgerUtils'
import {Text, BulletPointItem, Button} from '../UiKit'
import DeviceItem from './DeviceItem'
import {ledgerMessages, confirmationMessages} from '../../i18n/global-messages'
import {Logger} from '../../utils/logging'
import LocalizableError from '../../i18n/LocalizableError'

import styles from './styles/LedgerConnect.style'
import bleImage from '../../assets/img/bluetooth.png'
import usbImage from '../../assets/img/ledger-nano-usb.png'

import type {Device} from '@ledgerhq/react-native-hw-transport-ble'
import type {Navigation} from '../../types/navigation'
import type {DeviceId, DeviceObj} from '../../crypto/shelley/ledgerUtils'

const messages = defineMessages({
  caption: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.caption',
    defaultMessage: '!!!Scanning bluetooth devices...',
  },
  introline: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.introline',
    defaultMessage: "!!!You'll need to:",
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
  intl: IntlShape,
  defaultDevices: ?Array<Device>, // for storybook
  navigation: Navigation,
  onConnectUSB: (DeviceObj) => any,
  onConnectBLE: (DeviceId) => any,
  useUSB?: boolean,
  onWaitingMessage?: string,
  fillSpace?: boolean,
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

  _setStateSafe: (InexactSubset<State>) => void = (newState) => {
    if (this._isMounted) this.setState(newState)
  }

  reload = () => {
    this._unsubscribe()
    this._setStateSafe({
      devices: this.props.defaultDevices ? this.props.defaultDevices : [],
      deviceId: null,
      deviceObj: null,
      error: null,
      refreshing: false,
    })
    this.startScan()
  }

  _onSelectDevice = async (device: Device) => {
    if (this.state.deviceId != null) return
    this._unsubscribe()
    const {onConnectBLE} = this.props
    try {
      if (device.id == null) {
        // should never happen
        throw new Error('device id is null')
      }
      this.setState({
        deviceId: device.id.toString(),
        refreshing: false,
        waiting: true,
      })
      await onConnectBLE(device.id.toString())
    } catch (e) {
      Logger.debug(e)
      if (e instanceof RejectedByUserError) {
        this.reload()
        return
      }
      this._setStateSafe({error: e})
    } finally {
      this._setStateSafe({waiting: false})
    }
  }

  _onConfirm = async (deviceObj: ?DeviceObj): Promise<void> => {
    this._unsubscribe()
    try {
      if (deviceObj == null) {
        // should never happen
        throw new Error('deviceObj is null')
      }
      this.setState({
        waiting: true,
      })
      await this.props.onConnectUSB(deviceObj)
    } catch (e) {
      Logger.debug(e)
      if (e instanceof RejectedByUserError) {
        this.reload()
        return
      }
      this._setStateSafe({error: e})
    } finally {
      this._setStateSafe({waiting: false})
    }
  }

  renderItem = ({item}: {item: Device}) => (
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
      if (error instanceof LocalizableError) {
        errMsg = intl.formatMessage({
          id: error.id,
          // $FlowFixMe
          defaultMessage: error.defaultMessage,
        })
      } else {
        errMsg = String(error.message)
      }
    } else {
      if (waiting && typeof onWaitingMessage !== 'undefined') {
        msg = onWaitingMessage
      } else if (deviceObj != null) {
        msg = intl.formatMessage(messages.usbDeviceReady)
      }
    }
    if (msg == null) return null
    return <ListHeaderWrapper msg={msg} err={errMsg} />
  }

  render() {
    const {intl, useUSB, fillSpace} = this.props
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
        <View
          style={[styles.container, fillSpace === true && styles.fillSpace]}
        >
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
              <Text style={styles.paragraphText}>
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

export default injectIntl(LedgerConnect)
