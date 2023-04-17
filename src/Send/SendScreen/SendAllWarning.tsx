import React from 'react'

import {DangerousActionModal, Text} from '../../components'
import {truncateWithEllipsis} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {useTokenInfo} from '../../yoroi-wallets'
import {useStrings} from './strings'

type SendAllWarningProps = {
  selectedTokenIdentifier: string
  onConfirm: () => void
  onCancel: () => void
  showSendAllWarning: boolean
}
export const SendAllWarning = ({
  showSendAllWarning,
  selectedTokenIdentifier,
  onCancel,
  onConfirm,
}: SendAllWarningProps) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenIdentifier})
  const isPrimaryToken = tokenInfo.id === wallet.primaryTokenInfo.id
  const assetNameOrId = truncateWithEllipsis(tokenInfo.ticker ?? tokenInfo.name ?? tokenInfo.fingerprint, 20)
  const alertBoxContent = {
    content: isPrimaryToken
      ? [strings.sendAllWarningAlert1({assetNameOrId}), strings.sendAllWarningAlert2, strings.sendAllWarningAlert3]
      : [strings.sendAllWarningAlert1({assetNameOrId})],
  }
  return (
    <DangerousActionModal
      visible={showSendAllWarning}
      onRequestClose={onCancel}
      showCloseIcon
      title={strings.sendAllWarningTitle}
      primaryButton={{
        label: strings.backButton,
        onPress: onCancel,
      }}
      secondaryButton={{
        label: strings.continueButton,
        onPress: onConfirm,
      }}
      alertBox={alertBoxContent}
    >
      <Text>{strings.sendAllWarningText}</Text>
    </DangerousActionModal>
  )
}
