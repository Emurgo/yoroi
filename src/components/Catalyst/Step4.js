// @flow

/**
 * Step 4 for the Catalyst registration
 * Ask password used for signing metadata
 * generate registration trx
 * ### HW is NOT supported yet - validation is done on first screen itself###
 */

import React, {useState, useEffect} from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages} from 'react-intl'
import {useDispatch, useSelector} from 'react-redux'

import {CONFIG} from '../../config/config'
import KeyStore from '../../crypto/KeyStore'
import {generateVotingTransaction} from '../../actions/voting'
import {showErrorDialog} from '../../actions'
import {ProgressStep, Button, OfflineBanner, TextInput, Spacer} from '../UiKit'
import ErrorModal from '../Common/ErrorModal'
import {CATALYST_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import {errorMessages, confirmationMessages, txLabels} from '../../i18n/global-messages'
import {WrongPassword} from '../../crypto/errors'
import {easyConfirmationSelector, isHWSelector} from '../../selectors'
import {Actions, Description, Title} from './components'

import type {IntlShape} from 'react-intl'
import {useNavigation} from '@react-navigation/native'

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

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
})

type ErrorData = {|
  showErrorDialog: boolean,
  errorMessage: string,
  errorLogs: ?string,
|}

type Props = {
  intl: IntlShape,
}

const Step4 = ({intl}: Props) => {
  const isHW = useSelector(isHWSelector)
  const isEasyConfirmationEnabled = useSelector(easyConfirmationSelector)
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [password, setPassword] = useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')

  const [generatingTransaction, setGeneratingTransaction] = useState(false)
  const [errorData, setErrorData] = useState<ErrorData>({
    showErrorDialog: false,
    errorMessage: '',
    errorLogs: null,
  })

  const isConfirmationDisabled = !isHW && !isEasyConfirmationEnabled && !password

  const onContinue = React.useCallback(async () => {
    const generateTransaction = async (decryptedKey: string) => {
      setGeneratingTransaction(true)
      try {
        await dispatch(generateVotingTransaction(decryptedKey))
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
      } catch (error) {
        if (error instanceof SystemAuthDisabled) {
          await walletManager.closeWallet()
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)

          return
        } else {
          setErrorData({
            showErrorDialog: true,
            errorMessage: intl.formatMessage(errorMessages.generalError.message),
            errorLogs: String(error.message),
          })
        }
      }
      return
    }
    try {
      const decryptedKey = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)

      await generateTransaction(decryptedKey)
    } catch (error) {
      if (error instanceof WrongPassword) {
        await showErrorDialog(errorMessages.incorrectPassword, intl)
      } else {
        setErrorData({
          showErrorDialog: true,
          errorMessage: intl.formatMessage(errorMessages.generalTxError.message),
          errorLogs: String(error.message),
        })
      }
    }
  }, [dispatch, intl, isEasyConfirmationEnabled, navigation, password])

  useEffect(() => {
    // if easy confirmation is enabled we go directly to the authentication
    // screen and then build the registration tx
    if (isEasyConfirmationEnabled) {
      onContinue()
    }
  }, [onContinue, isEasyConfirmationEnabled])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={4} totalSteps={6} />
      <OfflineBanner />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Spacer height={48} />

        <Title>{intl.formatMessage(messages.subTitle)}</Title>

        <Spacer height={16} />

        <Description>{intl.formatMessage(messages.description)}</Description>

        {!isEasyConfirmationEnabled && (
          <>
            <Spacer height={48} />
            <TextInput
              autoFocus
              secureTextEntry
              label={intl.formatMessage(txLabels.password)}
              value={password}
              onChangeText={setPassword}
            />
          </>
        )}
      </ScrollView>

      <Spacer fill />

      <Actions>
        <Button
          onPress={onContinue}
          title={intl.formatMessage(confirmationMessages.commonButtons.confirmButton)}
          disabled={isConfirmationDisabled || generatingTransaction}
        />
      </Actions>

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

export default injectIntl(Step4)
