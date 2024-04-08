import {catalystManagerMaker} from '@yoroi/staking'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, Text} from '../components'
import {useSelectedWallet} from '../features/SelectedWallet/Context'
import globalMessages, {confirmationMessages} from '../i18n/global-messages'
import {isNightly} from '../legacy/config'
import {Logger} from '../legacy/logging'
import {COLORS} from '../theme'
import {useCanVote} from './hooks'
import {InsufficientFundsModal} from './InsufficientFundsModal'

type Props = {onPress: () => void; disabled?: boolean}

export const VotingBanner = ({onPress, disabled}: Props) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {canVote, sufficientFunds} = useCanVote(wallet)
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false)
  const [showCatalystBanner, setShowCatalystBanner] = useState(canVote)

  useEffect(() => {
    const checkCatalystFundInfo = async () => {
      let fundInfo: {
        registrationStart: string
        registrationEnd: string
      } | null = null

      if (canVote) {
        try {
          const {currentFund} = await wallet.fetchFundInfo()
          if (currentFund != null) {
            fundInfo = {
              registrationStart: currentFund.registrationStart,
              registrationEnd: currentFund.registrationEnd,
            }
          }
        } catch (e) {
          Logger.debug('Could not get Catalyst fund info from server', e)
        }
      }

      const catalyst = catalystManagerMaker()

      setShowCatalystBanner((canVote && catalyst.isRegistrationOpen(fundInfo)) || isNightly() || __DEV__)
    }

    checkCatalystFundInfo()
  }, [canVote, wallet])

  if (!showCatalystBanner) return null

  const handleOnPress = () => (sufficientFunds ? onPress() : setShowInsufficientFundsModal(true))

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOnPress} disabled={disabled}>
        <View style={styles.button}>
          <Icon.Catalyst size={26} color={COLORS.LIGHT_POSITIVE_GREEN} />

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

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_POSITIVE_GREEN,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  text: {
    color: COLORS.LIGHT_POSITIVE_GREEN,
  },
})

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
