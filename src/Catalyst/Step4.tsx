import {useFocusEffect, useNavigation} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config/config'
import {WrongPassword} from '../../legacy/crypto/errors'
import KeyStore from '../../legacy/crypto/KeyStore'
import walletManager, {SystemAuthDisabled} from '../../legacy/crypto/walletManager'
import {ensureKeysValidity} from '../../legacy/helpers/deviceSettings'
import {confirmationMessages, errorMessages, txLabels} from '../../legacy/i18n/global-messages'
import {CATALYST_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {Button, OfflineBanner, ProgressStep, Spacer, TextInput} from '../components'
import {ErrorModal} from '../components'
import {useSelectedWallet} from '../SelectedWallet'
import {CatalystData, useCatalyst} from './Catalyst.hooks'
import {Actions, Description, Title} from './components'

type ErrorData = {
  showErrorDialog: boolean
  errorMessage: string
  errorLogs: string | null
}

type Props = {
  pin: string
  setCatalystData: (catalystData?: CatalystData | undefined) => void
}
export const Step4 = ({pin, setCatalystData}: Props) => {
  const intl = useIntl()
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {mutateAsync: generateVotingTransaction} = useCatalyst({wallet})
  const navigation = useNavigation()
  const [password, setPassword] = useState('')

  const [generatingTransaction, setGeneratingTransaction] = useState(false)
  const [errorData, setErrorData] = useState<ErrorData>({
    showErrorDialog: false,
    errorMessage: '',
    errorLogs: null,
  })

  const isConfirmationDisabled = !wallet.isHW && !wallet.isEasyConfirmationEnabled && !password

  const onContinue = React.useCallback(async () => {
    const generateTransaction = async (decryptedKey: string) => {
      setGeneratingTransaction(true)
      try {
        const catalystData = await generateVotingTransaction({
          decryptedKey,
          pin,
        })
        setCatalystData(catalystData)
      } finally {
        setGeneratingTransaction(false)
      }
      navigation.navigate(CATALYST_ROUTES.STEP5)
    }

    if (wallet.isEasyConfirmationEnabled) {
      try {
        await ensureKeysValidity(walletManager._id)
        navigation.navigate(CATALYST_ROUTES.BIOMETRICS_SIGNING, {
          keyId: walletManager._id,
          onSuccess: async (decryptedKey) => {
            navigation.goBack()
            await generateTransaction(decryptedKey)
          },
          onFail: () => navigation.goBack(),
          addWelcomeMessage: false,
          instructions: [strings.bioAuthInstructions],
        })
      } catch (error) {
        if (error instanceof SystemAuthDisabled) {
          await walletManager.closeWallet()
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)

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
    intl,
    wallet.isEasyConfirmationEnabled,
    navigation,
    password,
    strings.bioAuthInstructions,
    strings.errorMessage,
    pin,
    generateVotingTransaction,
    setCatalystData,
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
      setCatalystData(undefined)
    }, [setCatalystData]),
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={4} totalSteps={6} />
      <OfflineBanner />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps={'always'}>
        <Spacer height={48} />

        <Title>{strings.subTitle}</Title>

        <Spacer height={16} />

        <Description>{strings.description}</Description>

        {!wallet.isEasyConfirmationEnabled && (
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
