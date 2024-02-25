import {fromPairs} from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View, ViewProps} from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import {CopyButton, Spacer, Text} from '../../../../components'
import {Modal} from '../../../../legacy/Modal'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {AddressType, formatPath} from '../../../../yoroi-wallets/cardano/formatPath/formatPath'
import {useKeyHashes} from '../../../../yoroi-wallets/hooks'

type Path = {
  account: number
  role: number
  index: number
}

type Props = {
  address: string
  onRequestClose: () => void
  visible: boolean
  path?: Path
}

export const AddressModal = ({address, visible, onRequestClose, path}: Props) => {
  const strings = useStrings()
  const keyHashes = useKeyHashes({address})

  return (
    <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
      <Text style={styles.title}>{strings.title.toLocaleUpperCase()}</Text>

      <Spacer width={8} />

      <View style={{alignItems: 'center'}}>
        <QRCode value={address} size={140} backgroundColor="white" color="black" />
      </View>

      <Spacer width={4} />

      <Info>
        <Text style={styles.subtitle}>{strings.walletAddress}</Text>

        <Row>
          <Text style={{flex: 1}} secondary monospace numberOfLines={1} ellipsizeMode="middle">
            {address}
          </Text>

          <Spacer width={16} />

          <CopyButton
            value={address}
            onCopy={() => {
              setTimeout(onRequestClose, 1000)
            }}
          />
        </Row>

        <Spacer width={8} />

        {path && (
          <>
            <PathInfo path={path} />

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
      </Info>
    </Modal>
  )
}

type ExternalProps = {
  address: string
  onRequestClose: () => void
  visible: boolean
}

export default (props: ExternalProps) => {
  const wallet = useSelectedWallet()
  const externalIndex: number | undefined = fromPairs(wallet.internalAddresses.map((addr, i) => [addr, i]))[
    props.address
  ]
  const internalIndex: number | undefined = fromPairs(wallet.internalAddresses.map((addr, i) => [addr, i]))[
    props.address
  ]

  if (externalIndex !== undefined) return <AddressModal path={{account: 0, index: externalIndex, role: 0}} {...props} />
  if (internalIndex !== undefined) return <AddressModal path={{account: 0, index: internalIndex, role: 1}} {...props} />

  return <AddressModal {...props} />
}

type PathInfoProps = {
  path: Path
}
const PathInfo = ({path}: PathInfoProps) => {
  const {account, index, role} = path
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const addressType: AddressType = role === 0 ? 'External' : 'Internal'

  return (
    <>
      <Text style={styles.subtitle}>{strings.BIP32path}</Text>

      <Text secondary monospace>
        {formatPath(account, addressType, index, wallet.walletImplementationId)}
      </Text>
    </>
  )
}
const Info = (props: ViewProps) => <View {...props} style={styles.info} />
const Row = (props: ViewProps) => <View {...props} style={styles.row} />

const styles = StyleSheet.create({
  info: {
    alignItems: 'flex-start',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
})

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
