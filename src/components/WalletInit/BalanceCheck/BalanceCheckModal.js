// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import type {Navigation} from '../../../types/navigation'
import {Text, Button, Modal} from '../../UiKit'
import {ROOT_ROUTES} from '../../../RoutesList'

// import styles from './styles/AddressModal.style'

import type {ComponentType} from 'react'

const messages = defineMessages({
  recoveredBalanceLabel: {
    id: 'components.walletinit.balancecheck.balancecheckmodal.recoveredBalanceLabel',
    defaultMessage: '!!!Recovered balance',
  },
  recoveryTitle: {
    id: 'components.walletinit.balancecheck.balancecheckmodal.recoveryTitle',
    defaultMessage: '!!!Recovery Successful',
  },
  attention: {
    id: 'components.walletinit.balancecheck.balancecheckmodal.attention',
    defaultMessage: '!!!Attention',
  },
  attentionDescription: {
    id: 'components.walletinit.balancecheck.balancecheckmodal.attentionDescription',
    defaultMessage: '!!!The balance check executed successfully, and we were ' +
    'able to match your wallet with the balance displayed below. Remember that ' +
    'the balance displayed should only match the one that you <strong>had on ' +
    'November 12th</strong>.',
  },
})

type Props = {
  intl: any,
  visible: boolean,
  navigateWalletInit: () => mixed,
  navigation: Navigation,
}

class BalanceCheckModal extends React.Component<Props> {


  render() {
    const {intl, visible, navigateWalletInit} = this.props

    return (
      <Modal visible={visible} onRequestClose={() => {}} showCloseIcon>
        <View>
          <Text>
            {intl.formatMessage(messages.attentionDescription)}
          </Text>
        </View>

        <Button
          onPress={navigateWalletInit}
          title="close"
        />
      </Modal>
    )
  }
}

type ExternalProps = {
  visible: boolean,
  onRequestClose: () => any,
  intl: intlShape,
  navigation: Navigation,
}

export default injectIntl(
  (compose(
    withHandlers({
      navigateWalletInit: ({navigation}) => (event) =>
        navigation.navigate(ROOT_ROUTES.WALLET),
    })
  )(BalanceCheckModal): ComponentType<ExternalProps>),
)
