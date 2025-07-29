import TransportHID from '@ledgerhq/react-native-hid'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
import {atoms as a, lightPalette, useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import * as React from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, FlatList, Image, Text, View} from 'react-native'
import {Observer} from 'rxjs'

import globalMessages, {
  confirmationMessages,
  ledgerMessages,
} from '~/kernel/i18n/global-messages'
import {LocalizableError} from '~/kernel/i18n/LocalizableError'
import {logger} from '~/kernel/logger/logger'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {BluetoothDisabledError, RejectedByUserError} from '~/wallets/hw/hw'
import {Device} from '~/wallets/types/hw'
import bleImage from '../assets/img/bluetooth.png'
import usbImage from '../assets/img/ledger-nano-usb.png'
import {BulletPointItem} from '../BulletPointItem'
import {Loading} from '../Loading/Loading'
import {DeviceItem} from './DeviceItem'

type Props = {
  intl: IntlShape
  onConnectUSB: (deviceObj: HW.DeviceObj) => Promise<void> | void
  onConnectBLE: (deviceId: string) => Promise<void> | void
  useUSB?: boolean
  onWaitingMessage?: string
}

type State = {
  devices: Array<Device>
  deviceId?: null | string
  deviceObj?: null | HW.DeviceObj
  error?: Error | null
  refreshing: boolean
  waiting: boolean
}

class LedgerConnectInt extends React.Component<Props, State> {
  state: State = {
    devices: this.props.defaultDevices ? this.props.defaultDevices : [],
    deviceId: null,
    deviceObj: null,
    error: null,
    refreshing: true,
    waiting: false,
  }

  _subscriptions: null | {unsubscribe: () => void} = null
  _bluetoothEnabled: null | boolean = null
  _transportLib: TransportHID | TransportBLE | null = null
  _isMounted = false

