import {useNavigation} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog} from '../../legacy/actions'
import {generateVotingTransaction} from '../../legacy/actions/voting'
import ErrorModal from '../../legacy/components/Common/ErrorModal'
import {Button, OfflineBanner, ProgressStep, TextInput} from '../../legacy/components/UiKit'
import {CONFIG} from '../../legacy/config/config'
import {WrongPassword} from '../../legacy/crypto/errors'
import KeyStore from '../../legacy/crypto/KeyStore'
import walletManager, {SystemAuthDisabled} from '../../legacy/crypto/walletManager'
import {confirmationMessages, errorMessages, txLabels} from '../../legacy/i18n/global-messages'
import {easyConfirmationSelector, isHWSelector} from '../../legacy/selectors'
import {Spacer} from '../components'
import {Actions, Description, Title} from './components'

type ErrorData = {
  showErrorDialog: boolean
  errorMessage: string
  errorLogs: string | null
}

export const Step4 = () => {
  const intl = useIntl()
  const strings = useStrings()
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
      navigation.navigate('app-root', {
        screen: 'catalyst-router',
        params: {
          screen: 'catalyst-transaction',
        },
      })
    }

    if (isEasyConfirmationEnabled) {
      try {
        await walletManager.ensureKeysValidity()
        navigation.navigate('biometrics', {
          keyId: walletManager._id,
          onSuccess: async (decryptedKey) => {
            navigation.goBack() // goback to unmount biometrics screen

            await generateTransaction(decryptedKey)
          },
          onFail: () => navigation.goBack(),
          instructions: [strings.bioAuthInstructions],
        })
      } catch (error) {
        if (error instanceof SystemAuthDisabled) {
          await walletManager.closeWallet()
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate('app-root', {screen: 'wallet-selection'})
          return
        } else if (error instanceof Error) {
          setErrorData({
            showErrorDialog: true,
            errorMessage: strings.errorMessage,
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
      } else if (error instanceof Error) {
        setErrorData({
          showErrorDialog: true,
          errorMessage: strings.errorMessage,
          errorLogs: String(error.message),
        })
      }
    }
  }, [
    dispatch,
    intl,
    isEasyConfirmationEnabled,
    navigation,
    password,
    strings.bioAuthInstructions,
    strings.errorMessage,
  ])

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

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="always">
        <Spacer height={48} />

        <Title>{strings.subTitle}</Title>

        <Spacer height={16} />

        <Description>{strings.description}</Description>

        {!isEasyConfirmationEnabled && (
          <>
            <Spacer height={48} />
            <TextInput autoFocus secureTextEntry label={strings.password} value={password} onChangeText={setPassword} />
          </>
        )}
      </ScrollView>

      <Spacer fill />

      <Actions>
        <Button
          onPress={onContinue}
          title={strings.confirmButton}
          disabled={isConfirmationDisabled || generatingTransaction}
        />
      </Actions>

      <ErrorModal
        visible={errorData.showErrorDialog}
        title={strings.errorTitle}
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

const useStrings = () => {
  const intl = useIntl()

  return {
    subTitle: intl.formatMessage(messages.subTitle),
    description: intl.formatMessage(messages.description),
    password: intl.formatMessage(txLabels.password),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    errorTitle: intl.formatMessage(errorMessages.generalTxError.title),
    errorMessage: intl.formatMessage(errorMessages.generalTxError.message),
    bioAuthInstructions: intl.formatMessage(messages.bioAuthInstructions),
  }
}
