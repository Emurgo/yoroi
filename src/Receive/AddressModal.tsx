import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import {useSelector} from 'react-redux'

import {Button, CopyButton, Modal, Spacer, Text} from '../components'
import {formatPath} from '../legacy/commonUtils'
import {externalAddressIndexSelector, walletMetaSelector} from '../legacy/selectors'
import type {WalletMeta} from '../legacy/state'
import {AddressDTOCardano} from '../yoroi-wallets/cardano/Address.dto'

type Props = {
  address: string
  onRequestClose: () => void
  visible: boolean
  onAddressVerify: () => void
  walletMeta: WalletMeta
  index: number
}

export const AddressModal = ({address, visible, onRequestClose, walletMeta, index, onAddressVerify}: Props) => {
  const strings = useStrings()
  const keyHashes = useKeyHashes(address)

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

        <Text style={styles.subtitle}>{strings.BIP32path}</Text>
        <Text secondary monospace>
          {index != null && formatPath(0, 'External', index, walletMeta.walletImplementationId)}
        </Text>

        <Spacer width={8} />

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

      <Spacer height={16} />

      {walletMeta.isHW && <Button onPress={onAddressVerify} title={strings.verifyLabel} />}
    </Modal>
  )
}

type ExternalProps = {
  address: string
  onRequestClose: () => void
  visible: boolean
  onAddressVerify: () => void
}

export default (props: ExternalProps) => {
  const index = useSelector(externalAddressIndexSelector)[props.address]
  const walletMeta = useSelector(walletMetaSelector)

  return <AddressModal index={index} walletMeta={walletMeta} {...props} />
}

const Info = (props) => <View {...props} style={styles.info} />
const Row = (props) => <View {...props} style={styles.row} />

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

const useKeyHashes = (address) => {
  const [keyHashes, setKeyHashes] = React.useState<null | {staking: string; spending: string}>(null)

  React.useEffect(() => {
    const addressInfo = new AddressDTOCardano(address)
    addressInfo.getKeyHashes().then(setKeyHashes)
  }, [address])

  return keyHashes
}
