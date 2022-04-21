/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector} from 'react-redux'

import {OfflineBanner, ProgressStep, Spacer, TextInput} from '../components'
import {ConfirmTx} from '../components/ConfirmTx'
import {Instructions as HWInstructions} from '../HW'
import {txLabels} from '../i18n/global-messages'
import LocalizableError from '../i18n/LocalizableError'
import {CONFIG} from '../legacy/config'
import {formatTokenWithSymbol} from '../legacy/format'
import {defaultNetworkAssetSelector} from '../legacy/selectors'
import {CatalystRouteNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {Actions, Description, Title} from './components'
import {VotingRegTxData} from './hooks'

type Props = {
  votingRegTxData: VotingRegTxData
}
export const Step5 = ({votingRegTxData}: Props) => {
  const strings = useStrings()
  const navigation = useNavigation<CatalystRouteNavigation>()
  const wallet = useSelectedWallet()
  const defaultAsset = useSelector(defaultNetworkAssetSelector)
  const [password, setPassword] = useState('')

  const [fees, setFees] = useState<null | BigNumber>(null)
  const [useUSB, setUseUSB] = useState<boolean>(false)

  useEffect(() => {
    if (votingRegTxData?.signRequest != null) {
      votingRegTxData.signRequest.fee().then((o) => {
        setFees(o.getDefault())
      })
    }
  }, [votingRegTxData, wallet.isHW])

  useEffect(() => {
    setPassword(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')
  }, [])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={5} totalSteps={6} />

      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Spacer height={48} />

        <Title>{strings.subTitle}</Title>

        <Spacer height={16} />

        {wallet.isHW ? (
          <HWInstructions useUSB={useUSB} />
        ) : (
          <Description>
            {wallet.isEasyConfirmationEnabled ? strings.bioAuthDescription : strings.description}
          </Description>
        )}

        <Spacer height={48} />

        <TextInput
          value={fees ? formatTokenWithSymbol(fees, defaultAsset) : ''}
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
          process="signAndSubmit"
          onSuccess={() => navigation.navigate('catalyst-qr-code')}
          isProvidingPassword
          providedPassword={password}
          setUseUSB={setUseUSB}
          useUSB={useUSB}
          txDataSignRequest={votingRegTxData?.signRequest}
          biometricInstructions={[strings.bioAuthDescription]}
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
  bioAuthDescription: {
    id: 'components.catalyst.step5.bioAuthDescription',
    defaultMessage:
      '!!!Please confirm your voting registration. You will be asked to ' +
      'authenticate once again to sign and submit the certificate generated ' +
      'in the previous step.',
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
    bioAuthDescription: intl.formatMessage(messages.bioAuthDescription),
    password: intl.formatMessage(txLabels.password),
  }
}
