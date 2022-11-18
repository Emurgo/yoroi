/* eslint-disable @typescript-eslint/no-explicit-any */
import BigNumber from 'bignumber.js'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {ProgressStep, Spacer, TextInput} from '../components'
import {ConfirmTx} from '../components/ConfirmTx'
import {useTokenInfo, useVotingRegTx} from '../hooks'
import {Instructions as HWInstructions} from '../HW'
import {errorMessages, txLabels} from '../i18n/global-messages'
import LocalizableError from '../i18n/LocalizableError'
import {CONFIG} from '../legacy/config'
import {formatTokenWithSymbol} from '../legacy/format'
import {useSelectedWallet} from '../SelectedWallet'
import {Amounts} from '../yoroi-wallets/utils'
import {Actions, Description, Title} from './components'

export const ConfirmVotingTx = ({onNext}: {onNext: () => void}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const [password, setPassword] = useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')
  const [useUSB, setUseUSB] = useState<boolean>(false)
  const {votingRegTx} = useVotingRegTx(wallet)
  const tokenInfo = useTokenInfo({wallet, tokenId: wallet.defaultAsset.identifier})

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={5} totalSteps={6} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
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
          value={formatTokenWithSymbol(new BigNumber(Amounts.getAmount(votingRegTx.fee, '').quantity), tokenInfo)}
          label={strings.fees}
          editable={false}
          autoComplete={false}
        />

        {!wallet.isEasyConfirmationEnabled && !wallet.isHW && (
          <TextInput
            secureTextEntry
            value={password}
            label={strings.password}
            onChangeText={setPassword}
            autoComplete={false}
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
        />
      </Actions>
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
    errorMessage: (error: LocalizableError) =>
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
