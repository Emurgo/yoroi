import {Blockies} from '@yoroi/identicon'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'

export const WalletDuplicatedModal = ({
  plate,
  seed,
  duplicatedAccountWalletMetaName,
}: {
  plate: string
  seed: string
  duplicatedAccountWalletMetaName: string
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <Text style={[a.body_1_lg_regular, {color: p.text_gray_low}]}>
        {strings.setupWallet.restoreDuplicatedWalletModalText}
      </Text>

      <Space.Height.lg />

      <View style={[a.flex_row, a.align_center, a.gap_md]}>
        <Icon.WalletAvatar
          image={new Blockies({seed}).asBase64()}
          size={38}
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
          }}
        />

        <View style={[a.flex_1]}>
          <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
            {duplicatedAccountWalletMetaName}
          </Text>

          <Space.Height.xs />

          <Text style={[a.body_3_sm_regular, {color: p.gray_600}]}>
            {plate}
          </Text>
        </View>
      </View>

      <Space.Height.lg fill />
    </View>
  )
}

export const WalletDuplicatedModalActions = ({
  duplicatedAccountWalletMetaId,
}: {
  duplicatedAccountWalletMetaId: string
}) => {
  const {walletManager} = useWalletManager()
  const {palette: p} = useTheme()
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
    <Button
      title={strings.setupWallet.restoreDuplicatedWalletModalButton}
      onPress={handleOpenWalletWithDuplicatedName}
      style={{backgroundColor: p.primary_500}}
    />
  )
}
