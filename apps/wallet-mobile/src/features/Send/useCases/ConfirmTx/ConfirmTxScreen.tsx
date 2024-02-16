/* eslint-disable @typescript-eslint/no-explicit-any */
import {useFocusEffect} from '@react-navigation/native'
import {useTransfer} from '@yoroi/transfer'
import React, {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {KeyboardAvoidingView, Spacer, ValidatedTextInput} from '../../../../components'
import {ConfirmTx} from '../../../../components/ConfirmTx'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../../../i18n/global-messages'
import {assetsToSendProperties} from '../../../../metrics/helpers'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {sortTokenInfos} from '../../../../utils'
import {useSaveMemo, useTokenInfos} from '../../../../yoroi-wallets/hooks'
import {YoroiSignedTx} from '../../../../yoroi-wallets/types'
import {Amounts} from '../../../../yoroi-wallets/utils'
import {debugWalletInfo, features} from '../../..'
import {useNavigateTo} from '../../common/navigation'
import {useFlashAndScroll} from '../../common/useFlashAndScroll'
import {BalanceAfter} from './Summary/BalanceAfter'
import {CurrentBalance} from './Summary/CurrentBalance'
import {Fees} from './Summary/Fees'
import {PrimaryTotal} from './Summary/PrimaryTotal'
import {ReceiverInfo} from './Summary/ReceiverInfo'
import {SecondaryTotals} from './Summary/SecondaryTotals'

export const ConfirmTxScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const [password, setPassword] = React.useState('')
  const [useUSB, setUseUSB] = React.useState(false)
  const {track} = useMetrics()

  const {memo, selectedTargetIndex, unsignedTx: yoroiUnsignedTx, targets} = useTransfer()
  const {amounts} = targets[selectedTargetIndex].entry
  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(amounts).map(({tokenId}) => tokenId),
  })
  const tokens = sortTokenInfos({wallet, tokenInfos})

  const {saveMemo} = useSaveMemo({wallet})

  useEffect(() => {
    if (features.prefillWalletInfo && __DEV__) {
      setPassword(debugWalletInfo.PASSWORD)
    }
  }, [])

  const sendProperties = React.useMemo(() => assetsToSendProperties({tokens, amounts}), [amounts, tokens])

  useFocusEffect(
    React.useCallback(() => {
      track.sendSummaryPageViewed(sendProperties)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [track]),
  )

  const onSuccess = (signedTx: YoroiSignedTx) => {
    track.sendSummarySubmitted(sendProperties)
    navigateTo.submittedTx(signedTx.signedTx.id)

    if (memo.length > 0) {
      saveMemo({txId: signedTx.signedTx.id, memo: memo.trim()})
    }
  }

  const onError = () => {
    track.sendSummarySubmitted(sendProperties)
    navigateTo.failedTx()
  }

  const scrollViewRef = useFlashAndScroll()

  if (yoroiUnsignedTx === undefined) throw new Error('Missing yoroiUnsignedTx')

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <ScrollView style={styles.container} persistentScrollbar ref={scrollViewRef}>
          <CurrentBalance />

          <Fees yoroiUnsignedTx={yoroiUnsignedTx} />

          <Spacer height={4} />

          <BalanceAfter yoroiUnsignedTx={yoroiUnsignedTx} />

          <Spacer height={16} />

          {targets.map((target, index) => (
            <ReceiverInfo key={`${target.receiver.resolve}:${index}`} target={target} />
          ))}

          <Spacer height={8} />

          <PrimaryTotal yoroiUnsignedTx={yoroiUnsignedTx} />

          <Spacer height={8} />

          <SecondaryTotals yoroiUnsignedTx={yoroiUnsignedTx} />

          {!wallet.isEasyConfirmationEnabled && !wallet.isHW && (
            <ValidatedTextInput
              secureTextEntry
              value={password}
              label={strings.password}
              onChangeText={setPassword}
              testID="spendingPasswordInput"
            />
          )}
        </ScrollView>

        <Actions>
          <ConfirmTx
            onSuccess={onSuccess}
            onError={onError}
            yoroiUnsignedTx={yoroiUnsignedTx}
            useUSB={useUSB}
            setUseUSB={setUseUSB}
            isProvidingPassword
            providedPassword={password}
            chooseTransportOnConfirmation
          />
        </Actions>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const Actions = (props: ViewProps) => <View {...props} style={{padding: 16}} />

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  container: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
    paddingHorizontal: 16,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    availableFunds: intl.formatMessage(globalMessages.availableFunds),
    balanceAfterTx: intl.formatMessage(txLabels.balanceAfterTx),
    total: intl.formatMessage(globalMessages.total),
    password: intl.formatMessage(txLabels.password),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    submittingTx: intl.formatMessage(txLabels.submittingTx),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
    generalTxError: {
      title: intl.formatMessage(errorMessages.generalTxError.title),
      message: intl.formatMessage(errorMessages.generalTxError.message),
    },
  }
}
