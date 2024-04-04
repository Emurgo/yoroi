/* eslint-disable @typescript-eslint/no-explicit-any */
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import React, {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {KeyboardAvoidingView, Spacer, ValidatedTextInput} from '../../../../components'
import {ConfirmTx} from '../../../../components/ConfirmTx'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../../../i18n/global-messages'
import {useSetCollateralId} from '../../../../yoroi-wallets/cardano/utxoManager/useSetCollateralId'
import {useSaveMemo} from '../../../../yoroi-wallets/hooks'
import {YoroiSignedTx} from '../../../../yoroi-wallets/types'
import {debugWalletInfo, features} from '../../..'
import {useSelectedWallet} from '../../../AddWallet/common/Context'
import {useNavigateTo} from '../navigation'
import {BalanceAfter} from './Summary/BalanceAfter'
import {CurrentBalance} from './Summary/CurrentBalance'
import {Fees} from './Summary/Fees'
import {PrimaryTotal} from './Summary/PrimaryTotal'
import {SecondaryTotals} from './Summary/SecondaryTotals'

export const ConfirmTxScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const [password, setPassword] = React.useState('')
  const [useUSB, setUseUSB] = React.useState(false)
  const {setCollateralId} = useSetCollateralId(wallet)

  const {memo, unsignedTx: yoroiUnsignedTx} = useTransfer()

  const {saveMemo} = useSaveMemo({wallet})

  useEffect(() => {
    if (features.prefillWalletInfo && __DEV__) {
      setPassword(debugWalletInfo.PASSWORD)
    }
  }, [])

  const onSuccess = (signedTx: YoroiSignedTx) => {
    navigateTo.submittedTx()
    const collateralId = `${signedTx.signedTx.id}:0`
    setCollateralId(collateralId)
    if (memo.length > 0) {
      saveMemo({txId: signedTx.signedTx.id, memo: memo.trim()})
    }
  }

  const onError = () => {
    navigateTo.failedTx()
  }

  if (yoroiUnsignedTx === undefined) throw new Error('Missing yoroiUnsignedTx')

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <ScrollView style={styles.container}>
          <CurrentBalance />

          <Spacer height={16} />

          <Fees yoroiUnsignedTx={yoroiUnsignedTx} />

          <Spacer height={4} />

          <BalanceAfter yoroiUnsignedTx={yoroiUnsignedTx} />

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

const Actions = (props: ViewProps) => {
  const styles = useStyles()
  return <View style={styles.actions} {...props} />
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.gray.min,
      flex: 1,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    actions: {
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === 'ios' ? 25 : 16,
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
