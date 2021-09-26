// @flow

/**
 * Step 4 for the Catalyst registration
 * Ask password used for signing metadata
 * generate registration trx
 * ### HW is NOT supported yet - validation is done on first screen itself###
 */

import {useNavigation} from '@react-navigation/native'
import type {ComponentType} from 'react'
import React, {useEffect, useState} from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, injectIntl} from 'react-intl'
import {SafeAreaView, View} from 'react-native'
import {connect} from 'react-redux'

import {showErrorDialog} from '../../actions'
import {generateVotingTransaction} from '../../actions/voting'
import type {RawUtxo} from '../../api/types'
import {CONFIG} from '../../config/config'
import {WrongPassword} from '../../crypto/errors'
import KeyStore from '../../crypto/KeyStore'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import {confirmationMessages, errorMessages, txLabels} from '../../i18n/global-messages'
import {CATALYST_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import {easyConfirmationSelector, isHWSelector, utxosSelector} from '../../selectors'
import ErrorModal from '../Common/ErrorModal'
import {Button, OfflineBanner, ProgressStep, StatusBar, Text, ValidatedTextInput} from '../UiKit'
import styles from './styles/Step4.style'

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step4.subTitle',
    defaultMessage: '!!!Enter Spending Password',
  },
  description: {
    id: 'components.catalyst.step4.description',
    defaultMessage: '!!!Enter your spending password to be able to generate the required certificate for voting',
  },
  bioAuthInstructions: {
    id: 'components.catalyst.step4.bioAuthInstructions',
    defaultMessage: '!!!Please authenticate so that Yoroi can generate the required certificate for voting',
  },
})

type ErrorData = {|
  showErrorDialog: boolean,
  errorMessage: string,
  errorLogs: ?string,
|}

type Props = {
  utxos: Array<RawUtxo>,
  generateVotingTransaction: (string | void) => void,
  intl: IntlShape,
  isEasyConfirmationEnabled: boolean,
  isHW: boolean,
}

const Step4 = ({intl, isEasyConfirmationEnabled, isHW, generateVotingTransaction}: Props) => {
  const navigation = useNavigation()
  const [password, setPassword] = useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')

  const [generatingTransaction, setGeneratingTransaction] = useState(false)
  const [errorData, setErrorData] = useState<ErrorData>({
    showErrorDialog: false,
    errorMessage: '',
    errorLogs: null,
  })

  const isConfirmationDisabled = !isHW && !isEasyConfirmationEnabled && !password

  const onContinue = React.useCallback(
    async () => {
      const generateTransaction = async (decryptedKey: string) => {
        setGeneratingTransaction(true)
        try {
          await generateVotingTransaction(decryptedKey)
        } finally {
          setGeneratingTransaction(false)
        }
        navigation.navigate(CATALYST_ROUTES.STEP5)
      }

      if (isEasyConfirmationEnabled) {
        try {
          await walletManager.ensureKeysValidity()
          navigation.navigate(CATALYST_ROUTES.BIOMETRICS_SIGNING, {
            keyId: walletManager._id,
            onSuccess: async (decryptedKey) => {
              navigation.goBack() // goback to unmount biometrics screen
              await generateTransaction(decryptedKey)
            },
            onFail: () => navigation.goBack(),
            addWelcomeMessage: false,
            instructions: [intl.formatMessage(messages.bioAuthInstructions)],
          })
        } catch (e) {
          if (e instanceof SystemAuthDisabled) {
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
            navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)

            return
          } else {
            setErrorData({
              showErrorDialog: true,
              errorMessage: intl.formatMessage(errorMessages.generalError.message),
              errorLogs: String(e.message),
            })
          }
        }
        return
      }
      try {
        const decryptedKey = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)

        await generateTransaction(decryptedKey)
      } catch (e) {
        if (e instanceof WrongPassword) {
          await showErrorDialog(errorMessages.incorrectPassword, intl)
        } else {
          setErrorData({
            showErrorDialog: true,
            errorMessage: intl.formatMessage(errorMessages.generalTxError.message),
            errorLogs: String(e.message),
          })
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [password],
  )

  useEffect(() => {
    // if easy confirmation is enabled we go directly to the authentication
    // screen and then build the registration tx
    if (isEasyConfirmationEnabled) {
      onContinue()
    }
  }, [onContinue, isEasyConfirmationEnabled])

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={4} totalSteps={6} />
      <StatusBar type="dark" />

      <OfflineBanner />
      <View style={styles.container}>
        <View>
          <Text style={styles.subTitle}>{intl.formatMessage(messages.subTitle)}</Text>
          <Text style={[styles.description, styles.mb70]}>{intl.formatMessage(messages.description)}</Text>
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
          title={intl.formatMessage(confirmationMessages.commonButtons.confirmButton)}
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

export default (injectIntl(
  connect(
    (state) => ({
      isEasyConfirmationEnabled: easyConfirmationSelector(state),
      utxos: utxosSelector(state),
      isHW: isHWSelector(state),
    }),
    {
      generateVotingTransaction,
    },
  )(Step4),
): ComponentType<{}>)
