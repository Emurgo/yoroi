/* eslint-disable @typescript-eslint/no-explicit-any */
import BigNumber from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {ProgressStep, Spacer, TextInput} from '../components'
import {ConfirmTx} from '../components/ConfirmTx'
import {useTokenInfo, useVotingRegTx} from '../hooks'
import {txLabels} from '../i18n/global-messages'
import {formatTokenWithSymbol} from '../legacy/format'
import {useSelectedWallet} from '../SelectedWallet'
import {Amounts} from '../yoroi-wallets/utils'
import {Title} from './components'

export const ConfirmVotingTx = ({
  onSuccess,
  onNext,
  pin,
}: {
  onSuccess: (key: string) => void
  onNext: () => void
  pin: string
}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const votingRegTx = useVotingRegTx(
    {wallet, pin}, //
    {onSuccess: ({votingKeyEncrypted}) => onSuccess(votingKeyEncrypted)},
  )
  const tokenInfo = useTokenInfo({wallet, tokenId: wallet.defaultAsset.identifier})

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={5} totalSteps={6} />

      <View style={styles.container}>
        <ScrollView bounces={false}>
          <Spacer height={48} />

          <Title>{strings.subTitle}</Title>

          <Spacer height={16} />

          <TextInput
            value={formatTokenWithSymbol(new BigNumber(Amounts.getAmount(votingRegTx.fee, '').quantity), tokenInfo)}
            label={strings.fees}
            editable={false}
            autoComplete={false}
          />
        </ScrollView>

        <Spacer fill />

        <ConfirmTx onSuccess={() => onNext()} unsignedTx={votingRegTx} wallet={wallet} />
      </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    fees: intl.formatMessage(txLabels.fees),
    subTitle: intl.formatMessage(messages.subTitle),
  }
}
