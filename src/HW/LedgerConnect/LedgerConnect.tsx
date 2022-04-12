/* eslint-disable @typescript-eslint/no-explicit-any */
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
import TransportHID from '@v-almonacid/react-native-hid'
import React from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, injectIntl} from 'react-intl'
import {
  ActivityIndicator,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import bleImage from '../../assets/img/bluetooth.png'
import usbImage from '../../assets/img/ledger-nano-usb.png'
import {BulletPointItem, Button, Text} from '../../components'
import {confirmationMessages, ledgerMessages} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'
import type {DeviceId, DeviceObj} from '../../legacy/ledgerUtils'
import {BluetoothDisabledError, RejectedByUserError} from '../../legacy/ledgerUtils'
import {Logger} from '../../legacy/logging'
import {COLORS, spacing} from '../../theme'
import {Device} from '../../types'
import {DeviceItem} from './DeviceItem'

type Props = {
  intl: IntlShape
  defaultDevices?: Array<Device> | null // for storybook
  onConnectUSB: (deviceObj: DeviceObj) => void
  onConnectBLE: (deviceId: DeviceId) => void
  useUSB?: boolean
  onWaitingMessage?: string
  fillSpace?: boolean
}

type State = {
  devices: Array<Device>
  deviceId?: null | DeviceId
  deviceObj?: null | DeviceObj
  error?: any
  refreshing: boolean
  waiting: boolean
}

// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
class _LedgerConnect extends React.Component<Props, State> {
  state: State = {
    devices: this.props.defaultDevices ? this.props.defaultDevices : [],
    deviceId: null,
    deviceObj: null,
    error: null,
    refreshing: false,
    waiting: false,
  }

  _subscriptions: null | {unsubscribe: () => void} = null
  _bluetoothEnabled: null | boolean = null
  _transportLib: any = null
  _isMounted = false

  async componentDidMount() {
    const {useUSB} = this.props
    this._transportLib = useUSB === true ? TransportHID : TransportBLE
    this._isMounted = true
    if (useUSB === false) {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
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

  _setStateSafe = (newState) => {
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
      Logger.debug(e as any)
      if (e instanceof RejectedByUserError) {
        this.reload()
        return
      }
      this._setStateSafe({error: e})
    } finally {
      this._setStateSafe({waiting: false})
    }
  }

  _onConfirm = async (deviceObj?: DeviceObj | null): Promise<void> => {
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
      Logger.debug(e as any)
      if (e instanceof RejectedByUserError) {
        this.reload()
        return
      }
      this._setStateSafe({error: e})
    } finally {
      this._setStateSafe({waiting: false})
    }
  }

  ListHeader = () => {
    const {error, waiting, deviceObj} = this.state
    const {intl, onWaitingMessage} = this.props

    const ListHeaderWrapper = ({msg, err}: {msg: string; err?: string | null}) => (
      <View style={styles.listHeader}>
        <Text style={[styles.paragraph, styles.paragraphText]}>{msg}</Text>
        {err != null && <Text style={[styles.error, styles.paragraphText]}>{err}</Text>}
      </View>
    )
    let msg, errMsg
    if (error != null) {
      msg = intl.formatMessage(messages.error)
      if (error instanceof LocalizableError) {
        errMsg = intl.formatMessage({
          id: error.id,
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
    const {error, devices, refreshing, deviceId, deviceObj, waiting} = this.state

    const rows = [intl.formatMessage(ledgerMessages.enterPin), intl.formatMessage(ledgerMessages.openApp)]
    return (
      <>
        <View style={[styles.container, fillSpace === true && styles.fillSpace]}>
          <View style={styles.heading}>
            <Image source={useUSB === true ? usbImage : bleImage} />
            {useUSB === false && (
              <Text secondary style={styles.caption}>
                {intl.formatMessage(messages.caption)}
              </Text>
            )}
          </View>
          {((useUSB === false && devices.length === 0) || (useUSB === true && deviceObj == null)) && (
            <View style={styles.instructionsBlock}>
              <Text style={styles.paragraphText}>{intl.formatMessage(messages.introline)}</Text>
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
              renderItem={({item}: {item: Device}) => (
                <DeviceItem device={item} onSelect={() => this._onSelectDevice(item)} />
              )}
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
            title={intl.formatMessage(confirmationMessages.commonButtons.confirmButton)}
            style={styles.button}
            disabled={refreshing || deviceObj == null || waiting}
          />
        )}
        {waiting && <ActivityIndicator color={'black'} />}
      </>
    )
  }
}

export const LedgerConnect = injectIntl(_LedgerConnect)

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
    defaultMessage: '!!!USB device is ready, please tap on Confirm to continue.',
  },
  error: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.error',
    defaultMessage: '!!!An error occurred while trying to connect with your hardware wallet:',
  },
})

const deviceAddition =
  (device) =>
  ({devices}) => {
    return {
      devices: devices.some((i) => i.id === device.id) ? devices : devices.concat(device),
    }
  }

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  fillSpace: {
    flex: 1,
  },
  scrollView: {
    marginBottom: 22,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  caption: {
    marginTop: 12,
  },
  flatList: {
    flex: 1,
    flexDirection: 'column',
    height: 150,
  },
  flatListContentContainer: {
    flexGrow: 1,
  },
  listHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  error: {
    color: COLORS.ERROR_TEXT_COLOR,
  },
  instructionsBlock: {
    marginVertical: 24,
  },
  paragraphText: {
    fontSize: 14,
    lineHeight: 22,
  },
  item: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
  },
  button: {
    marginHorizontal: 10,
    marginBottom: 8,
  },
})
