import {addressVisualDerivationPathMaker} from '@yoroi/blockchains'
import {atoms as a, useTheme} from '@yoroi/theme'
import {fromPairs} from 'lodash'
import React from 'react'
import {Text, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import {Copiable} from '../../../../../ui/Copiable/Copiable'
import {Space} from '../../../../../ui/Space/Space'
import {useKeyHashes} from '../../../../../wallets/hooks'
import {useSelectedWallet} from '../../../../WalletManager/hooks/useSelectedWallet'
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
  const {palette: p} = useTheme()
  const {
    meta: {implementation},
  } = useSelectedWallet()

  const derivationPath = path
    ? addressVisualDerivationPathMaker(implementation)(path)
    : null

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <View
        style={[
          a.align_center,
          a.rounded_sm,
          a.p_lg,
          {backgroundColor: p.white_static, alignSelf: 'center'},
        ]}
      >
        <QRCode
          value={address}
          size={140}
          backgroundColor={p.white_static}
          color={p.black_static}
        />
      </View>

      <Space.Width.sm />

      <View>
        <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
          {strings.walletAddress}
        </Text>

        <Copiable title={address} text={address} />

        <Space.Width.sm />

        {derivationPath !== null && (
          <>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.BIP32path}
            </Text>

            <View style={a.flex_row}>
              <Text style={[a.body_1_lg_regular, {flex: 1, color: p.gray_900}]}>
                {derivationPath}
              </Text>
            </View>

            <Space.Width.sm />
          </>
        )}

        {keyHashes?.staking != null && keyHashes.staking !== '' && (
          <>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.staking}
            </Text>

            <Copiable title={keyHashes.staking} text={keyHashes.staking} />

            <Space.Width.sm />
          </>
        )}

        {keyHashes?.spending != null && keyHashes.spending !== '' && (
          <>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.spending}
            </Text>

            <Copiable title={keyHashes.spending} text={keyHashes.spending} />
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
  const externalIndex: number | undefined = fromPairs(
    wallet.externalAddresses.map((addr, i) => [addr, i]),
  )[props.address]
  const internalIndex: number | undefined = fromPairs(
    wallet.internalAddresses.map((addr, i) => [addr, i]),
  )[props.address]

  if (externalIndex !== undefined)
    return (
      <AddressModal
        path={{account: 0, index: externalIndex, role: 0}}
        {...props}
      />
    )
  if (internalIndex !== undefined)
    return (
      <AddressModal
        path={{account: 0, index: internalIndex, role: 1}}
        {...props}
      />
    )

  return <AddressModal {...props} />
}
