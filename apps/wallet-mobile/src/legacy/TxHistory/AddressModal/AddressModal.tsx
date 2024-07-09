import {useTheme} from '@yoroi/theme'
import {fromPairs} from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import {CopyButton, Spacer, Text, useModal} from '../../../components'
import {ScrollView} from '../../../components/ScrollView/ScrollView'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import {derivationPathManagerMaker} from '../../../yoroi-wallets/cardano/derivation-path-manager/derivation-path-manager'
import {useKeyHashes} from '../../../yoroi-wallets/hooks'

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
  const {styles} = useStyles()
  const {closeModal} = useModal()
  const {
    meta: {implementation},
  } = useSelectedWallet()

  return (
    <ScrollView style={styles.scroll}>
      <Text style={styles.title}>{strings.title.toLocaleUpperCase()}</Text>

      <Spacer width={8} />

      <View style={styles.qrCode}>
        <QRCode value={address} size={140} backgroundColor="white" color="black" />
      </View>

      <Spacer width={4} />

      <View style={styles.info}>
        <Text style={styles.subtitle}>{strings.walletAddress}</Text>

        <View style={styles.row}>
          <Text style={{flex: 1}} secondary monospace numberOfLines={1} ellipsizeMode="middle">
            {address}
          </Text>

          <Spacer width={16} />

          <CopyButton
            value={address}
            onCopy={() => {
              setTimeout(closeModal, 1000)
            }}
          />
        </View>

        <Spacer width={8} />

        {path && (
          <>
            <Text style={styles.subtitle}>{strings.BIP32path}</Text>

            <Text secondary monospace>
              {derivationPathManagerMaker(implementation)(path)}
            </Text>

            <Spacer width={8} />
          </>
        )}

        <Text style={styles.subtitle}>{strings.staking}</Text>

        <Text secondary monospace>
          {keyHashes?.staking}
        </Text>

        <Spacer width={8} />

        <Text style={styles.subtitle}>{strings.spending}</Text>

        <Text secondary monospace>
          {keyHashes?.spending}
        </Text>
      </View>
    </ScrollView>
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
      width: '100%',
      ...atoms.px_lg,
    },
    qrCode: {
      display: 'flex',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: color.white_static,
      borderRadius: 8,
      ...atoms.p_lg,
    },
    info: {
      alignItems: 'flex-start',
      ...atoms.body_1_lg_regular,
    },
    title: {
      textAlign: 'center',
      ...atoms.body_1_lg_regular,
    },
    subtitle: {
      textAlign: 'center',
      ...atoms.body_1_lg_regular,
    },
    row: {
      flexDirection: 'row',
    },
  })
  return {styles}
}

const messages = defineMessages({
  walletAddress: {
    id: 'components.receive.addressmodal.walletAddress',
    defaultMessage: '!!!Your wallet address',
  },
  BIP32path: {
    id: 'components.receive.addressmodal.BIP32path',
    defaultMessage: '!!!BIP32 path:',
  },
  copyLabel: {
    id: 'components.receive.addressmodal.copyLabel',
    defaultMessage: '!!!Copy address',
  },
  spending: {
    id: 'components.receive.addressmodal.spendingKeyHash',
    defaultMessage: '!!!Spending',
  },
  staking: {
    id: 'components.receive.addressmodal.stakingKeyHash',
    defaultMessage: '!!!Staking',
  },
  title: {
    id: 'components.receive.addressmodal.title',
    defaultMessage: '!!!Title',
  },
  verifyLabel: {
    id: 'components.receive.addressverifymodal.title',
    defaultMessage: '!!!Verify Address on Ledger',
  },
})
const useStrings = () => {
  const intl = useIntl()

  return {
    walletAddress: intl.formatMessage(messages.walletAddress),
    BIP32path: intl.formatMessage(messages.BIP32path),
    copyLabel: intl.formatMessage(messages.copyLabel),
    spending: intl.formatMessage(messages.spending),
    staking: intl.formatMessage(messages.staking),
    title: intl.formatMessage(messages.title),
    verifyLabel: intl.formatMessage(messages.verifyLabel),
  }
}
