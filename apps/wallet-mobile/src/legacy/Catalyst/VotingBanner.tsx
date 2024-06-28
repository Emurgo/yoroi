import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, Text} from '../../components'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages, {confirmationMessages} from '../../kernel/i18n/global-messages'
import {useCanVote} from './hooks'
import {InsufficientFundsModal} from './InsufficientFundsModal'
import {useCatalystFundStatus} from './useCatalystFundStatus'

type Props = {onPress: () => void; disabled?: boolean}

export const VotingBanner = ({onPress, disabled}: Props) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {wallet} = useSelectedWallet()
  const {canVote, sufficientFunds} = useCanVote(wallet)
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false)
  const {fundStatus} = useCatalystFundStatus()
  const showCatalystBanner = canVote && fundStatus.registration === 'running'

  if (!showCatalystBanner) return null

  const handleOnPress = () => (sufficientFunds ? onPress() : setShowInsufficientFundsModal(true))

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOnPress} disabled={disabled}>
        <View style={styles.button}>
          <Icon.Catalyst size={26} color={colors.iconColor} />

          <Text style={styles.text}>{strings.name.toLocaleUpperCase()}</Text>
        </View>
      </TouchableOpacity>

      <InsufficientFundsModal
        visible={showInsufficientFundsModal}
        onRequestClose={() => setShowInsufficientFundsModal(false)}
      />
    </View>
  )
}

const messages = defineMessages({
  name: {
    id: 'components.catalyst.banner.name',
    defaultMessage: '!!!Catalyst Voting Registration',
  },
})

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.py_lg,
      alignItems: 'center',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: color.secondary_c500,
      ...atoms.py_md,
      ...atoms.px_xl,
    },
    text: {
      color: color.secondary_c500,
    },
  })
  const colors = {
    iconColor: color.secondary_c500,
  }
  return {styles, colors}
}

const useStrings = () => {
  const intl = useIntl()

  return {
    name: intl.formatMessage(messages.name),
    attention: intl.formatMessage(globalMessages.attention),
    back: intl.formatMessage(confirmationMessages.commonButtons.backButton),
    noBalance: ({requiredBalance, currentBalance}: {requiredBalance: string; currentBalance: string}) =>
      intl.formatMessage(globalMessages.insufficientBalance, {
        requiredBalance,
        currentBalance,
      }),
  }
}
