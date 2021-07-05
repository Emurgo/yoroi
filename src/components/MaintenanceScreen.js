// @flow

import React from 'react'
import {View, Image, BackHandler, AppState} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {compose} from 'redux'
import {connect} from 'react-redux'

import {Text, Modal, Link, Button} from './UiKit'
import globalMessages from '../i18n/global-messages'
import {initApp} from '../actions'

import styles from './styles/MaintenanceScreen.styles'
import image from '../assets/img/error.png'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.maintenancemodal.title',
    defaultMessage: '!!!Temporary Maintenance',
  },
  explanation: {
    id: 'components.maintenancemodal.explanation',
    defaultMessage:
      '!!!Yoroi is on maintenance mode. You can still access your funds ' +
      'through any other wallet software.',
  },
  learnMore: {
    id: 'components.maintenancemodal.learnMore',
    defaultMessage: '!!!Learn more',
  },
})

const URL = 'https://twitter.com/YoroiWallet'

type Props = {|
  intl: IntlShape,
  visible: boolean,
  onRequestClose: () => void,
  initApp: () => void,
|}

type State = {|appState: ?string|}

class MaintenanceModal extends React.Component<Props, State> {
  state = {
    appState: AppState.currentState,
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleAppStateChange: (?string) => void = (nextAppState) => {
    const {appState} = this.state
    this.setState({appState: nextAppState})
    if (
      appState != null &&
      appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.props.initApp()
    }
  }

  render() {
    const {intl, visible, onRequestClose, initApp} = this.props
    return (
      <Modal visible={visible} onRequestClose={onRequestClose} noPadding>
        <View style={styles.title}>
          <Text style={styles.titleText}>
            {intl.formatMessage(messages.title)}
          </Text>
        </View>
        <View style={styles.content}>
          <Image source={image} style={styles.image} />
          <Text style={[styles.paragraph, styles.attention]}>
            {`${intl.formatMessage(globalMessages.attention).toUpperCase()}:`}
          </Text>
          <Text style={styles.paragraph}>
            {intl.formatMessage(messages.explanation)}
          </Text>
          <Link
            url={URL}
            text={intl.formatMessage(messages.learnMore)}
            style={styles.paragraph}
          />
        </View>
        <Button
          onPress={initApp}
          title={intl.formatMessage(globalMessages.tryAgain)}
          style={styles.button}
        />
      </Modal>
    )
  }
}

type ScreenProps = {|
  intl: IntlShape,
  initApp: () => void,
|}

const MaintenanceScreen = ({intl, initApp}: ScreenProps) => (
  <MaintenanceModal
    visible
    onRequestClose={() => BackHandler.exitApp()}
    intl={intl}
    initApp={initApp}
  />
)

export default injectIntl(
  (compose(
    connect(() => ({}), {
      initApp,
    }),
  )(MaintenanceScreen): ComponentType<{|
    intl: IntlShape,
    navigation: any,
    route: any,
  |}>),
)
