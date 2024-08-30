import {useCatalyst} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, Spacer, TextInput, useModal} from '../../../../components'
import {ConfirmTxWithHwModal} from '../../../../components/ConfirmTxWithHwModal'
import {ConfirmTxWithOsModal} from '../../../../components/ConfirmTxWithOsModal'
import {ConfirmTxWithSpendingPasswordModal} from '../../../../components/ConfirmTxWithSpendingPasswordModal'
import {Space} from '../../../../components/Space/Space'
import {Instructions as HWInstructions} from '../../../../legacy/HW'
import {useVotingRegTx} from '../../../../yoroi-wallets/hooks'
import {Amounts} from '../../../../yoroi-wallets/utils'
import {formatTokenWithSymbol} from '../../../../yoroi-wallets/utils/format'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from '../../CatalystNavigator'
import {Actions, Description} from '../../common/components'
import {useStrings} from '../../common/strings'

export const ConfirmVotingTx = () => {
  const [supportsCIP36, setSupportsCIP36] = useState(true)
  const styles = useStyles()
  const strings = useStrings()
  const {openModal, closeModal} = useModal()
  const {catalystKeyHex, pin} = useCatalyst()
  const navigateTo = useNavigateTo()

  const onNext = () => {
    navigateTo.qrCode()
  }

  if (pin === null) throw new Error('pin cannot be null')
  if (catalystKeyHex === null) throw new Error('catalystKeyHex cannot be null')

  const {wallet, meta} = useSelectedWallet()
  const votingRegTx = useVotingRegTx({wallet, supportsCIP36, catalystKeyHex, addressMode: meta.addressMode})

  const [useUSB, setUseUSB] = useState(false)

  const handleCIP36SupportChange = (supportsCIP36: boolean) => {
    setSupportsCIP36(supportsCIP36)
  }

  const onSubmit = () => {
    if (meta.isHW) {
      openModal(
        strings.signTransaction,
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
      openModal(
        strings.signTransaction,
        <ConfirmTxWithSpendingPasswordModal unsignedTx={votingRegTx} onSuccess={() => onNext()} />,
      )
      return
    }

    if (!meta.isHW && meta.isEasyConfirmationEnabled) {
      openModal(strings.signTransaction, <ConfirmTxWithOsModal unsignedTx={votingRegTx} onSuccess={() => onNext()} />)
      return
    }
  }

  return (
    <KeyboardAvoidingView style={{flex: 1}}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
        <ScrollView bounces={false}>
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
          <Button title={strings.confirm} shelleyTheme onPress={onSubmit} />
        </Actions>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.pb_lg,
    },
    confirmVotingTxTitle: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
    label: {
      top: -3,
      left: 11,
      paddingHorizontal: 3,
      color: color.text_gray_max,
      backgroundColor: color.gray_min,
      ...atoms.z_50,
      ...atoms.absolute,
      ...atoms.body_3_sm_regular,
    },
    inputContainer: {
      ...atoms.relative,
    },
  })

  return styles
}
