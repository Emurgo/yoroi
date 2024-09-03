import {Blockies} from '@yoroi/identicon'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Icon} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../useStrings'

export const WalletDuplicatedModal = ({publicKeyHex}: {publicKeyHex: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  const {resetToTxHistory} = useWalletNavigation()
  const {walletManager} = useWalletManager()
  const plate = walletManager.getWalletPlate(publicKeyHex)
  const walletDuplicatedMeta = Array.from(walletManager.walletMetas.values()).find(
    (walletMeta) => walletMeta.plate === plate.TextPart,
  )

  if (!walletDuplicatedMeta) throw new Error('Wallet Duplicated Modal: invalid state')

  const handleOpenWalletWithDuplicatedName = React.useCallback(() => {
    walletManager.setSelectedWalletId(walletDuplicatedMeta.id)
    resetToTxHistory()
  }, [walletManager, walletDuplicatedMeta.id, resetToTxHistory])

  return (
    <View style={styles.modal}>
      <Text style={styles.modalText}>{strings.restoreDuplicatedWalletModalText}</Text>

      <Space height="lg" />

      <View style={styles.checksum}>
        <Icon.WalletAvatar
          image={new Blockies({seed: plate.ImagePart}).asBase64()}
          style={styles.walletChecksum}
          size={38}
        />

        <Space width="sm" />

        <View>
          <Text style={styles.plateName}>{walletDuplicatedMeta.name}</Text>

          <Text style={styles.plateText}>{plate.TextPart}</Text>
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
      color: color.gray_900,
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
      color: color.gray_900,
    },
  })
  return {styles} as const
}
