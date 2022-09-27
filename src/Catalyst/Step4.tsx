import {useFocusEffect, useNavigation} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuthOsErrorDecoder, useAuthOsWithEasyConfirmation} from '../auth'
import {RootKey} from '../auth/RootKey'
import {Button, ErrorModal, OfflineBanner, ProgressStep, Spacer, TextInput} from '../components'
import {LoadingOverlay} from '../components/LoadingOverlay'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../i18n/global-messages'
import {showErrorDialog} from '../legacy/actions'
import {CONFIG} from '../legacy/config'
import {WrongPassword} from '../legacy/errors'
import {isEmptyString} from '../legacy/utils'
import {useSelectedWallet} from '../SelectedWallet'
import {Actions, Description, Title} from './components'
import {useCreateVotingRegTx, VotingRegTxData} from './hooks'

type ErrorData = {
  showErrorDialog: boolean
  errorMessage: string
  errorLogs: string | null
}

type Props = {
  pin: string
  setVotingRegTxData: (votingRegTxData?: VotingRegTxData | undefined) => void
}
export const Step4 = ({pin, setVotingRegTxData}: Props) => {
  const intl = useIntl()
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {createVotingRegTx, isLoading: generatingTransaction} = useCreateVotingRegTx({wallet})
  const navigation = useNavigation()
  const [password, setPassword] = useState('')
  const decodeAuthOsError = useAuthOsErrorDecoder()

  const createTransaction = React.useCallback(
    (decryptedKey: string) => {
      createVotingRegTx(
        {
          decryptedKey,
          pin,
        },
        {
          onSuccess: (votingRegTxData) => {
            setVotingRegTxData(votingRegTxData)
            navigation.navigate('app-root', {
              screen: 'catalyst-router',
              params: {
                screen: 'catalyst-transaction',
              },
            })
          },
        },
      )
    },
    [createVotingRegTx, navigation, pin, setVotingRegTxData],
  )

  const {authWithOs, isLoading: authenticating} = useAuthOsWithEasyConfirmation(
    {
      id: wallet.id,
      authenticationPrompt: {
        cancel: strings.cancel,
        title: strings.authorize,
      },
    },
    {
      retry: false,
      onSuccess: createTransaction,
      onError: (error) => {
        const errorMessage = decodeAuthOsError(error)
        if (!isEmptyString(errorMessage)) Alert.alert(strings.error, errorMessage)
      },
    },
  )

  const [errorData, setErrorData] = useState<ErrorData>({
    showErrorDialog: false,
    errorMessage: '',
    errorLogs: null,
  })

  const isLoading = authenticating || generatingTransaction
  const isConfirmationDisabled = !wallet.isHW && !wallet.isEasyConfirmationEnabled && isEmptyString(password)

  const onContinue = React.useCallback(async () => {
    if (wallet.isEasyConfirmationEnabled) {
      authWithOs()
    } else {
      try {
        await RootKey(wallet.id).reveal(password).then(createTransaction)
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
    }
  }, [wallet.isEasyConfirmationEnabled, wallet.id, authWithOs, password, createTransaction, intl, strings.errorMessage])

  useEffect(() => {
    // if easy confirmation is enabled we go directly to the authentication
    // screen and then build the registration tx
    if (wallet.isEasyConfirmationEnabled) {
      onContinue()
    }
  }, [onContinue, wallet.isEasyConfirmationEnabled])

  useEffect(() => {
    setPassword(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      setVotingRegTxData(undefined)
    }, [setVotingRegTxData]),
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={4} totalSteps={6} />
      <OfflineBanner />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="always">
        <Spacer height={48} />

        <Title>{strings.subTitle}</Title>

        <Spacer height={16} />

        <Description>{strings.description}</Description>

        {!wallet.isEasyConfirmationEnabled && (
          <>
            <Spacer height={48} />
            <TextInput
              autoFocus
              secureTextEntry
              label={strings.password}
              value={password}
              onChangeText={setPassword}
              autoComplete={false}
            />
          </>
        )}
      </ScrollView>

      <Spacer fill />

      <Actions>
        <Button onPress={onContinue} title={strings.confirmButton} disabled={isConfirmationDisabled || isLoading} />
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

      <LoadingOverlay loading={isLoading} />
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
  bioAuthDescription: {
    id: 'components.catalyst.step5.bioAuthDescription',
    defaultMessage:
      '!!!Please confirm your voting registration. You will be asked to ' +
      'authenticate once again to sign and submit the certificate generated ' +
      'in the previous step.',
  },
  authorize: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize operation',
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
    error: intl.formatMessage(globalMessages.error),
    cancel: intl.formatMessage(globalMessages.cancel),
    authorize: intl.formatMessage(messages.authorize),
    subTitle: intl.formatMessage(messages.subTitle),
    description: intl.formatMessage(messages.description),
    password: intl.formatMessage(txLabels.password),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    errorTitle: intl.formatMessage(errorMessages.generalTxError.title),
    errorMessage: intl.formatMessage(errorMessages.generalTxError.message),
    bioAuthDescription: intl.formatMessage(messages.bioAuthDescription),
  }
}
