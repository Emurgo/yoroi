// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {Modal, Clipboard, View} from 'react-native'
import QRCode from 'react-native-qrcode'

import {formatBIP44} from '../../crypto/util'

import {Text, Button} from '../UiKit'

import styles from './styles/AddressModal.style'

import type {ComponentType} from 'react'
import type {SubTranslation} from '../../l10n/typeHelpers'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const getTranslations = (state) => state.trans.AddressModal

type Props = {
  address: string,
  index: number,
  translations: SubTranslation<typeof getTranslations>,
  navigation: NavigationScreenProp<NavigationState>,
  goBack: () => void,
}

type State = {
  isCopied: boolean,
}

class AddressModal extends React.Component<Props, State> {
  state = {isCopied: false}

  /* eslint-disable-next-line react/sort-comp */
  _hideModalTimeoutId = null

  componentWillUnmount() {
    if (this._hideModalTimeoutId) clearTimeout(this._hideModalTimeoutId)
  }

  _copyAddress = () => {
    Clipboard.setString(this.props.address)
    this.setState({isCopied: true})

    this._hideModalTimeoutId = setTimeout(
      () => this.props.navigation.goBack(),
      1000,
    )
  }

  render() {
    const {isCopied} = this.state
    const {address, index, translations, goBack} = this.props

    return (
      <Modal visible onRequestClose={goBack}>
        <View style={styles.root}>
          <View style={styles.container}>
            <QRCode
              value={address}
              size={styles.qrcode.size}
              bgColor={styles.qrcode.backgroundColor}
              fgColor={styles.qrcode.foregroundColor}
            />
          </View>

          <View style={styles.container}>
            <Text style={styles.address}>
              {translations.BIP32path} {formatBIP44(0, 'External', index)}
            </Text>
            <Text style={styles.address}>{address}</Text>
          </View>

          <View style={styles.container}>
            <Button
              onPress={this._copyAddress}
              title={
                isCopied ? translations.copiedLabel : translations.copyLabel
              }
            />
          </View>
        </View>
      </Modal>
    )
  }
}

type ExternalProps = {
  navigation: NavigationScreenProp<NavigationState>,
}

export default (compose(
connect(
    (state, {navigation}) => ({
      address: navigation.getParam('address'),
    index: navigation.getParam('index'),
      translations: getTranslations(state),
    }),
    null,
  ),
  withHandlers({
    goBack: ({navigation}) => () => navigation.goBack(),
  }),
)(AddressModal): ComponentType<ExternalProps>)
