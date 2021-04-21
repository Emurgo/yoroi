// @flow

/**
 * Step 4 for the Catalyst registration
 * Ask password used for signing metadata
 * generate registration trx
 * ### HW is NOT supported yet - validation is done on first screen itself###
 */

import _ from 'lodash'
import React, {useState} from 'react'
import {View, SafeAreaView} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {connect} from 'react-redux'

import {CONFIG} from '../../config/config'
import KeyStore from '../../crypto/KeyStore'
import {generateVotingTransaction} from '../../actions/voting'
import {showErrorDialog} from '../../actions'
import {
  Text,
  ProgressStep,
  Button,
  OfflineBanner,
  ValidatedTextInput,
  StatusBar,
} from '../UiKit'
import ErrorModal from '../Common/ErrorModal'
import {withTitle} from '../../utils/renderUtils'
import {
  CATALYST_ROUTES,
  SEND_ROUTES,
  WALLET_ROOT_ROUTES,
} from '../../RoutesList'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import globalMessages, {
  errorMessages,
  confirmationMessages,
  txLabels,
} from '../../i18n/global-messages'
import {WrongPassword} from '../../crypto/errors'
import {
  easyConfirmationSelector,
  utxosSelector,
} from '../../selectors'

import styles from './styles/Step4.style'

import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'
import type {IntlShape} from 'react-intl'
import type {RawUtxo} from '../../api/types'

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step4.subTitle',
    defaultMessage: '!!!Enter Spending Password',
  },
  description: {
    id: 'components.catalyst.step4.description',
    defaultMessage:
      '!!!Enter your spending password to be able to generate the required certificate for voting',
  },
})

const Step4 = ({
  intl,
  isEasyConfirmationEnabled,
  navigation,
  utxos,
  generateVotingTransaction,
}) => {
  const [password, setPassword] = useState(
    CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
  )

  const [generatingTransaction, setGeneratingTransaction] = useState(false)
  const [errorData, setErrorData] = useState({
    showErrorDialog: false,
    errorMessage: '',
    errorLogs: '',
  })

  const isConfirmationDisabled = !isEasyConfirmationEnabled && !password

  const generateTransaction = async (decryptedKey) => {
    setGeneratingTransaction(true)
    try {
      await generateVotingTransaction(decryptedKey, utxos)
    } catch (error) {
      throw error
    } finally {
      setGeneratingTransaction(false)
    }
    navigation.navigate(CATALYST_ROUTES.STEP5)
  }

  const onContinue = async (_event) => {
    if (isEasyConfirmationEnabled) {
      try {
        await walletManager.ensureKeysValidity()
        navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
          keyId: walletManager._id,
          onSuccess: async (decryptedKey) => {
            await generateTransaction(decryptedKey)
          },
          onFail: () => navigation.goBack(),
        })
      } catch (e) {
        if (e instanceof SystemAuthDisabled) {
          await walletManager.closeWallet()
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)

          return
        } else {
          setErrorData((_state) => ({
            ..._state,
            showErrorDialog: true,
            errorMessage: intl.formatMessage(
              errorMessages.generalError.message,
            ),
            errorLogs: String(e.message),
          }))
        }
      }
    }
    try {
      const decryptedKey = await KeyStore.getData(
        walletManager._id,
        'MASTER_PASSWORD',
        '',
        password,
        intl,
      )

      await generateTransaction(decryptedKey)
    } catch (e) {
      if (e instanceof WrongPassword) {
        await showErrorDialog(errorMessages.incorrectPassword, intl)
      } else {
        setErrorData((_state) => ({
          showErrorDialog: true,
          errorMessage: intl.formatMessage(
            errorMessages.generalTxError.message,
          ),
          errorLogs: String(e.message),
        }))
      }
    }
  }
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={4} totalSteps={6} />
      <StatusBar type="dark" />

      <OfflineBanner />
      <View style={styles.container}>
        <View>
          <Text style={styles.subTitle}>
            {intl.formatMessage(messages.subTitle)}
          </Text>
          <Text style={[styles.description, styles.mb70]}>
            {intl.formatMessage(messages.description)}
          </Text>
          {!isEasyConfirmationEnabled && (
            <View>
              <ValidatedTextInput
                secureTextEntry
                value={password}
                label={intl.formatMessage(txLabels.password)}
                onChangeText={setPassword}
              />
            </View>
          )}
        </View>
        <Button
          onPress={onContinue}
          title={intl.formatMessage(
            confirmationMessages.commonButtons.confirmButton,
          )}
          disabled={isConfirmationDisabled || generatingTransaction}
        />
      </View>
      <ErrorModal
        visible={errorData.showErrorDialog}
        title={intl.formatMessage(errorMessages.generalTxError.title)}
        errorMessage={errorData.errorMessage}
        errorLogs={errorData.errorLogs}
        onRequestClose={() => {
          setErrorData((state) => ({
            ...state,
            showErrorDialog: false,
          }))
        }}
      />
    </SafeAreaView>
  )
}

type ExternalProps = {|
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  intl: IntlShape,
  isEasyConfirmationEnabled: boolean,
  utxos: Array<RawUtxo>,
  generateVotingTransaction: (string, Array<RawUtxo>) => void,
|}

export default injectIntl(
  connect(
    (state) => ({
      isEasyConfirmationEnabled: easyConfirmationSelector(state),
      utxos: utxosSelector(state),
    }),
    {
      generateVotingTransaction,
    },
  )(
    withTitle((Step4: ComponentType<ExternalProps>), ({intl}) =>
      intl.formatMessage(globalMessages.votingTitle),
    ),
  ),
)
