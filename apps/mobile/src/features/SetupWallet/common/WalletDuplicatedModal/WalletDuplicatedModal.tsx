import {Blockies} from '@yoroi/identicon'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Alert, Platform, Text, View} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {useStrings} from '../useStrings'

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
        {strings.restoreDuplicatedWalletModalText}
      </Text>

      <Space.Height.lg />

      <View style={[a.flex_row, a.align_center]}>
        <Icon.WalletAvatar
          image={new Blockies({seed}).asBase64()}
          size={38}
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            position: 'absolute',
            top: Platform.OS === 'ios' ? -22 : -18,
          }}
        />

        <Space.Height.sm />

        <View>
          <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
            {duplicatedAccountWalletMetaName}
          </Text>

          <Text
            style={[
              a.body_3_sm_regular,
              a.text_center,
              a.justify_center,
              {color: p.gray_600},
            ]}
          >
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

  const handleOpenWalletWithDuplicatedName = React.useCallback(() => {
    walletManager.setSelectedWalletId(duplicatedAccountWalletMetaId)
    Alert.alert('duplicated wallet')
    // resetToTxHistory()
  }, [walletManager, duplicatedAccountWalletMetaId])

  return (
    <Button
      title={strings.restoreDuplicatedWalletModalButton}
      onPress={handleOpenWalletWithDuplicatedName}
      style={{backgroundColor: p.primary_500}}
    />
  )
}
