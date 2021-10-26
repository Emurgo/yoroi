// @flow

import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import CatalystLogo from '../../assets/img/voting.png'
import StandardModal from '../../components/Common/StandardModal'
import {CONFIG, isHaskellShelley, isNightly} from '../../config/config'
import {isRegistrationOpen} from '../../crypto/shelley/catalystUtils'
import walletManager from '../../crypto/walletManager'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
import {availableAssetsSelector, tokenBalanceSelector, walletMetaSelector} from '../../selectors'
import {COLORS} from '../../styles/config'
import {formatTokenWithText} from '../../utils/format'
import {Logger} from '../../utils/logging'
import {Text} from '../UiKit'

type Props = {|
  onPress: () => void,
  disabled: boolean,
|}

const VotingBanner = ({onPress, disabled}: Props) => {
  const strings = useStrings()
  const walletMeta = useSelector(walletMetaSelector)

  const tokenBalance = useSelector(tokenBalanceSelector)
  const availableAssets = useSelector(availableAssetsSelector)
  const assetMetaData = availableAssets[tokenBalance.getDefaultId()]

  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState<boolean>(false)
  const canVote = isHaskellShelley(walletMeta.walletImplementationId)
  const [showCatalystBanner, setShowCatalystBanner] = useState<boolean>(canVote)

  useEffect(() => {
    const checkCatalystFundInfo = async () => {
      let fundInfo: {|
        registrationStart: string,
        registrationEnd: string,
      |} | null = null

      if (canVote) {
        try {
          const {currentFund} = await walletManager.fetchFundInfo()
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

export default VotingBanner

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
