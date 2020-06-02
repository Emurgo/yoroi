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

  subscriptions = null
  bluetoothEnabled: ?boolean = null
  transportLib: Object = null

  async componentDidMount() {
    const {useUSB} = this.props
    this.transportLib = useUSB === true ? TransportHID : TransportBLE
    if (useUSB === false) {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        )
      }
      // check if bluetooth is available
      let previousAvailable = false
      TransportBLE.observeState({
        next: (e) => {
          if (this.bluetoothEnabled == null && !e.available) {
            this.setState({
              error: new BluetoothDisabledError(),
              refreshing: false,
            })
          }
          if (e.available !== previousAvailable) {
            previousAvailable = e.available
            if (e.available) {
              this.bluetoothEnabled = e.available
              this.reload()
            }
          }
        },
      })
    }
    this.startScan()
  }

  componentWillUnmount() {
    if (this.subscriptions != null) this.subscriptions.unsubscribe()
  }

  startScan = () => {
    const {useUSB} = this.props
    this.setState({refreshing: true})

    this.subscriptions = this.transportLib.listen({
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
        this.setState({error, refreshing: false})
      },
    })
  }

  reload = () => {
    if (this.subscriptions != null) this.subscriptions.unsubscribe()
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
    if (this.subscriptions != null) this.subscriptions.unsubscribe()
    const {onSelectBLE, onComplete} = this.props
    this.setState(
      {deviceId: device.id.toString(), refreshing: false, waiting: true},
      () => onSelectBLE(device.id.toString()),
    )
    this.setState({waiting: false})
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
    const {error, waiting} = this.state
    const {intl, onWaitingMessage} = this.props
    if (error != null) {
      let msg
      if (error instanceof BluetoothDisabledError) {
        msg = intl.formatMessage(ledgerMessages.bluetoothDisabledError)
      } else if (
        error instanceof BleError ||
        error instanceof GeneralConnectionError ||
        error instanceof LedgerUserError
      ) {
        msg = intl.formatMessage(ledgerMessages.connectionError)
      } else {
        msg = String(error.message)
      }
      return (
        <View style={styles.listHeader}>
          <Text style={[styles.paragraph, styles.paragraphText]}>
            {intl.formatMessage(messages.error)}
          </Text>
          <Text style={[styles.error, styles.paragraphText]}>{msg}</Text>
        </View>
      )
    } else if (waiting && onWaitingMessage != null) {
      return (
        <View style={styles.listHeader}>
          <Text style={[styles.paragraph, styles.paragraphText]}>
            {onWaitingMessage}
          </Text>
        </View>
      )
    } else {
      return null
    }
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