  componentDidMount() {
    const {useUSB} = this.props
    this._transportLib = useUSB === true ? TransportHID : TransportBLE
    this._isMounted = true
    if (useUSB === false) {
      // check if bluetooth is available
      // no need to save a reference to this subscription's unsubscribe func
      // as it's just an empty method. Rather, we make sure sate is only
      // modified when component is mounted
      let previousAvailable = false
      const observer: Observer<{available: boolean; type: string}> = {
        next: (e: {available: boolean; type: string}) => {
          if (this._isMounted) {
            logger.debug('BLE observeState event', {event: e})
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
        error: (e) => {
          logger.error(e)
        },
        complete: () => {
          logger.info('BLE observeState done')
        },
      }
      TransportBLE.observeState(observer)
    }
    this.startScan()
  }

  componentWillUnmount() {
    this._unsubscribe()
    this._isMounted = false
  }

  startScan = () => {
    const {useUSB} = this.props

    const onComplete = () => {
      logger.debug('listen: subscription completed', {useUSB})
      this.setState({refreshing: false})
    }

    const onError = (error: Error) => {
      this.setState({error, refreshing: false, devices: []})
    }

    const onBLENext = (e: {type: string; descriptor: Device}) => {
      if (e.type === 'add') {
        logger.debug('listen: new device detected', {useUSB, event: e})
        // with bluetooth, new devices are appended in the screen
        this.setState(deviceAddition(e.descriptor))
      }
    }

    const onHWNext = (e: {type: string; descriptor: HW.DeviceObj}) => {
      if (e.type === 'add') {
        logger.debug('listen: new device detected', {useUSB, event: e})
        // if a device is detected, save it in state immediately
        this.setState({refreshing: false, deviceObj: e.descriptor})
      }
    }

    this._subscriptions = this._transportLib.listen({
      complete: onComplete,
      next: useUSB ? onHWNext : onBLENext,
      error: onError,
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

  _onSelectDevice = async (device: Device) => {
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
      if (!(e instanceof Error)) return
      if (e instanceof RejectedByUserError) {
        this.reload()
        return
      }
      logger.error(e, {device})
      this.setState({error: e})
    } finally {
      this.setState({waiting: false})
    }
  }

  _onConfirm = async (deviceObj: HW.DeviceObj) => {
    this._unsubscribe()
    try {
      this.setState({
        waiting: true,
      })
      await this.props.onConnectUSB(deviceObj)
    } catch (e) {
      if (!(e instanceof Error)) return
      if (e instanceof RejectedByUserError) {
        this.reload()
        return
      }
      logger.error(e, {deviceObj})
      this.setState({error: e})
    } finally {
      this.setState({waiting: false})
    }
  }

  ListHeader = () => {
    const {error, waiting, deviceObj} = this.state
    const {intl, onWaitingMessage} = this.props
    const {atoms: ta, palette: p} = useTheme()

    const ListHeaderWrapper = ({
      msg,
      err,
    }: {
      msg: string
      err?: string | null
    }) => (
      <View style={[a.align_center, a.justify_center]}>
        <Text style={[a.pb_lg, a.body_1_lg_medium, ta.text_gray_medium]}>
          {msg}
        </Text>

        {err != null && (
          <Text style={[a.body_1_lg_medium, {color: p.sys_magenta_500}]}>
            {err}
          </Text>
        )}
      </View>
    )
    let msg, errMsg
    if (error != null) {
      msg = intl.formatMessage(messages.error)
      if (error instanceof LocalizableError) {
        errMsg = intl.formatMessage({
          id: error.name,
          defaultMessage: error.message,
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
    const {intl, useUSB} = this.props
    const {error, devices, refreshing, deviceId, deviceObj, waiting} =
      this.state

    const rows = [
      intl.formatMessage(ledgerMessages.enterPin),
      intl.formatMessage(ledgerMessages.openApp),
    ]
    return (
      <>
        <Space.Height.lg />

        <Text style={[a.body_1_lg_medium, {color: lightPalette.gray_500}]}>
          {intl.formatMessage(messages.introline)}
        </Text>

        <Space.Height.lg />

        {rows.map((row, index) => (
          <BulletPointItem
            textRow={row}
            key={index}
            style={[a.body_1_lg_regular, {color: lightPalette.gray_500}]}
          />
        ))}

        <Space.Height.lg />

        <View style={[a.align_center, a.justify_center]}>
          <Image source={useUSB === true ? usbImage : bleImage} />

          <Space.Height.lg />

          {!useUSB && (
            <Text style={[a.body_2_md_regular, {color: lightPalette.gray_500}]}>
              {intl.formatMessage(messages.caption)}
            </Text>
          )}
        </View>

        <Space.Height.lg />

        {((!useUSB && devices.length === 0) || waiting) && (
          <View style={[a.align_center, a.justify_center, a.flex_row]}>
            <Loading />
          </View>
        )}

        <FlatList
          extraData={[error, deviceId]}
          style={{flexDirection: 'column'}}
          data={devices}
          renderItem={({item}: {item: Device}) => (
            <DeviceItem
              disabled={waiting}
              device={item}
              onSelect={() => this._onSelectDevice(item)}
            />
          )}
          ListHeaderComponent={this.ListHeader}
          keyExtractor={(item) => item.id.toString()}
          horizontal={false}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />

        <Space.Height.sm fill />

        {useUSB === true && (
          <Button
            onPress={() => {
              if (refreshing || deviceObj == null || waiting) {
                return Alert.alert(
                  intl.formatMessage(globalMessages.error),
                  rows.reduce((acc, item) => acc + '\n' + item),
                )
              }
              this._onConfirm(deviceObj)
            }}
            title={intl.formatMessage(
              confirmationMessages.commonButtons.confirmButton,
            )}
            style={[a.margin_x_md, a.mb_sm]}
          />
        )}
      </>
    )
  }
}

export const LedgerConnect = (props: Omit<Props, 'intl' | 'styles'>) => {
  const intl = useIntl()

  return <LedgerConnectInt {...props} intl={intl} />
}

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

const deviceAddition =
  (device: Device) =>
  ({devices}: {devices: Device[]}) => {
    return {
      devices: devices.some((i) => i.id === device.id)
        ? devices
        : devices.concat(device),
    }
  }
