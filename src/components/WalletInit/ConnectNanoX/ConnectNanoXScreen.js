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
} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {compose} from 'redux'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
import {checkAndStoreHWDeviceInfo} from '../../../crypto/byron/ledgerUtils'

import {Text, BulletPointItem, ProgressStep} from '../../UiKit'
import {withNavigationTitle} from '../../../utils/renderUtils'
import DeviceItem from './DeviceItem'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/ConnectNanoXScreen.style'
import image from '../../../assets/img/bluetooth.png'

import type {ComponentType} from 'react'
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
  line1: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.line1',
    defaultMessage: '!!!Enter your PIN on the ledger device.',
  },
  line2: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.line2',
    defaultMessage: '!!!Open Cardano ADA app on the Ledger device.',
  },
  line3: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.line3',
    defaultMessage:
      '!!!Allow location on your device.' +
      'Android requires location to be enabled to provide access to Bluetooth,' +
      ' but EMURGO will never store any location data.',
  },
  error: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.error',
    defaultMessage:
      '!!!An error occurred trying to connect with your hardware wallet.' +
      'Please try again. If the error persists, please conntact EMURGO support.',
  },
})

const deviceAddition = (device) => ({devices}) => ({
  devices: devices.some((i) => i.id === device.id)
    ? devices
    : devices.concat(device),
})

type Props = {
  intl: intlShape,
  defaultDevices: ?Array<any>, // for UI design prototyping
}

// TODO: type correctly
type State = {
  devices: Array<any>,
  error: ?string,
  refreshing: boolean,
  transport: any,
  extPublicKey: ?string,
}

class ConnectNanoXScreen extends React.Component<Props, State> {
  state = {
    devices: this.props.defaultDevices ? this.props.defaultDevices : [],
    error: null,
    refreshing: false,
    transport: null,
    extPublicKey: null,
  }

  subscriptions = null

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
        if (e.available !== previousAvailable) {
          previousAvailable = e.available
          if (e.available) {
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

  // TODO
  reload = () => {
    if (this.subscriptions != null) this.subscriptions.unsubscribe()
    this.setState({
      devices: [],
      error: null,
      refreshing: false,
    })
    this.startScan()
  }

  // TODO
  onSelectDevice = async (device) => {
    try {
      const transport = await TransportBLE.open(device)
      const {navigation} = this.props
      transport.on('disconnect', () => {
        // Intentionally for the sake of simplicity we use a transport local state
        // and remove it on disconnect.
        // A better way is to pass in the device.id and handle the connection internally.
        this.setState({transport: null})
      })
      const hwDeviceInfo = await checkAndStoreHWDeviceInfo(transport)
      const extPublicKey = hwDeviceInfo.publicMasterKey
      this.setState({extPublicKey, transport}) // TODO: remove transport from local state
      navigation.navigate(WALLET_INIT_ROUTES.SAVE_NANO_X, {hwDeviceInfo})
    } catch (error) {
      this.setState({error})
    }
  }

  renderItem = ({item}: {item: *}) => (
    <DeviceItem device={item} onSelect={this.onSelectDevice} />
  )

  ListHeader = () => {
    const {error} = this.state
    const {intl} = this.props
    return error == null ? (
      <View style={styles.errorBlock}>
        <Text style={styles.errorHeader}>{intl.formatMessage(messages.error)}</Text>
        <Text style={styles.error}>{String(error.message)}</Text>
      </View>
    ) : null
  }

  render() {
    const {intl} = this.props
    const {error, devices, refreshing} = this.state

    const rows = [
      intl.formatMessage(messages.line1),
      intl.formatMessage(messages.line2),
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
            <View style={styles.paragraph}>
              <Text styles={styles.paragraphText}>
                {intl.formatMessage(messages.introline)}
              </Text>
              {rows.map((row, i) => (
                <BulletPointItem textRow={row} key={i} style={styles.item} />
              ))}
              {Platform.OS === 'android' && (
                <BulletPointItem
                  textRow={intl.formatMessage(messages.line3)}
                  style={styles.item}
                />
              )}
            </View>
          )}
          <ScrollView style={styles.scrollView}>
            {/* ListHeaderComponent={this.ListHeader} */}
            <FlatList
              extraData={error}
              style={styles.flatList}
              data={devices}
              renderItem={this.renderItem}
              keyExtractor={(item) => item.id.toString()}
              onRefresh={this.reload}
              refreshing={refreshing}
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
  defaultDevices: ?Array<any>,
|}

export default injectIntl(
  (compose(withNavigationTitle(({intl}) => intl.formatMessage(messages.title)))(
    ConnectNanoXScreen,
  ): ComponentType<ExternalProps>),
)
