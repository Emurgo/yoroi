import {time} from '@yoroi/common'

import * as React from 'react'
import {Permission, PermissionsAndroid, Platform} from 'react-native'
import {BleManager, Device, LogLevel, State} from 'react-native-ble-plx'

import {logger} from '~/kernel/logger/logger'

import {useBackgroundTimerControl} from './BackgroundTimerContext'

export interface BluetoothDevice {
  id: string
  name: string | null
  rssi: number | null
  isConnected: boolean
  device: Device
}

export interface BluetoothState {
  isScanning: boolean
  isConnected: boolean
  isEnabled: boolean
  currentDevice: BluetoothDevice | null
  discoveredDevices: BluetoothDevice[]
  error: string | null
  isRequestingPermissions: boolean
}

export interface UseBluetoothReturn {
  state: BluetoothState

  startScan: ({timeout}: {timeout?: number}) => Promise<void>
  stopScan: () => void
  connectToDevice: ({
    deviceId,
    timeout,
  }: {
    deviceId: string
    timeout?: number
  }) => Promise<boolean>
  disconnectFromDevice: () => Promise<void>
  requestPermissions: () => Promise<void>
  getDeviceById: (deviceId: string) => BluetoothDevice | undefined
  clearDiscoveredDevices: () => void
}

const BLUETOOTH_SCAN = 'android.permission.BLUETOOTH_SCAN'
const BLUETOOTH_CONNECT = 'android.permission.BLUETOOTH_CONNECT'

const getBluetoothPermissions = (): Array<Permission> => {
  const permissions: Array<Permission> = [
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]

  if (Platform.OS === 'android' && Number(Platform.Version) >= 31) {
    permissions.push(BLUETOOTH_CONNECT as Permission)
    permissions.push(BLUETOOTH_SCAN as Permission)
  }

  return permissions
}

const requestBluetoothPermissions = async (): Promise<void> => {
  if (Platform.OS !== 'android') return Promise.resolve()

  const permissions = getBluetoothPermissions()
  const statuses = await PermissionsAndroid.requestMultiple(permissions)
  const denied = Object.values(statuses).some((value) => value === 'denied')

  return denied
    ? Promise.reject(new Error('Bluetooth permissions denied'))
    : Promise.resolve()
}

