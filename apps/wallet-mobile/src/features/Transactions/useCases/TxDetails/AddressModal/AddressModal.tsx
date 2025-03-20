import {addressVisualDerivationPathMaker} from '@yoroi/blockchains'
import {useTheme} from '@yoroi/theme'
import {fromPairs} from 'lodash'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import {CopyButton} from '../../../../../components/CopyButton'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {useKeyHashes} from '../../../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../../common/strings'

type Path = {
  account: number
  role: number
  index: number
}

type Props = {
  address: string
  path?: Path
}

export const AddressModal = ({address, path}: Props) => {
  const strings = useStrings()
  const keyHashes = useKeyHashes({address})
  const {styles, colors} = useStyles()
  const {
    meta: {implementation},
  } = useSelectedWallet()

  const derivationPath = path ? addressVisualDerivationPathMaker(implementation)(path) : null

  return (
    <View style={styles.scroll}>
      <View style={styles.qrCode}>
        <QRCode value={address} size={140} backgroundColor={colors.white} color={colors.black} />
      </View>

      <Spacer width={4} />

      <View>
        <Text style={styles.subtitle}>{strings.walletAddress}</Text>

        <CopyButton title={address} value={address} />

        <Spacer width={8} />

        {derivationPath !== null && (
          <>
            <Text style={styles.subtitle}>{strings.BIP32path}</Text>

            <View style={styles.row}>
              <Text style={styles.address}>{derivationPath}</Text>
            </View>

            <Spacer width={8} />
          </>
        )}

        {keyHashes?.staking != null && keyHashes.staking !== '' && (
          <>
            <Text style={styles.subtitle}>{strings.staking}</Text>

            <CopyButton title={keyHashes.staking} value={keyHashes.staking} />

            <Spacer width={8} />
          </>
        )}

        {keyHashes?.spending != null && keyHashes.spending !== '' && (
          <>
            <Text style={styles.subtitle}>{strings.spending}</Text>

            <CopyButton title={keyHashes.spending} value={keyHashes.spending} />
          </>
        )}
      </View>
    </View>
  )
}

type ExternalProps = {
  address: string
}

export default (props: ExternalProps) => {
  const {wallet} = useSelectedWallet()
  const externalIndex: number | undefined = fromPairs(wallet.externalAddresses.map((addr, i) => [addr, i]))[
    props.address
  ]
  const internalIndex: number | undefined = fromPairs(wallet.internalAddresses.map((addr, i) => [addr, i]))[
    props.address
  ]

  if (externalIndex !== undefined) return <AddressModal path={{account: 0, index: externalIndex, role: 0}} {...props} />
  if (internalIndex !== undefined) return <AddressModal path={{account: 0, index: internalIndex, role: 1}} {...props} />

  return <AddressModal {...props} />
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    scroll: {
      flex: 1,
      ...atoms.px_lg,
    },
    qrCode: {
      ...atoms.align_center,
      ...atoms.rounded_sm,
      ...atoms.p_lg,
      backgroundColor: color.white_static,
      alignSelf: 'center',
    },
    subtitle: {
      ...atoms.body_2_md_regular,
      color: color.gray_600,
    },
    row: {
      ...atoms.flex_row,
    },
    address: {
      flex: 1,
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
  })

  const colors = {
    white: color.white_static,
    black: color.black_static,
    transparent: 'transparent',
    backgroundGradientCard: color.bg_gradient_1,
  }

  return {styles, colors} as const
}
