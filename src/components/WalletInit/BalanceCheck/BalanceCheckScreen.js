// @flow

import React, {Component} from 'react'
import {View, ScrollView, Platform} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {SafeAreaView} from 'react-navigation'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'

import {Text, Button, ValidatedTextInput, StatusBar, Banner} from '../../UiKit'
import BalanceCheckModal from './BalanceCheckModal'
import {CONFIG, CARDANO_CONFIG} from '../../../config'
import {
  validateRecoveryPhrase,
  INVALID_PHRASE_ERROR_CODES,
  cleanMnemonic,
} from '../../../utils/validators'
import {errorMessages} from '../../../i18n/global-messages'
import {showErrorDialog} from '../../../actions'
import {NetworkError, ApiError} from '../../../api/errors'
import {withNavigationTitle} from '../../../utils/renderUtils'
import {isKeyboardOpenSelector} from '../../../selectors'
import {mnemonicsToAddresses, balanceForAddresses} from '../../../crypto/util'

import styles from './styles/BalanceCheckScreen.style'

import type {InvalidPhraseError} from '../../../utils/validators'
import type {ComponentType} from 'react'

const mnemonicInputErrorsMessages = defineMessages({
  TOO_LONG: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.toolong',
    defaultMessage: '!!!Phrase is too long. ',
    description: 'some desc',
  },
  TOO_SHORT: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.tooshort',
    defaultMessage: '!!!Phrase is too short. ',
    description: 'some desc',
  },
  INVALID_CHECKSUM: {
    id:
      'components.walletinit.restorewallet.restorewalletscreen.invalidchecksum',
    defaultMessage: '!!!Please enter valid mnemonic.',
    description: 'some desc',
  },
  UNKNOWN_WORDS: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.unknowwords',
    defaultMessage: '!!!{wordlist} {cnt, plural, one {is} other {are}} invalid',
    description: 'some desc',
  },
})

const messages = defineMessages({
  title: {
    id: 'components.walletinit.balancecheck.balancecheckscreen.title',
    defaultMessage: '!!!Balance Check',
    description: 'some desc',
  },
  headsUp: {
    id: 'components.walletinit.balancecheck.balancecheckscreen.headsUp',
    defaultMessage: '!!!You are on the Shelley Balance Check Testnet',
    description: 'some desc',
  },
  mnemonicInputLabel: {
    id:
      'components.walletinit.balancecheck.balancecheckscreen.mnemonicInputLabel',
    defaultMessage: '!!!Recovery phrase',
    description: 'some desc',
  },
  confirmButton: {
    id: 'components.walletinit.balancecheck.balancecheckscreen.confirmButton',
    defaultMessage: '!!!Confirm',
    description: 'some desc',
  },
  instructions: {
    id: 'components.walletinit.balancecheck.balancecheckscreen.instructions',
    defaultMessage:
      '!!!Enter the 15-word recovery phrase used to back up your wallet to ' +
      'validate the balance. It will take about 1 minute to verify your balance.',
    description: 'some desc',
  },
})

const snapshotEndMsg = defineMessages({
  title: {
    id:
      'components.walletinit.balancecheck.balancecheckscreen.snapshotend.title',
    defaultMessage: '!!!Snapshot has ended',
  },
  message: {
    id:
      'components.walletinit.balancecheck.balancecheckscreen.snapshotend.message',
    defaultMessage:
      '!!!The snapshot period has endeded. You can start delegating now using ' +
      'the Yoroi extension, and soon you will be able to do it from the mobile ' +
      'app as well.',
  },
})

const _translateInvalidPhraseError = (intl: any, error: InvalidPhraseError) => {
  if (error.code === INVALID_PHRASE_ERROR_CODES.UNKNOWN_WORDS) {
    return intl.formatMessage(mnemonicInputErrorsMessages.UNKNOWN_WORDS, {
      cnt: error.words.length,
      wordlist: error.words.map((word) => `'${word}'`).join(', '),
    })
  } else {
    return intl.formatMessage(mnemonicInputErrorsMessages[error.code])
  }
}