export const useBluetooth = (): UseBluetoothReturn => {
  const {disable, enable} = useBackgroundTimerControl()
  const [state, setState] = React.useState<BluetoothState>({
    isScanning: false,
    isConnected: false,
    isEnabled: false,
    currentDevice: null,
    discoveredDevices: [],
    error: null,
    isRequestingPermissions: false,
  })

  const bleManagerRef = React.useRef<BleManager | null>(null)
  const scanTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const connectionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const initializeBleManager =
    React.useCallback(async (): Promise<BleManager> => {
      if (bleManagerRef.current) {
        return bleManagerRef.current
      }

      logger.debug('Initializing BLE manager...')
      const ble = new BleManager()
      bleManagerRef.current = ble

      ble.setLogLevel(LogLevel.Debug)

      const initialState = await ble.state()
      logger.debug('Initial BLE state:', {initialState})
      setState((prev) => ({
        ...prev,
        isEnabled: initialState === State.PoweredOn,
      }))

      ble.onStateChange((newState) => {
        logger.debug('BLE state changed:', {newState})
        setState((prev) => ({...prev, isEnabled: newState === State.PoweredOn}))
      }, true)

      return ble
    }, [])

  const requestPermissions = React.useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({
        ...prev,
        isRequestingPermissions: true,
        error: null,
      }))
      logger.debug('Requesting Bluetooth permissions...')

      // Disable background timer before requesting permissions
      disable()
      await requestBluetoothPermissions()

      logger.debug('Bluetooth permissions granted')
      setState((prev) => ({
        ...prev,
        isRequestingPermissions: false,
        error: null,
      }))
    } catch (error) {
      logger.error('Failed to request permissions:', {error})
      setState((prev) => ({
        ...prev,
        isRequestingPermissions: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to request Bluetooth permissions',
      }))
      throw error
    } finally {
      // Re-enable background timer after permission dialog is dismissed
      enable()
    }
  }, [disable, enable])

  const stopScan = React.useCallback(() => {
    if (bleManagerRef.current) {
      bleManagerRef.current.stopDeviceScan()
    }

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }

    setState((prev) => ({...prev, isScanning: false}))
    logger.debug('BLE scan stopped')
  }, [])

  const startScan = React.useCallback(
    async ({timeout = time.seconds(10)}: {timeout?: number}): Promise<void> => {
      try {
        logger.debug('Starting scan process...')
        setState((prev) => ({...prev, error: null, isScanning: true}))

        logger.debug('Requesting permissions...')
        await requestPermissions()

        logger.debug('Initializing BLE manager...')
        const ble = await initializeBleManager()

        const bleState = await ble.state()
        logger.debug('Current BLE state:', {bleState})
        if (bleState !== State.PoweredOn) {
          logger.debug('BLE is not enabled, attempting to enable...')
          await ble.enable()

          await new Promise((resolve) => setTimeout(resolve, 1000))

          const newState = await ble.state()
          logger.debug('BLE state after enable attempt:', {newState})
        }

        setState((prev) => ({...prev, discoveredDevices: []}))

        logger.debug('Starting BLE device scan...')
        await ble.startDeviceScan(
          [],
          {allowDuplicates: false},
          (error, device) => {
            if (error) {
              logger.debug('BLE scan error:', {error})
              setState((prev) => ({
                ...prev,
                error: `Scan error: ${error.message}`,
                isScanning: false,
              }))
              return
            }

            if (device) {
              logger.debug('Discovered device:', {
                name: device.name || 'Unknown',
                id: device.id,
              })
              setState((prev) => {
                // Check if device already exists
                const exists = prev.discoveredDevices.find(
                  (d) => d.id === device.id,
                )
                if (!exists) {
                  const bluetoothDevice: BluetoothDevice = {
                    id: device.id,
                    name: device.name,
                    rssi: device.rssi,
                    isConnected: false,
                    device,
                  }
                  return {
                    ...prev,
                    discoveredDevices: [
                      ...prev.discoveredDevices,
                      bluetoothDevice,
                    ],
                  }
                }
                return prev
              })
            }
          },
        )

        scanTimeoutRef.current = setTimeout(() => {
          stopScan()
        }, timeout)
      } catch (error) {
        logger.error('Failed to start scan:', {error})
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Failed to start scan',
          isScanning: false,
        }))
      }
    },
    [requestPermissions, initializeBleManager, stopScan],
  )

  const connectToDevice = React.useCallback(
    async ({
      deviceId,
      timeout = time.seconds(10),
    }: {
      deviceId: string
      timeout?: number
    }): Promise<boolean> => {
      try {
        setState((prev) => ({...prev, error: null}))

        const device = state.discoveredDevices.find(
          (d) => d.id === deviceId,
        )?.device

        if (!device) {
          throw new Error(`Device with ID ${deviceId} not found`)
        }

        logger.debug(`Connecting to device: ${device.name || deviceId}`, {
          deviceId,
        })

        const connectionPromise = device.connect({timeout})

        connectionTimeoutRef.current = setTimeout(() => {
          logger.debug('Connection timeout', {deviceId})
        }, timeout)

        const connectedDevice = await connectionPromise
        logger.debug('Device connected successfully', {deviceId})

        await connectedDevice.discoverAllServicesAndCharacteristics()
        logger.debug('Services and characteristics discovered', {deviceId})

        const bluetoothDevice: BluetoothDevice = {
          id: connectedDevice.id,
          name: connectedDevice.name,
          rssi: connectedDevice.rssi,
          isConnected: true,
          device: connectedDevice,
        }

        setState((prev) => ({
          ...prev,
          isConnected: true,
          currentDevice: bluetoothDevice,
          discoveredDevices: prev.discoveredDevices.map((d) =>
            d.id === deviceId ? {...d, isConnected: true} : d,
          ),
        }))

        connectedDevice.onDisconnected((error, disconnectedDevice) => {
          logger.debug('Device disconnected:', {
            name: disconnectedDevice?.name || disconnectedDevice?.id,
            deviceId,
          })
          if (error) {
            logger.error('Device disconnected with error:', {error})
          }
          setState((prev) => ({
            ...prev,
            isConnected: false,
            currentDevice: null,
            discoveredDevices: prev.discoveredDevices.map((d) =>
              d.id === disconnectedDevice?.id ? {...d, isConnected: false} : d,
            ),
          }))
        })

        return true
      } catch (error) {
        logger.error('Failed to connect to device:', {error, deviceId})
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to connect to device',
        }))
        return false
      } finally {
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current)
          connectionTimeoutRef.current = null
        }
      }
    },
    [state.discoveredDevices],
  )

  const disconnectFromDevice = React.useCallback(async (): Promise<void> => {
    try {
      if (state.currentDevice) {
        logger.debug('Disconnecting from device:', {
          name: state.currentDevice.name || state.currentDevice.id,
          deviceId: state.currentDevice.id,
        })
        await state.currentDevice.device.cancelConnection()

        setState((prev) => ({
          ...prev,
          isConnected: false,
          currentDevice: null,
          discoveredDevices: prev.discoveredDevices.map((d) =>
            d.id === state.currentDevice?.id ? {...d, isConnected: false} : d,
          ),
        }))
      }
    } catch (error) {
      logger.error('Failed to disconnect:', {
        error,
        deviceId: state.currentDevice?.id,
      })
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disconnect',
      }))
    }
  }, [state.currentDevice])

  const getDeviceById = React.useCallback(
    (deviceId: string): BluetoothDevice | undefined => {
      return state.discoveredDevices.find((d) => d.id === deviceId)
    },
    [state.discoveredDevices],
  )

  const clearDiscoveredDevices = React.useCallback(() => {
    setState((prev) => ({...prev, discoveredDevices: []}))
  }, [])

  React.useEffect(() => {
    const initBle = async () => {
      try {
        logger.debug('Auto-initializing BLE manager...')
        await initializeBleManager()
      } catch (error) {
        logger.error('Failed to auto-initialize BLE manager:', {error})
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to initialize Bluetooth',
        }))
      }
    }

    initBle()
  }, [initializeBleManager])

  React.useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
        scanTimeoutRef.current = null
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
        connectionTimeoutRef.current = null
      }
      if (bleManagerRef.current) {
        bleManagerRef.current.destroy()
        bleManagerRef.current = null
      }
    }
  }, [])

  return {
    state,
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    requestPermissions,
    getDeviceById,
    clearDiscoveredDevices,
  }
}
