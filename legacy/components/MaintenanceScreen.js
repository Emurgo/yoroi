// @flow

import type {ComponentType} from 'react'
import React from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'
import {AppState, BackHandler, Image, View} from 'react-native'
import {connect} from 'react-redux'
import {compose} from 'redux'

// $FlowExpectedError
import {Button, Link, Modal, Text} from '../../src/components'
import {initApp} from '../actions'
import image from '../assets/img/error.png'
import globalMessages from '../i18n/global-messages'
import styles from './styles/MaintenanceScreen.styles'

const messages = defineMessages({
  title: {
    id: 'components.maintenancemodal.title',
    defaultMessage: '!!!Temporary Maintenance',
  },
  explanation: {
    id: 'components.maintenancemodal.explanation',
    defaultMessage:
      '!!!Yoroi is on maintenance mode. You can still access your funds through any other wallet software.',
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

// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
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
    if (appState != null && appState.match(/inactive|background/) && nextAppState === 'active') {
      this.props.initApp()
    }
  }

  render() {
    const {intl, visible, onRequestClose, initApp} = this.props
    return (
      <Modal visible={visible} onRequestClose={onRequestClose} noPadding>
        <View style={styles.title}>
          <Text style={styles.titleText}>{intl.formatMessage(messages.title)}</Text>
        </View>
        <View style={styles.content}>
          <Image source={image} style={styles.image} />
          <Text style={[styles.paragraph, styles.attention]}>
            {`${intl.formatMessage(globalMessages.attention).toUpperCase()}:`}
          </Text>
          <Text style={styles.paragraph}>{intl.formatMessage(messages.explanation)}</Text>
          <Link url={URL} text={intl.formatMessage(messages.learnMore)} style={styles.paragraph} />
        </View>
        <Button onPress={initApp} title={intl.formatMessage(globalMessages.tryAgain)} style={styles.button} />
      </Modal>
    )
  }
}

type ScreenProps = {|
  intl: IntlShape,
  initApp: () => void,
|}

const MaintenanceScreen = ({intl, initApp}: ScreenProps) => (
  <MaintenanceModal visible onRequestClose={() => BackHandler.exitApp()} intl={intl} initApp={initApp} />
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
