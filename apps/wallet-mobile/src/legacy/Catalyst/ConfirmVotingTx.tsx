import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {KeyboardAvoidingView, ProgressStep, Spacer, TextInput} from '../../components'
import {ConfirmTx} from '../../components/ConfirmTx'
import {debugWalletInfo, features} from '../../features'
import {useSelectedWallet} from '../../features/WalletManager/context/SelectedWalletContext'
import {errorMessages, txLabels} from '../../kernel/i18n/global-messages'
import LocalizableError from '../../kernel/i18n/LocalizableError'
import {useVotingRegTx} from '../../yoroi-wallets/hooks'
import {Amounts} from '../../yoroi-wallets/utils'
import {formatTokenWithSymbol} from '../../yoroi-wallets/utils/format'
import {Instructions as HWInstructions} from '../HW'
import {Actions, Description, Title} from './components'

export const ConfirmVotingTx = ({
  onSuccess,
  onNext,
  pin,
}: {
  onSuccess: (key: string) => void
  onNext: () => void
  pin: string
}) => {
  const [supportsCIP36, setSupportsCIP36] = useState(true)
  const styles = useStyles()

  const strings = useStrings()
  const wallet = useSelectedWallet()
  const votingRegTx = useVotingRegTx(
    {wallet, pin, supportsCIP36},
    {onSuccess: ({votingKeyEncrypted}) => onSuccess(votingKeyEncrypted)},
  )
  const [password, setPassword] = useState(features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '')
  const [useUSB, setUseUSB] = useState(false)

  const handleCIP36SupportChange = (supportsCIP36: boolean) => {
    setSupportsCIP36(supportsCIP36)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <ProgressStep currentStep={5} totalSteps={6} />

        <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
          <Spacer height={48} />

          <Title>{strings.subTitle}</Title>

          <Spacer height={16} />

          {wallet.isHW ? (
            <HWInstructions useUSB={useUSB} />
          ) : (
            <Description>
              {wallet.isEasyConfirmationEnabled ? strings.authOsInstructions : strings.description}
            </Description>
          )}

          <Spacer height={48} />

          <TextInput
            value={formatTokenWithSymbol(
              Amounts.getAmount(votingRegTx.fee, wallet.primaryToken.identifier).quantity,
              wallet.primaryToken,
            )}
            label={strings.fees}
            editable={false}
            autoComplete="off"
          />

          {!wallet.isEasyConfirmationEnabled && !wallet.isHW && (
            <TextInput
              secureTextEntry
              value={password}
              label={strings.password}
              onChangeText={setPassword}
              autoComplete="off"
            />
          )}
        </ScrollView>

        <Spacer fill />

        <Actions>
          <ConfirmTx
            onSuccess={() => onNext()}
            isProvidingPassword
            providedPassword={password}
            setUseUSB={setUseUSB}
            useUSB={useUSB}
            yoroiUnsignedTx={votingRegTx}
            biometricInstructions={[strings.authOsInstructions]}
            chooseTransportOnConfirmation
            onCIP36SupportChange={handleCIP36SupportChange}
            autoConfirm={!supportsCIP36}
            supportsCIP36={supportsCIP36}
          />
        </Actions>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step5.subTitle',
    defaultMessage: '!!!Confirm Registration',
  },
  description: {
    id: 'components.catalyst.step5.description',
    defaultMessage:
      '!!!Please enter your spending password again to confirm your voting ' +
      'registration and submit the certificate generated in the previous ' +
      'step.',
  },
  authOsInstructions: {
    id: 'components.catalyst.step4.bioAuthInstructions',
    defaultMessage: '!!!Please authenticate so that Yoroi can generate the required certificate for voting',
  },
})

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    contentContainer: {
      ...atoms.px_lg,
    },
  })

  return styles
}

const useStrings = () => {
  const intl = useIntl()

  return {
    errorMessage: (error: LocalizableError) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, (error as any).values),
    fees: intl.formatMessage(txLabels.fees),
    subTitle: intl.formatMessage(messages.subTitle),
    description: intl.formatMessage(messages.description),
    authOsInstructions: intl.formatMessage(messages.authOsInstructions),
    password: intl.formatMessage(txLabels.password),
    errorTitle: intl.formatMessage(errorMessages.generalTxError.title),
    generalErrorMessage: intl.formatMessage(errorMessages.generalTxError.message),
  }
}
