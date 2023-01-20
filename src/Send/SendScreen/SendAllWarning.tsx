import React from 'react'

import {DangerousActionModal, Text} from '../../components'
import {useToken} from '../../hooks'
import {getAssetDenominationOrId, truncateWithEllipsis} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
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
  const token = useToken({wallet, tokenId: selectedTokenIdentifier})
  const assetNameOrId = truncateWithEllipsis(getAssetDenominationOrId(token), 20)
  const alertBoxContent = {
    content: token.isDefault
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
