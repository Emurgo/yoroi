import {atoms as a, useTheme} from '@yoroi/theme'

import React from 'react'
import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native'

import {useBluetooth} from '~/hooks/useBluetooth'
import {logger} from '~/kernel/logger/logger'
import {Button, ButtonType} from '~/ui/Button/Button'

interface BluetoothDeviceManagerProps {
  onDeviceSelect?: (deviceId: string) => void
  showConnectionStatus?: boolean
}

export const BluetoothDeviceManager: React.FC<BluetoothDeviceManagerProps> = ({
  onDeviceSelect,
  showConnectionStatus = true,
}) => {
  const {atoms: ta} = useTheme()
  const {
    state,
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    clearDiscoveredDevices,
    requestPermissions,
  } = useBluetooth()

  // Debug logging
  logger.debug('BluetoothDeviceManager state', {
    isEnabled: state.isEnabled,
    isScanning: state.isScanning,
    isConnected: state.isConnected,
    error: state.error,
    discoveredDevicesCount: state.discoveredDevices.length,
  })

  const handleConnect = async (deviceId: string) => {
    try {
      const success = await connectToDevice({deviceId})
      if (success) {
        Alert.alert('Success', 'Device connected successfully!')
        onDeviceSelect?.(deviceId)
      } else {
        Alert.alert('Error', 'Failed to connect to device')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to device')
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectFromDevice()
      Alert.alert('Success', 'Device disconnected successfully!')
    } catch (error) {
      Alert.alert('Error', 'Failed to disconnect from device')
    }
  }

  const handleRequestPermissions = async () => {
    try {
      await requestPermissions()
      Alert.alert('Success', 'Bluetooth permissions granted!')
    } catch (error) {
      Alert.alert('Error', 'Failed to get Bluetooth permissions')
    }
  }

  const getStatusColor = () => {
    if (state.error) return '#ff6b6b'
    if (state.isConnected) return '#51cf66'
    if (state.isScanning) return '#339af0'
    return '#868e96'
  }

  const getStatusText = () => {
    if (state.error) return 'Error'
    if (state.isConnected) return 'Connected'
    if (state.isScanning) return 'Scanning...'
    if (!state.isEnabled) return 'Bluetooth Disabled'
    return 'Ready'
  }

  return (
    <View style={[a.flex_1, a.p_md]}>
      {/* Header */}
      <View style={[a.flex_row, a.justify_between, a.align_center, a.pb_md]}>
        <Text style={[a.heading_3_medium, ta.text_gray_max]}>
          Bluetooth Devices
        </Text>

        {showConnectionStatus && (
          <View style={[a.flex_row, a.align_center, a.gap_xs]}>
            <View
              style={[a.rounded_full, {backgroundColor: getStatusColor()}]}
            />
            <Text style={[a.body_3_sm_regular, {color: getStatusColor()}]}>
              {getStatusText()}
            </Text>
          </View>
        )}
      </View>

      {/* Error Display */}
      {state.error && (
        <View
          style={[
            a.p_md,
            a.pb_md,
            a.rounded_md,
            {
              backgroundColor: '#fff5f5',
              borderWidth: 1,
              borderColor: '#ff6b6b',
            },
          ]}
        >
          <Text style={[a.body_3_sm_regular, {color: '#ff6b6b'}]}>
            {state.error}
          </Text>
        </View>
      )}

      {/* Connection Status */}
      {state.isConnected && state.currentDevice && (
        <View
          style={[
            a.p_md,
            a.pb_md,
            a.rounded_md,
            {
              backgroundColor: '#f8f9fa',
              borderWidth: 1,
              borderColor: '#51cf66',
            },
          ]}
        >
          <Text style={[a.body_2_md_regular, {color: '#51cf66'}, a.pb_xs]}>
            Connected to:
          </Text>
          <Text style={[a.body_3_sm_regular, ta.text_gray_max]}>
            {state.currentDevice.name || 'Unknown Device'}
          </Text>
          <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
            ID: {state.currentDevice.id}
          </Text>
          <Button
            onPress={handleDisconnect}
            type={ButtonType.Secondary}
            title="Disconnect"
            style={[a.pt_sm]}
          />
        </View>
      )}

      {/* Debug Info */}
      <View
        style={[
          a.p_md,
          a.rounded_md,
          {backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e9ecef'},
        ]}
      >
        <Text style={[a.body_3_sm_regular, ta.text_gray_low, a.pb_xs]}>
          Debug Info:
        </Text>
        <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
          • Bluetooth Enabled: {state.isEnabled ? 'Yes' : 'No'}
        </Text>
        <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
          • Scanning: {state.isScanning ? 'Yes' : 'No'}
        </Text>
        <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
          • Connected: {state.isConnected ? 'Yes' : 'No'}
        </Text>
        <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
          • Devices Found: {state.discoveredDevices.length}
        </Text>
        {state.error && (
          <Text style={[a.body_3_sm_regular, {color: '#ff6b6b'}]}>
            • Error: {state.error}
          </Text>
        )}
      </View>

      {/* Control Buttons */}
      <View style={[a.flex_row, a.gap_sm, a.pb_md]}>
        <Button
          onPress={() => (state.isScanning ? stopScan() : startScan({}))}
          type={state.isScanning ? ButtonType.Primary : ButtonType.Secondary}
          title={state.isScanning ? 'Stop Scan' : 'Start Scan'}
          disabled={!state.isEnabled}
          style={[a.flex_1]}
        />

        {state.discoveredDevices.length > 0 && (
          <Button
            onPress={clearDiscoveredDevices}
            type={ButtonType.Secondary}
            title="Clear"
            style={[a.flex_1]}
          />
        )}
      </View>

      {/* Permission Button */}
      {!state.isEnabled && (
        <View style={[a.pb_md]}>
          <Button
            onPress={handleRequestPermissions}
            type={ButtonType.Primary}
            title="Enable Bluetooth & Request Permissions"
            style={[a.flex_1]}
          />
        </View>
      )}

      {/* Device List */}
      <ScrollView style={[a.flex_1]}>
        {state.discoveredDevices.length === 0 ? (
          <View style={[a.flex_1, a.justify_center, a.align_center, a.p_lg]}>
            <Text
              style={[a.body_2_md_regular, {color: '#868e96'}, a.text_center]}
            >
              {state.isScanning
                ? 'Scanning for devices...'
                : 'No devices found. Tap "Start Scan" to discover Bluetooth devices.'}
            </Text>
          </View>
        ) : (
          <View style={[a.gap_sm]}>
            {state.discoveredDevices.map((device, index) => (
              <DeviceCard
                key={device.id}
                device={device}
                index={index}
                onConnect={handleConnect}
                isConnected={device.isConnected}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Device Count */}
      {state.discoveredDevices.length > 0 && (
        <View style={[a.pt_sm, a.border_t, {borderColor: '#e9ecef'}]}>
          <Text
            style={[a.body_3_sm_regular, {color: '#868e96'}, a.text_center]}
          >
            {state.discoveredDevices.length} device
            {state.discoveredDevices.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      )}
    </View>
  )
}

interface DeviceCardProps {
  device: any
  index: number
  onConnect: (deviceId: string) => void
  isConnected: boolean
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  index,
  onConnect,
  isConnected,
}) => {
  const {atoms: ta} = useTheme()

  const getSignalStrength = (rssi: number | null) => {
    if (rssi === null) return 'Unknown'
    if (rssi >= -50) return 'Excellent'
    if (rssi >= -60) return 'Good'
    if (rssi >= -70) return 'Fair'
    return 'Poor'
  }

  const getSignalColor = (rssi: number | null) => {
    if (rssi === null) return '#868e96'
    if (rssi >= -50) return '#51cf66'
    if (rssi >= -60) return '#339af0'
    if (rssi >= -70) return '#ffd43b'
    return '#ff6b6b'
  }

  return (
    <View
      style={[
        a.p_md,
        a.rounded_md,
        {
          backgroundColor: isConnected ? '#f8f9fa' : '#ffffff',
          borderWidth: 1,
          borderColor: isConnected ? '#51cf66' : '#e9ecef',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
      ]}
    >
      <View style={[a.flex_row, a.justify_between, a.align_start, a.pb_sm]}>
        <View style={[a.flex_1]}>
          <Text style={[a.body_2_md_regular, ta.text_gray_low, a.pb_xs]}>
            {device.name || `Device ${index + 1}`}
          </Text>
          <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
            ID: {device.id}
          </Text>
        </View>

        {isConnected && (
          <View
            style={[
              a.px_sm,
              a.py_xs,
              a.rounded_md,
              {backgroundColor: '#51cf66'},
            ]}
          >
            <Text style={[a.body_3_sm_regular, {color: '#ffffff'}]}>
              Connected
            </Text>
          </View>
        )}
      </View>

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <View style={[a.flex_row, a.align_center, a.gap_xs]}>
          <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>Signal:</Text>
          <Text
            style={[a.body_3_sm_regular, {color: getSignalColor(device.rssi)}]}
          >
            {getSignalStrength(device.rssi)} ({device.rssi} dBm)
          </Text>
        </View>

        {!isConnected && (
          <TouchableOpacity
            onPress={() => onConnect(device.id)}
            style={[
              a.px_md,
              a.py_sm,
              a.rounded_md,
              {backgroundColor: '#339af0'},
            ]}
          >
            <Text style={[a.body_3_sm_regular, {color: '#ffffff'}]}>
              Connect
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
