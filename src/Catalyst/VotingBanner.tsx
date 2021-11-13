import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import CatalystLogo from '../../legacy/assets/img/voting.png'
import StandardModal from '../../legacy/components/Common/StandardModal'
import {Text} from '../../legacy/components/UiKit'
import {CONFIG, isHaskellShelley, isNightly} from '../../legacy/config/config'
import {isRegistrationOpen} from '../../legacy/crypto/shelley/catalystUtils'
import type {WalletInterface} from '../../legacy/crypto/WalletInterface'
import globalMessages, {confirmationMessages} from '../../legacy/i18n/global-messages'
import {availableAssetsSelector, tokenBalanceSelector} from '../../legacy/selectors'
import {COLORS} from '../../legacy/styles/config'
import {formatTokenWithText} from '../../legacy/utils/format'
import {Logger} from '../../legacy/utils/logging'
import {useSelectedWallet} from '../SelectedWallet'

type Props = {
  onPress: () => void
  disabled: boolean
}

export const VotingBanner = ({onPress, disabled}: Props) => {
  const strings = useStrings()

  const tokenBalance = useSelector(tokenBalanceSelector)
  const availableAssets = useSelector(availableAssetsSelector)
  const assetMetaData = availableAssets[tokenBalance.getDefaultId()]

  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false)

  const wallet = useSelectedWallet()
  const showCatalystBanner = useShowCatalystBanner(wallet)

  if (!showCatalystBanner) return null

  const handleOnPress = () => {
    if (tokenBalance.getDefault().lt(CONFIG.CATALYST.MIN_ADA)) {
      setShowInsufficientFundsModal(true)
      return
    }

    onPress()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOnPress} disabled={disabled}>
        <View style={styles.button}>
          <Image source={CatalystLogo} />
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
              requiredBalance: formatTokenWithText(CONFIG.CATALYST.DISPLAYED_MIN_ADA, assetMetaData),
              currentBalance: formatTokenWithText(tokenBalance.getDefault(), assetMetaData),
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

const useShowCatalystBanner = (wallet: WalletInterface) => {
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
  }, [canVote, wallet])

  return showCatalystBanner
}
