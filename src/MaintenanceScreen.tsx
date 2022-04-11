import React from 'react'
import {defineMessages, IntlShape, useIntl} from 'react-intl'
import {AppState, BackHandler, Image, StyleSheet, View} from 'react-native'
import {useDispatch} from 'react-redux'

import image from './assets/img/error.png'
import {Button, Link, Modal, Text} from './components'
import globalMessages from './i18n/global-messages'
import {initApp} from './legacy/actions'
import {COLORS, spacing} from './theme'

const URL = 'https://twitter.com/YoroiWallet'

type Props = {
  intl: IntlShape
  visible: boolean
  onRequestClose: () => void
  initApp: () => void
}

type State = {appState?: string}

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

  _handleAppStateChange = (nextAppState: string) => {
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

export const MaintenanceScreen = () => {
  const intl = useIntl()
  const dispatch = useDispatch()

  return (
    <MaintenanceModal
      visible
      onRequestClose={() => BackHandler.exitApp()}
      intl={intl}
      initApp={() => dispatch(initApp())}
    />
  )
}

export default MaintenanceScreen

const styles = StyleSheet.create({
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
  content: {
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    backgroundColor: COLORS.ERROR_TEXT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  titleText: {
    color: COLORS.WHITE,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  image: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  attention: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  button: {
    margin: 24,
  },
})

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
