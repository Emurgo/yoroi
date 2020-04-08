// @flow

import React from 'react'
import {View, SafeAreaView, ScrollView, FlatList, Image} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {compose} from 'redux'

import {Text, BulletPointItem} from '../../UiKit'
import {withNavigationTitle} from '../../../utils/renderUtils'
import DeviceItem from './DeviceItem'

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
      "!!!Allow location on your device (EMURGO won't store any location data).",
  },
})

type Props = {
  intl: intlShape,
  defaultDevices: ?Array<any>,
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

  // TODO
  reload = () => {
    this.setState({
      devices: [],
      error: null,
      refreshing: false,
    })
  }

  // TODO
  onSelectDevice = (device) => {
    // eslint-disable-next-line
    console.log(device)
  }

  renderItem = ({item}: {item: *}) => (
    <DeviceItem device={item} onSelect={this.onSelectDevice} />
  )

  render() {
    const {intl} = this.props
    const {error, devices, refreshing} = this.state

    const rows = [
      intl.formatMessage(messages.line1),
      intl.formatMessage(messages.line2),
      intl.formatMessage(messages.line3),
    ]
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.container}>
          <View style={styles.heading}>
            <Image source={image} />
            <Text secondary style={styles.caption}>
              {intl.formatMessage(messages.caption)}
            </Text>
          </View>
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
          <View style={styles.paragraph}>
            <Text styles={styles.paragraphText}>
              {intl.formatMessage(messages.introline)}
            </Text>
            {rows.map((row, i) => (
              <BulletPointItem textRow={row} key={i} style={styles.item} />
            ))}
          </View>
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
