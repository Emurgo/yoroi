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
  ActivityIndicator,
} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {compose} from 'redux'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
// import TransportHID from '@ledgerhq/react-native-hid'
import TransportHID from '@v-almonacid/react-native-hid'
import {ErrorCodes} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {BleError} from 'react-native-ble-plx'

import {
  getHWDeviceInfo,
  BluetoothDisabledError,
  GeneralConnectionError,
  LedgerUserError,
} from '../../../crypto/byron/ledgerUtils'
import {Text, BulletPointItem, ProgressStep, Button} from '../../UiKit'
import {withNavigationTitle} from '../../../utils/renderUtils'
import DeviceItem from './DeviceItem'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {ledgerMessages, confirmationMessages} from '../../../i18n/global-messages'
import {Logger} from '../../../utils/logging'

import styles from './styles/ConnectNanoXScreen.style'
import bleImage from '../../../assets/img/bluetooth.png'
import usbImage from '../../../assets/img/ledger-nano-usb.png'

import type {ComponentType} from 'react'
import type {Device} from '@ledgerhq/react-native-hw-transport-ble'
import type {Navigation} from '../../../types/navigation'
import type {DeviceId, DeviceObj} from '../../../crypto/byron/ledgerUtils'

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
|}

type State = {|
  devices: Array<Device>,
  // deviceId: ?string,
  deviceId: ?DeviceId,
  deviceObj: ?DeviceObj,
  error: ?Error,
  refreshing: boolean,
  bip44AccountPublic: ?string,
  waiting: boolean,
|}

class ConnectNanoXScreen extends React.Component<Props, State> {
  state = {
    devices: this.props.defaultDevices ? this.props.defaultDevices : [],
    deviceId: null,
    deviceObj: null,
    error: null,
    refreshing: false,
    bip44AccountPublic: null,
    waiting: false,
  }

  subscriptions = null
  bluetoothEnabled: ?boolean = null
  transportLib: Object = null
  useUSB: boolean = false

  async componentDidMount() {
    const {navigation} = this.props
    const useUSB = navigation.getParam('useUSB') === true
    this.transportLib = useUSB ? TransportHID : TransportBLE
    this.useUSB = useUSB
    if (!useUSB) {
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
    const useUSB = this.useUSB
    this.setState({refreshing: true})

    this.subscriptions = this.transportLib.listen({
      complete: () => {
        Logger.debug('listen: subscription completed')
        this.setState({refreshing: false})
      },
      next: (e) => {
        if (e.type === 'add') {
          Logger.debug('listen: new device detected')
          if (useUSB) {
            // if a device is detected, save it in state immediately
            this.setState({
              refreshing: false,
              deviceObj: e.descriptor,
            })
            // await this.navigateToSave(e.descriptor)
            // , () =>
            //   this.navigateToSave(),
            // )
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
      devices: [],
      deviceId: null,
      deviceObj: null,
      error: null,
      refreshing: false,
    })
    this.startScan()
  }

  onSelectDevice = (device) => {
    if (this.state.deviceId != null) return
    this.setState({deviceId: device.id.toString(), refreshing: false}, () =>
      this.navigateToSave(device.id.toString()),
    )
  }

  navigateToSave = async (descriptor: DeviceId | DeviceObj) => {
    try {
      const {deviceId, deviceObj} = this.state
      const {navigation} = this.props
      this.setState({waiting: true})
      // const descriptor = this.useUSB ? deviceObj : deviceId
      const transport = await this.transportLib.open(descriptor)
      const hwDeviceInfo = await getHWDeviceInfo(transport)
      const bip44AccountPublic = hwDeviceInfo?.bip44AccountPublic
      this.setState({bip44AccountPublic, waiting: false})
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
    const {error, deviceId, deviceObj, bip44AccountPublic} = this.state
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
    } else if (
      (deviceId != null || deviceObj != null)
        && bip44AccountPublic == null) {
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
    const {intl, navigation} = this.props
    const {
      error,
      devices,
      refreshing,
      deviceId,
      deviceObj,
      bip44AccountPublic,
      waiting,
    } = this.state
    const useUSB = navigation.getParam('useUSB')

    const rows = [
      intl.formatMessage(ledgerMessages.enterPin),
      intl.formatMessage(ledgerMessages.openApp),
    ]
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <ProgressStep currentStep={2} totalSteps={3} displayStepNumber />
        <View style={styles.container}>
          <View style={styles.heading}>
            <Image source={useUSB ? usbImage : bleImage} />
            {!useUSB &&
              (<Text secondary style={styles.caption}>
                {intl.formatMessage(messages.caption)}
              </Text>)
            }

          </View>
          {devices.length === 0 || deviceObj == null && (
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
              keyExtractor={(item) => useUSB
                ? item.productId.toString()
                : item.id.toString()
              }
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
        {useUSB && (
          <Button
            onPress={() => this.navigateToSave(deviceObj)}
            title={intl.formatMessage(
              confirmationMessages.commonButtons.confirmButton,
            )}
            style={styles.button}
            disabled={
              refreshing ||
              deviceObj == null ||
              (deviceObj != null && bip44AccountPublic != null)
            }
          />
        )}
        {waiting && <ActivityIndicator />}
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
