import {atoms as a, lightPalette, useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'

import TransportHID from '@ledgerhq/react-native-hid'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
import * as React from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, FlatList, Image, Text, View} from 'react-native'
import {Observer} from 'rxjs'

import bleImage from '~/assets/img/bluetooth.png'
import usbImage from '~/assets/img/ledger-nano-usb.png'
import {DeviceItem} from '~/features/HW/LedgerConnect/DeviceItem/DeviceItem'
import {LocalizableError} from '~/kernel/i18n/LocalizableError'
import {
  confirmationMessages,
  globalMessages,
  ledgerMessages,
} from '~/kernel/i18n/messages'
import {logger} from '~/kernel/logger/logger'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {BluetoothDisabledError, RejectedByUserError} from '~/wallets/hw/hw'
import {Device} from '~/wallets/types/hw'

import {BulletPointItem} from '../BulletPointItem'
import {Loading} from '../Loading/Loading'

type ListHeaderWrapperProps = {
  msg: string
  err?: string | null
}

const ListHeaderWrapper = ({msg, err}: ListHeaderWrapperProps) => {
  const {atoms: ta, palette: p} = useTheme()
  return (
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
}

type Props = {
  intl: IntlShape
  onConnectUSB: (deviceObj: HW.DeviceObj) => Promise<void> | void
  onConnectBLE: (deviceId: string) => Promise<void> | void
  useUSB?: boolean
  onWaitingMessage?: string
  defaultDevices?: Device[]
}

function LedgerConnectInt(props: Props): React.ReactElement {
  const {
    intl,
    useUSB,
    defaultDevices,
    onConnectUSB,
    onConnectBLE,
    onWaitingMessage,
  } = props

  const [devices, setDevices] = React.useState<Array<Device>>(
    defaultDevices ?? [],
  )
  const [deviceId, setDeviceId] = React.useState<string | null>(null)
  const [deviceObj, setDeviceObj] = React.useState<HW.DeviceObj | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const [refreshing, setRefreshing] = React.useState(true)
  const [waiting, setWaiting] = React.useState(false)

  const subscriptionsRef = React.useRef<{unsubscribe: () => void} | null>(null)
  const bluetoothEnabledRef = React.useRef<boolean | null>(null)
  const transportLibRef = React.useRef<
    typeof TransportHID | typeof TransportBLE | null
  >(null)
  const isMountedRef = React.useRef(true)

  const startScan = React.useCallback(() => {
    const onComplete = () => {
      logger.debug('listen: subscription completed', {useUSB})
      setRefreshing(false)
    }

    const onError = (error: Error) => {
      setError(error)
      setRefreshing(false)
      setDevices([])
    }

    const onBLENext = (e: {type: string; descriptor: Device}) => {
      if (e.type === 'add') {
        logger.debug('listen: new device detected', {useUSB, event: e})
        setDevices((prev) =>
          prev.some((d) => d.id === e.descriptor.id)
            ? prev
            : [...prev, e.descriptor],
        )
      }
    }

    const onHWNext = (e: {type: string; descriptor: HW.DeviceObj}) => {
      if (e.type === 'add') {
        logger.debug('listen: new device detected', {useUSB, event: e})
        setRefreshing(false)
        setDeviceObj(e.descriptor)
      }
    }

    if (transportLibRef.current == null) return
    subscriptionsRef.current = transportLibRef.current.listen({
      complete: onComplete,
      next: useUSB ? onHWNext : onBLENext,
      error: onError,
    })
  }, [useUSB])

  const unsubscribe = React.useCallback(() => {
    if (subscriptionsRef.current != null) {
      subscriptionsRef.current.unsubscribe()
      subscriptionsRef.current = null
    }
  }, [])

  const reload = React.useCallback(() => {
    unsubscribe()
    setDevices(defaultDevices ?? [])
    setDeviceId(null)
    setDeviceObj(null)
    setError(null)
    setRefreshing(false)
    startScan()
  }, [defaultDevices, startScan, unsubscribe])

  React.useEffect(() => {
    transportLibRef.current = useUSB === true ? TransportHID : TransportBLE
    isMountedRef.current = true

    if (useUSB === false) {
      let previousAvailable = false
      const observer: Observer<{available: boolean; type: string}> = {
        next: (e: {available: boolean; type: string}) => {
          if (isMountedRef.current) {
            logger.debug('BLE observeState event', {event: e})
            if (bluetoothEnabledRef.current == null && !e.available) {
              setError(new BluetoothDisabledError())
              setRefreshing(false)
            }
            if (e.available !== previousAvailable) {
              previousAvailable = e.available
              bluetoothEnabledRef.current = e.available
              if (e.available) {
                reload()
              } else {
                setError(new BluetoothDisabledError())
                setRefreshing(false)
                setDevices([])
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

    startScan()

    return () => {
      unsubscribe()
      isMountedRef.current = false
    }
  }, [useUSB, startScan, reload, unsubscribe])

  const onSelectDevice = React.useCallback(
    async (device: Device) => {
      unsubscribe()
      try {
        if (device.id == null) {
          throw new Error('device id is null')
        }
        setDeviceId(device.id.toString())
        setRefreshing(false)
        setWaiting(true)
        await onConnectBLE(device.id.toString())
      } catch (e) {
        if (!(e instanceof Error)) return
        if (e instanceof RejectedByUserError) {
          reload()
          return
        }
        logger.error(e, {device})
        setError(e)
      } finally {
        setWaiting(false)
      }
    },
    [onConnectBLE, reload, unsubscribe],
  )

  const onConfirm = React.useCallback(
    async (deviceObj: HW.DeviceObj) => {
      unsubscribe()
      try {
        setWaiting(true)
        await onConnectUSB(deviceObj)
      } catch (e) {
        if (!(e instanceof Error)) return
        if (e instanceof RejectedByUserError) {
          reload()
          return
        }
        logger.error(e, {deviceObj})
        setError(e)
      } finally {
        setWaiting(false)
      }
    },
    [onConnectUSB, reload, unsubscribe],
  )

  const ListHeader = React.useCallback(() => {
    let msg, errMsg
    if (error != null) {
      msg = intl.formatMessage(messages.error)
      if (error instanceof LocalizableError) {
        errMsg = intl.formatMessage(error.descriptor)
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
  }, [error, waiting, deviceObj, intl, onWaitingMessage])

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
            onSelect={() => onSelectDevice(item)}
          />
        )}
        ListHeaderComponent={ListHeader}
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
            onConfirm(deviceObj)
          }}
          title={intl.formatMessage(
            confirmationMessages.commonButtons.confirmButton,
          )}
          style={[a.px_md, a.pb_sm]}
        />
      )}
    </>
  )
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
