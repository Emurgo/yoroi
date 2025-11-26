import {addressVisualDerivationPathMaker} from '@yoroi/blockchains'
import {atoms as a, useTheme} from '@yoroi/theme'

import {fromPairs} from 'lodash'
import * as React from 'react'
import {Linking, Text, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {isEmptyString} from '~/kernel/utils'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {
  getSpendingKey,
  getStakingKey,
} from '~/wallets/cardano/addressInfo/addressInfo'

type Path = {
  account: number
  role: number
  index: number
}

type Props = {
  address: string
  path?: Path
}

export const AddressContent = ({address, path}: Props) => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const {
    meta: {implementation},
  } = useSelectedWallet()

  const derivationPath = path
    ? addressVisualDerivationPathMaker(implementation)(path)
    : null

  const staking = getStakingKey(address)
  const spending = getSpendingKey(address)

  return (
    <View style={[a.flex_1, a.gap_lg]}>
      <View
        style={[
          a.align_center,
          a.rounded_sm,
          a.p_lg,
          a.self_center,
          a.bg_white_static,
        ]}
      >
        <QRCode
          value={address}
          size={140}
          backgroundColor={p.white_static}
          color={p.black_static}
        />
      </View>

      <View style={[a.gap_sm]}>
        <View>
          <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
            {strings.transactions.walletAddress}
          </Text>

          <Copiable title={address} text={address} />
        </View>

        {derivationPath !== null && (
          <View>
            <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
              {strings.transactions.BIP32path}
            </Text>

            <View style={a.flex_row}>
              <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
                {derivationPath}
              </Text>
            </View>
          </View>
        )}

        {!isEmptyString(staking) && (
          <View>
            <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
              {strings.transactions.staking}
            </Text>

            <Copiable title={staking} text={staking} />
          </View>
        )}

        {!isEmptyString(spending) && (
          <View>
            <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
              {strings.transactions.spending}
            </Text>

            <Copiable title={spending} text={spending} />
          </View>
        )}
      </View>
    </View>
  )
}

export const AddressModal = ({address, path}: Props) => {
  return (
    <Modal.Content>
      <AddressContent address={address} path={path} />
    </Modal.Content>
  )
}

export const AddressFooter = ({address}: {address: string}) => {
  const {wallet} = useSelectedWallet()
  const explorers = wallet.networkManager.explorers

  return (
    <View style={[a.flex_row, a.gap_lg, a.justify_center]}>
      <Button
        type={ButtonType.Secondary}
        onPress={() => Linking.openURL(explorers.cardanoscan.address(address))}
        title="Cardanoscan"
      />
      <Button
        type={ButtonType.Secondary}
        onPress={() => Linking.openURL(explorers.cexplorer.address(address))}
        title="Cexplorer"
      />
    </View>
  )
}

const AddressModalFooter = ({address}: {address: string}) => {
  return (
    <Modal.Footer>
      <AddressFooter address={address} />
    </Modal.Footer>
  )
}

export {AddressModalFooter}

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

  if (externalIndex)
    return (
      <AddressModal
        path={{account: 0, index: externalIndex, role: 0}}
        {...props}
      />
    )
  if (internalIndex)
    return (
      <AddressModal
        path={{account: 0, index: internalIndex, role: 1}}
        {...props}
      />
    )

  return <AddressModal {...props} />
}