const _handleConfirm = async (
  phrase: string,
): Promise<{addresses: Array<string>, balance: BigNumber}> => {
  const addresses = await mnemonicsToAddresses(
    cleanMnemonic(phrase),
    CARDANO_CONFIG.SHELLEY,
  )
  const {fundedAddresses, sum} = await balanceForAddresses(
    addresses,
    CARDANO_CONFIG.SHELLEY,
  )
  return {addresses: fundedAddresses, balance: sum}
}

const errorsVisibleWhileWriting = (errors) => {
  return errors
    .map((error) => {
      if (error.code !== INVALID_PHRASE_ERROR_CODES.UNKNOWN_WORDS) return error
      if (!error.lastMightBeUnfinished) return error
      // $FlowFixMe flow does not like null here
      if (error.words.length <= 1) return null
      return {
        code: error.code,
        words: _.initial(error.words),
        lastMightBeUnfinished: error.lastMightBeUnfinished,
      }
    })
    .filter((error) => !!error)
}

type Props = {
  intl: any,
}

type State = {
  phrase: string,
  showSuccessModal: boolean,
  isKeyboardOpen: boolean,
  addresses: Array<string>,
  balance: ?BigNumber,
  isSubmitting: boolean,
}

class BalanceCheckScreen extends Component<Props, State> {
  state = {
    phrase: CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.MNEMONIC1 : '',
    showSuccessModal: false,
    isKeyboardOpen: false,
    addresses: [],
    balance: null,
    isSubmitting: false,
  }

  translateInvalidPhraseError = (error) => {
    const {intl} = this.props
    return _translateInvalidPhraseError(intl, error)
  }

  setPhrase = (value: string) => {
    this.setState({phrase: value})
  }

  handleConfirm = async () => {
    const {phrase} = this.state
    const {intl} = this.props
    this.setState({isSubmitting: true})
    try {
      const {addresses, balance} = await _handleConfirm(phrase)
      this.setState({
        addresses,
        balance,
        showSuccessModal: true,
        isSubmitting: false,
      })
    } catch (e) {
      if (e instanceof NetworkError) {
        await showErrorDialog(errorMessages.networkError, intl)
      } else if (e instanceof ApiError) {
        await showErrorDialog(snapshotEndMsg, intl)
      } else {
        throw e
      }
    } finally {
      this.setState({isSubmitting: false})
    }
  }

  closeSuccessModal = () => this.setState({showSuccessModal: false})

  render() {
    const {
      phrase,
      showSuccessModal,
      isKeyboardOpen,
      addresses,
      balance,
      isSubmitting,
    } = this.state

    const {intl} = this.props

    const errors = validateRecoveryPhrase(phrase)
    const visibleErrors = isKeyboardOpen
      ? errorsVisibleWhileWriting(errors.invalidPhrase || [])
      : errors.invalidPhrase || []

    const errorText = visibleErrors
      .map((error) => this.translateInvalidPhraseError(error))
      .join(' ')

    return (
      <>
        <SafeAreaView style={styles.safeAreaView}>
          <StatusBar type="dark" />
          <Banner error text={intl.formatMessage(messages.headsUp)} />

          <ScrollView keyboardDismissMode="on-drag">
            <View style={styles.container}>
              <Text>{intl.formatMessage(messages.instructions)}</Text>
              <ValidatedTextInput
                multiline
                numberOfLines={3}
                style={Platform.OS === 'ios' ? styles.iosPhrase : styles.phrase}
                value={phrase}
                onChangeText={this.setPhrase}
                placeholder={intl.formatMessage(messages.mnemonicInputLabel)}
                blurOnSubmit
                error={errorText}
                autoCapitalize="none"
                keyboardType="visible-password"
                // hopefully this prevents keyboard from learning the mnemonic
                autoCorrect={false}
              />
            </View>
          </ScrollView>

          <Button
            onPress={this.handleConfirm}
            title={intl.formatMessage(messages.confirmButton)}
            disabled={!_.isEmpty(errors) || isSubmitting}
            shelleyTheme
          />
        </SafeAreaView>
        <BalanceCheckModal
          visible={showSuccessModal}
          onRequestClose={this.closeSuccessModal}
          addresses={addresses}
          balance={balance}
        />
      </>
    )
  }
}

export default injectIntl(
  (compose(
    connect((state) => ({
      isKeyboardOpen: isKeyboardOpenSelector(state),
    })),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  )(BalanceCheckScreen): ComponentType<{
    intl: intlShape,
  }>),
)
