// @flow

import React from 'react'
import {
  View,
  SafeAreaView,
  ScrollView,
  FlatList,
  Image,
  Platform,
  PermissionsAndroid,
  RefreshControl,
} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {compose} from 'redux'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
import {ErrorCodes} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {BleError} from 'react-native-ble-plx'

import {
  getHWDeviceInfo,
  BluetoothDisabledError,
  GeneralConnectionError,
  LedgerUserError,
} from '../../../crypto/byron/ledgerUtils'
import {Text, BulletPointItem, ProgressStep} from '../../UiKit'
import {withNavigationTitle} from '../../../utils/renderUtils'
import DeviceItem from './DeviceItem'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {ledgerMessages} from '../../../i18n/global-messages'

import styles from './styles/ConnectNanoXScreen.style'
import image from '../../../assets/img/bluetooth.png'

import type {ComponentType} from 'react'
import type {Device} from '@ledgerhq/react-native-hw-transport-ble'
import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.title',
    defaultMessage: '!!!Connect to Ledger',
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

const deviceAddition = (device) => ({devices}) => ({
  devices: devices.some((i) => i.id === device.id)
    ? devices
    : devices.concat(device),
})

type Props = {|
  intl: intlShape,
  defaultDevices: ?Array<Device>, // for storybook
  navigation: Navigation,
|}

type State = {|
  devices: Array<Device>,
  deviceId: ?string,
  error: ?Error,
  refreshing: boolean,
  bip44AccountPublic: ?string,
|}

class ConnectNanoXScreen extends React.Component<Props, State> {
  state = {
    devices: this.props.defaultDevices ? this.props.defaultDevices : [],
    deviceId: null,
    error: null,
    refreshing: false,
    bip44AccountPublic: null,
  }

  subscriptions = null
  bluetoothEnabled: ?boolean = null

  async componentDidMount() {
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
    this.startScan()
  }

  componentWillUnmount() {
    if (this.subscriptions != null) this.subscriptions.unsubscribe()
  }

  startScan = () => {
    this.setState({refreshing: true})
    this.subscriptions = TransportBLE.listen({
      complete: () => {
        this.setState({refreshing: false})
      },
      next: (e) => {
        if (e.type === 'add') {
          this.setState(deviceAddition(e.descriptor))
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
      devices: [],
      deviceId: null,
      error: null,
      refreshing: false,
    })
    this.startScan()
  }

  onSelectDevice = (device) => {
    if (this.state.deviceId != null) return
    this.setState({deviceId: device.id, refreshing: false}, () =>
      this.navigateToSave(),
    )
  }

  navigateToSave = async () => {
    try {
      const {deviceId} = this.state
      const {navigation} = this.props
      const transport = await TransportBLE.open(deviceId)
      const hwDeviceInfo = await getHWDeviceInfo(transport)
      const bip44AccountPublic = hwDeviceInfo?.bip44AccountPublic
      this.setState({bip44AccountPublic})
      navigation.navigate(WALLET_INIT_ROUTES.SAVE_NANO_X, {hwDeviceInfo})
    } catch (error) {
      if (error.statusCode === ErrorCodes.ERR_REJECTED_BY_USER) {
        this.reload()
        return
      }
      this.setState({error, refreshing: false})
    }
  }

  renderItem = ({item}: {item: *}) => (
    <DeviceItem device={item} onSelect={() => this.onSelectDevice(item)} />
  )

  ListHeader = () => {
    const {error, deviceId, bip44AccountPublic} = this.state
    const {intl} = this.props
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
    } else if (deviceId != null && bip44AccountPublic == null) {
      return (
        <View style={styles.listHeader}>
          <Text style={[styles.paragraph, styles.paragraphText]}>
            {intl.formatMessage(messages.exportKey)}
          </Text>
        </View>
      )
    } else {
      return null
    }
  }

  render() {
    const {intl} = this.props
    const {error, devices, refreshing, deviceId} = this.state

    const rows = [
      intl.formatMessage(ledgerMessages.enterPin),
      intl.formatMessage(ledgerMessages.openApp),
    ]
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <ProgressStep currentStep={2} totalSteps={3} displayStepNumber />
        <View style={styles.container}>
          <View style={styles.heading}>
            <Image source={image} />
            <Text secondary style={styles.caption}>
              {intl.formatMessage(messages.caption)}
            </Text>
          </View>
          {devices.length === 0 && (
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
      </SafeAreaView>
    )
  }
}

type ExternalProps = {|
  navigation: Navigation,
  intl: any,
  defaultDevices: ?Array<Device>,
|}

export default injectIntl(
  (compose(withNavigationTitle(({intl}) => intl.formatMessage(messages.title)))(
    ConnectNanoXScreen,
  ): ComponentType<ExternalProps>),
)
