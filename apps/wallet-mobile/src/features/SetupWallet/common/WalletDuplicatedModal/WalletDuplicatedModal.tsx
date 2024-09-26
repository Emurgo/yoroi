import {Blockies} from '@yoroi/identicon'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../../components/Button/NewButton'
import {Icon} from '../../../../components/Icon'
import {Space} from '../../../../components/Space/Space'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../useStrings'

export const WalletDuplicatedModal = ({
  plate,
  seed,
  duplicatedAccountWalletMetaId,
  duplicatedAccountWalletMetaName,
}: {
  plate: string
  seed: string
  duplicatedAccountWalletMetaId: string
  duplicatedAccountWalletMetaName: string
}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  const {resetToTxHistory} = useWalletNavigation()
  const {walletManager} = useWalletManager()

  const handleOpenWalletWithDuplicatedName = React.useCallback(() => {
    walletManager.setSelectedWalletId(duplicatedAccountWalletMetaId)
    resetToTxHistory()
  }, [walletManager, duplicatedAccountWalletMetaId, resetToTxHistory])

  return (
    <View style={styles.modal}>
      <Text style={styles.modalText}>{strings.restoreDuplicatedWalletModalText}</Text>

      <Space height="lg" />

      <View style={styles.checksum}>
        <Icon.WalletAvatar image={new Blockies({seed}).asBase64()} style={styles.walletChecksum} size={38} />

        <Space width="sm" />

        <View>
          <Text style={styles.plateName}>{duplicatedAccountWalletMetaName}</Text>

          <Text style={styles.plateText}>{plate}</Text>
        </View>
      </View>

      <Space fill />

      <Button
        title={strings.restoreDuplicatedWalletModalButton}
        style={styles.button}
        onPress={handleOpenWalletWithDuplicatedName}
      />

      <Space height="xl" />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    plateName: {
      ...atoms.body_2_md_medium,
      color: color.text_gray_medium,
    },
    modal: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    walletChecksum: {
      width: 38,
      height: 38,
      borderRadius: 8,
    },
    checksum: {
      ...atoms.flex_row,
      ...atoms.align_center,
      textAlignVertical: 'center',
    },
    plateText: {
      ...atoms.body_3_sm_regular,
      ...atoms.text_center,
      ...atoms.justify_center,
      color: color.gray_600,
    },
    button: {
      backgroundColor: color.primary_500,
    },
    modalText: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_low,
    },
  })
  return {styles} as const
}
