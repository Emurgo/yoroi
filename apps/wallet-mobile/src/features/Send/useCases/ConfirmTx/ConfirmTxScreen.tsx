import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import React, {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {KeyboardAvoidingView, ValidatedTextInput} from '../../../../components'
import {ConfirmTx} from '../../../../components/ConfirmTx'
import {Space} from '../../../../components/Space/Space'
import {isDev} from '../../../../kernel/env'
import {debugWalletInfo, features} from '../../../../kernel/features'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../../../kernel/i18n/global-messages'
import {assetsToSendProperties} from '../../../../kernel/metrics/helpers'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useSaveMemo} from '../../../../yoroi-wallets/hooks'
import {YoroiSignedTx} from '../../../../yoroi-wallets/types'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
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
  const styles = useStyles()
  const {wallet, meta} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const [password, setPassword] = React.useState('')
  const [useUSB, setUseUSB] = React.useState(false)
  const {track} = useMetrics()

  const {memo, selectedTargetIndex, unsignedTx: yoroiUnsignedTx, targets} = useTransfer()
  const {amounts} = targets[selectedTargetIndex].entry

  const {saveMemo} = useSaveMemo({wallet})

  useEffect(() => {
    if (features.prefillWalletInfo && isDev) {
      setPassword(debugWalletInfo.PASSWORD)
    }
  }, [])

  const sendProperties = React.useMemo(() => assetsToSendProperties({amounts}), [amounts])

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

  React.useEffect(() => {
    const test = async () => {
      console.log('txBody', await yoroiUnsignedTx.unsignedTx.txBody.toJson())
    }

    test()
  }, [yoroiUnsignedTx.unsignedTx.txBody])

  return (
    <KeyboardAvoidingView style={[styles.root, styles.flex]}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.flex, styles.safeAreaView]}>
        <ScrollView style={styles.scrollView} persistentScrollbar ref={scrollViewRef}>
          <CurrentBalance />

          <Fees yoroiUnsignedTx={yoroiUnsignedTx} />

          <Space height="xs" />

          <BalanceAfter yoroiUnsignedTx={yoroiUnsignedTx} />

          <Space height="lg" />

          {targets.map((target, index) => (
            <ReceiverInfo key={`${target.receiver.resolve}:${index}`} target={target} />
          ))}

          <Space />

          <PrimaryTotal yoroiUnsignedTx={yoroiUnsignedTx} />

          <Space />

          <SecondaryTotals yoroiUnsignedTx={yoroiUnsignedTx} />

          <Space />

          {!meta.isEasyConfirmationEnabled && !meta.isHW && (
            <ValidatedTextInput
              secureTextEntry
              value={password}
              label={strings.password}
              onChangeText={setPassword}
              testID="spendingPasswordInput"
              textContentType="oneTimeCode"
              noHelper
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const Actions = ({style, ...props}: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={[styles.actions, style]} />
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
    },
    safeAreaView: {
      ...atoms.gap_lg,
      ...atoms.pb_lg,
    },
    scrollView: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    flex: {
      ...atoms.flex_1,
    },
    actions: {
      ...atoms.px_lg,
    },
  })
  return styles
}

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
