import BigNumber from 'bignumber.js'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {useSelectedWallet} from '../../src/SelectedWallet'
import {Icon, StandardModal, Text} from '../components'
import {useBalances, useTokenInfo} from '../hooks'
import globalMessages, {confirmationMessages} from '../i18n/global-messages'
import {CONFIG, isHaskellShelley, isNightly} from '../legacy/config'
import {formatTokenWithText} from '../legacy/format'
import {Logger} from '../legacy/logging'
import {COLORS} from '../theme'
import {isRegistrationOpen} from '../yoroi-wallets'
import {Quantity} from '../yoroi-wallets/types'
import {Amounts, Quantities} from '../yoroi-wallets/utils'
type Props = {onPress: () => void; disabled?: boolean}

export const VotingBanner = ({onPress, disabled}: Props) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const balances = useBalances(wallet)
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})

  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false)
  const canVote = isHaskellShelley(wallet.walletImplementationId)
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

      setShowCatalystBanner((canVote && isRegistrationOpen(fundInfo)) || isNightly() || __DEV__)
    }

    checkCatalystFundInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!showCatalystBanner) return null

  const handleOnPress = () => {
    const sufficientFunds = Quantities.isGreaterThan(
      Amounts.getAmount(balances, '').quantity,
      CONFIG.CATALYST.MIN_ADA.toString() as Quantity,
    )

    if (!sufficientFunds) {
      setShowInsufficientFundsModal(true)
      return
    }

    onPress()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOnPress} disabled={disabled}>
        <View style={styles.button}>
          <Icon.Catalyst size={26} color={COLORS.LIGHT_POSITIVE_GREEN} />
          <Text style={styles.text}>{strings.name.toLocaleUpperCase()}</Text>
        </View>
      </TouchableOpacity>

      <StandardModal
        visible={showInsufficientFundsModal}
        title={strings.attention}
        onRequestClose={() => setShowInsufficientFundsModal(false)}
        primaryButton={{
          label: strings.back,
          onPress: () => setShowInsufficientFundsModal(false),
        }}
        showCloseIcon
      >
        <View>
          <Text>
            {strings.noBalance({
              requiredBalance: formatTokenWithText(CONFIG.CATALYST.DISPLAYED_MIN_ADA, tokenInfo),
              currentBalance: formatTokenWithText(new BigNumber(Amounts.getAmount(balances, '').quantity), tokenInfo),
            })}
          </Text>
        </View>
      </StandardModal>
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
    noBalance: ({requiredBalance, currentBalance}) =>
      intl.formatMessage(globalMessages.insufficientBalance, {
        requiredBalance,
        currentBalance,
      }),
  }
}
