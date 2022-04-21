import {useFocusEffect, useNavigation} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, OfflineBanner, ProgressStep, Spacer, TextInput} from '../components'
import {ErrorModal} from '../components'
import {confirmationMessages, errorMessages, txLabels} from '../i18n/global-messages'
import {showErrorDialog} from '../legacy/actions'
import {CONFIG} from '../legacy/config'
import {ensureKeysValidity} from '../legacy/deviceSettings'
import {WrongPassword} from '../legacy/errors'
import KeyStore from '../legacy/KeyStore'
import {useSelectedWallet} from '../SelectedWallet'
import {SystemAuthDisabled, walletManager} from '../yoroi-wallets'
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

  const [errorData, setErrorData] = useState<ErrorData>({
    showErrorDialog: false,
    errorMessage: '',
    errorLogs: null,
  })

  const isConfirmationDisabled = !wallet.isHW && !wallet.isEasyConfirmationEnabled && !password

  const onContinue = React.useCallback(async () => {
    const createTransaction = (decryptedKey: string) => {
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
    }

    if (wallet.isEasyConfirmationEnabled) {
      try {
        await ensureKeysValidity(wallet.id)
        navigation.navigate('biometrics', {
          keyId: walletManager._id,
          onSuccess: async (decryptedKey) => {
            navigation.goBack()
            createTransaction(decryptedKey)
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

      return createTransaction(decryptedKey)
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
    wallet.isEasyConfirmationEnabled,
    wallet.id,
    createVotingRegTx,
    pin,
    setVotingRegTxData,
    navigation,
    strings.bioAuthInstructions,
    strings.errorMessage,
    intl,
    password,
  ])

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
