import {Blockies} from '@yoroi/identicon'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

const WalletDuplicatedModalContent = ({
  plate,
  seed,
  duplicatedAccountWalletMetaName,
}: {
  plate: string
  seed: string
  duplicatedAccountWalletMetaName: string
}) => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <Modal.Content>
      <Text style={[a.body_1_lg_regular, ta.text_gray_low]}>
        {strings.setupWallet.restoreDuplicatedWalletModalText}
      </Text>

      <Space.Height.lg />

      <View style={[a.flex_row, a.align_center, a.gap_md]}>
        <Icon.WalletAvatar
          image={Blockies({seed}).asBase64()}
          size={38}
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
          }}
        />

        <View style={[a.flex_1]}>
          <Text style={[a.body_2_md_medium, ta.text_gray_medium]}>
            {duplicatedAccountWalletMetaName}
          </Text>

          <Space.Height.xs />

          <Text style={[a.body_3_sm_regular, ta.text_gray_medium]}>
            {plate}
          </Text>
        </View>
      </View>
    </Modal.Content>
  )
}

const WalletDuplicatedModalFooter = ({
  duplicatedAccountWalletMetaId,
}: {
  duplicatedAccountWalletMetaId: string
}) => {
  const {walletManager} = useWalletManager()
  const strings = useStrings()
  const {resetToTxHistory} = useWalletNavigation()
  const {closeModal} = useModal()

  const handleOpenWalletWithDuplicatedName = React.useCallback(() => {
    walletManager.setSelectedWalletId(duplicatedAccountWalletMetaId)
    closeModal()
    resetToTxHistory()
  }, [
    walletManager,
    duplicatedAccountWalletMetaId,
    closeModal,
    resetToTxHistory,
  ])

  return (
    <Modal.Footer>
      <Button
        title={strings.setupWallet.restoreDuplicatedWalletModalButton}
        onPress={handleOpenWalletWithDuplicatedName}
      />
    </Modal.Footer>
  )
}

export const WalletDuplicatedModal = {
  Content: WalletDuplicatedModalContent,
  Footer: WalletDuplicatedModalFooter,
}
