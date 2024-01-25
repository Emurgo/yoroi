/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useEffect, useRef} from 'react'
import {useIntl} from 'react-intl'
import {Keyboard, ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Spacer, ValidatedTextInput} from '../../../../components'
import {ConfirmTx} from '../../../../components/ConfirmTx'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../../../i18n/global-messages'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useSetCollateralId} from '../../../../yoroi-wallets/cardano/utxoManager/useSetCollateralId'
import {useSaveMemo} from '../../../../yoroi-wallets/hooks'
import {YoroiSignedTx} from '../../../../yoroi-wallets/types'
import {debugWalletInfo, features} from '../../..'
import {useSend} from '../../../Send/common/SendContext'
import {useNavigateTo} from '../navigation'
import {BalanceAfter} from './Summary/BalanceAfter'
import {CurrentBalance} from './Summary/CurrentBalance'
import {Fees} from './Summary/Fees'
import {PrimaryTotal} from './Summary/PrimaryTotal'
import {SecondaryTotals} from './Summary/SecondaryTotals'

export const ConfirmTxScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const [password, setPassword] = React.useState('')
  const [useUSB, setUseUSB] = React.useState(false)
  const {setCollateralId} = useSetCollateralId(wallet)

  const {memo, yoroiUnsignedTx} = useSend()

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

  const scrollViewRef = useFlashAndScroll()

  if (!yoroiUnsignedTx) throw new Error('Missing yoroiUnsignedTx')

  return (
    <View style={styles.root}>
      <CurrentBalance />

      <View style={{paddingTop: 16, paddingHorizontal: 16}}>
        <Fees yoroiUnsignedTx={yoroiUnsignedTx} />

        <Spacer height={4} />

        <BalanceAfter yoroiUnsignedTx={yoroiUnsignedTx} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{padding: 16}}
        persistentScrollbar
        ref={scrollViewRef}
      >
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
    </View>
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

const useFlashAndScroll = () => {
  const scrollViewRef = useRef<ScrollView | null>(null)

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 500)

    Keyboard.addListener('keyboardWillShow', () => {
      scrollViewRef.current?.scrollToEnd()
    })
  }, [])

  return scrollViewRef
}
