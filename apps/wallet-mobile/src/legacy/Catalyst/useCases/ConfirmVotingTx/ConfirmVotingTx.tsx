import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, Spacer, TextInput, useModal} from '../../../../components'
import {ConfirmTxWithHwModal} from '../../../../components/ConfirmTxWithHwModal'
import {ConfirmTxWithOsModal} from '../../../../components/ConfirmTxWithOsModal'
import {ConfirmTxWithSpendingPasswordModal} from '../../../../components/ConfirmTxWithSpendingPasswordModal'
import {Space} from '../../../../components/Space/Space'
import {useSelectedWallet} from '../../../../features/WalletManager/common/hooks/useSelectedWallet'
import {errorMessages, txLabels} from '../../../../kernel/i18n/global-messages'
import LocalizableError from '../../../../kernel/i18n/LocalizableError'
import {useVotingRegTx} from '../../../../yoroi-wallets/hooks'
import {Amounts} from '../../../../yoroi-wallets/utils'
import {formatTokenWithSymbol} from '../../../../yoroi-wallets/utils/format'
import {Instructions as HWInstructions} from '../../../HW'
import {Actions, Description} from '../../common/components'

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
  const {openModal, closeModal} = useModal()

  const {wallet, meta} = useSelectedWallet()
  const votingRegTx = useVotingRegTx(
    {wallet, pin, supportsCIP36, addressMode: meta.addressMode},
    {onSuccess: ({votingKeyEncrypted}) => onSuccess(votingKeyEncrypted)},
  )

  const [useUSB, setUseUSB] = useState(false)

  const handleCIP36SupportChange = (supportsCIP36: boolean) => {
    setSupportsCIP36(supportsCIP36)
  }

  const onSubmit = () => {
    if (meta.isHW) {
      openModal(
        'test',
        <ConfirmTxWithHwModal
          onCancel={closeModal}
          unsignedTx={votingRegTx}
          setUseUSB={setUseUSB}
          onCIP36SupportChange={handleCIP36SupportChange}
          onSuccess={() => onNext()}
        />,
      )
      return
    }

    if (!meta.isHW && !meta.isEasyConfirmationEnabled) {
      openModal('test', <ConfirmTxWithSpendingPasswordModal unsignedTx={votingRegTx} onSuccess={() => onNext()} />)
      return
    }

    if (!meta.isHW && meta.isEasyConfirmationEnabled) {
      openModal('test', <ConfirmTxWithOsModal unsignedTx={votingRegTx} onSuccess={() => onNext()} />)
      return
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <ScrollView bounces={false} contentContainerStyle={styles.scroll}>
          <Space height="lg" />

          <Text style={styles.confirmVotingTxTitle}>{strings.confirmationTitle}</Text>

          <Space height="lg" />

          {meta.isHW ? (
            <>
              <HWInstructions useUSB={useUSB} />

              <Space height="lg" />
            </>
          ) : (
            <>
              <Description>
                {meta.isEasyConfirmationEnabled ? strings.authOsInstructions : strings.passwordSignDescription}
              </Description>

              <Space height="lg" />
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{strings.fees}</Text>

            <TextInput
              value={formatTokenWithSymbol(
                Amounts.getAmount(votingRegTx.fee, wallet.primaryToken.identifier).quantity,
                wallet.primaryToken,
              )}
              editable={false}
              autoComplete="off"
            />
          </View>
        </ScrollView>

        <Spacer fill />

        <Actions>
          <Button title="confirm" shelleyTheme onPress={onSubmit} />
        </Actions>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const messages = defineMessages({
  confirmationTitle: {
    id: 'components.catalyst.confirmTx.title',
    defaultMessage: '!!!Confirm Registration',
  },
  passwordSignDescription: {
    id: 'components.catalyst.confirmTx.passwordSignDescription',
    defaultMessage:
      '!!!Confirm your voting registration and submit the certificate generated in previous step to the blockchain',
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
      backgroundColor: color.bg_color_high,
    },
    confirmVotingTxTitle: {
      ...atoms.body_2_md_regular,
      color: color.gray_c600,
    },
    label: {
      zIndex: 1000,
      position: 'absolute',
      top: -3,
      left: 11,
      paddingHorizontal: 3,
      ...atoms.body_3_sm_regular,
      color: color.gray_cmax,
      backgroundColor: color.gray_cmin,
    },
    inputContainer: {
      position: 'relative',
    },
    scroll: {
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
    confirmationTitle: intl.formatMessage(messages.confirmationTitle),
    passwordSignDescription: intl.formatMessage(messages.passwordSignDescription),
    authOsInstructions: intl.formatMessage(messages.authOsInstructions),
    password: intl.formatMessage(txLabels.password),
    errorTitle: intl.formatMessage(errorMessages.generalTxError.title),
    generalErrorMessage: intl.formatMessage(errorMessages.generalTxError.message),
  }
}
