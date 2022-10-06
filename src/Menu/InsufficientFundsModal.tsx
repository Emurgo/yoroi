import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text, View} from 'react-native'
import {useSelector} from 'react-redux'

import {StandardModal} from '../components'
import globalMessages, {confirmationMessages} from '../i18n/global-messages'
import {CONFIG} from '../legacy/config'
import {formatTokenWithText} from '../legacy/format'
import {availableAssetsSelector, tokenBalanceSelector} from '../legacy/selectors'

export const InsufficientFundsModal = ({visible, onRequestClose}: {visible: boolean; onRequestClose: () => void}) => {
  const strings = useStrings()
  const tokenBalance = useSelector(tokenBalanceSelector)
  const availableAssets = useSelector(availableAssetsSelector)
  const assetMetaData = availableAssets[tokenBalance.getDefaultId()]

  return (
    <StandardModal
      visible={visible}
      title={strings.attention}
      onRequestClose={onRequestClose}
      primaryButton={{
        label: strings.back,
        onPress: onRequestClose,
      }}
      showCloseIcon
    >
      <View>
        <Text>
          {strings.insufficientBalance({
            requiredBalance: formatTokenWithText(CONFIG.CATALYST.DISPLAYED_MIN_ADA, assetMetaData),
            currentBalance: formatTokenWithText(tokenBalance.getDefault(), assetMetaData),
          })}
        </Text>
      </View>
    </StandardModal>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    insufficientBalance: ({requiredBalance, currentBalance}) =>
      intl.formatMessage(globalMessages.insufficientBalance, {
        requiredBalance,
        currentBalance,
      }),
    attention: intl.formatMessage(globalMessages.attention),
    back: intl.formatMessage(confirmationMessages.commonButtons.backButton),
  }
}
