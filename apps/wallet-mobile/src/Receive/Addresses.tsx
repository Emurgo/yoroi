import {fromPairs} from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, TouchableOpacityProps, View, ViewProps} from 'react-native'

import {CopyButton, Icon, Spacer, Text} from '../components'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {isEmptyString} from '../utils/utils'
import {useReceiveAddresses} from '../yoroi-wallets/hooks'
import AddressModal from './AddressModal'

export const UnusedAddresses = () => {
  const strings = useStrings()
  const addresses = useAddresses()
  const [address, setAddress] = React.useState<string | null>(null)

  return (
    <View>
      <Header>
        <Text style={styles.heading}>{strings.unusedAddresses}</Text>

        <Text style={styles.heading}>{strings.verifyAddress}</Text>
      </Header>

      {addresses.unused.map((address, index) => (
        <React.Fragment key={address}>
          <UnusedAddress address={address} onPress={() => setAddress(address)} />

          {index !== addresses.unused.length - 1 && <Spacer height={16} />}
        </React.Fragment>
      ))}

      {!isEmptyString(address) && <AddressModal address={address} onRequestClose={() => setAddress(null)} visible />}
    </View>
  )
}

export const UsedAddresses = () => {
  const strings = useStrings()
  const addresses = useAddresses()
  const [address, setAddress] = React.useState<string | null>(null)

  return (
    <View>
      <Header>
        <Text style={styles.heading}>{strings.usedAddresses}</Text>
      </Header>

      {addresses.used.map((address, index) => (
        <React.Fragment key={address}>
          <UsedAddress address={address} onPress={() => setAddress(address)} />

          {index !== addresses.used.length - 1 && <Spacer height={16} />}
        </React.Fragment>
      ))}

      {!isEmptyString(address) && <AddressModal address={address} onRequestClose={() => setAddress(null)} visible />}
    </View>
  )
}

const UsedAddress = ({address, onPress}: {address: string; onPress: () => void}) => {
  const index = useAddressIndex(address)

  return (
    <Row testID="usedAddress">
      <Address>
        <Text secondary small bold>{`/${index}`}</Text>

        <Spacer width={8} />

        <Text style={{flex: 1}} secondary small numberOfLines={1} ellipsizeMode="middle" monospace testID="addressText">
          {address}
        </Text>
      </Address>

      <Actions>
        <CopyButton value={address} />

        <VerifyButton onPress={() => onPress()} />
      </Actions>
    </Row>
  )
}

const UnusedAddress = ({address, onPress}: {address: string; onPress: () => void}) => {
  const index = useAddressIndex(address)

  return (
    <Row testID="unusedAddress">
      <Address>
        <Text small bold>{`/${index}`}</Text>

        <Spacer width={8} />

        <Text style={{flex: 1}} small numberOfLines={1} ellipsizeMode="middle" monospace testID="addressText">
          {address}
        </Text>
      </Address>

      <Actions>
        <CopyButton value={address} />

        <VerifyButton onPress={() => onPress()} />
      </Actions>
    </Row>
  )
}

const Header = (props: ViewProps) => <View {...props} style={styles.header} />
const Row = (props: ViewProps) => <View {...props} style={styles.row} />
const Address = (props: ViewProps) => <View {...props} style={styles.address} />
const Actions = (props: ViewProps) => <View {...props} style={styles.actions} />
const VerifyButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props} testID="verifyAddressButton">
    <Icon.Verify size={20} color={COLORS.GRAY} />
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 10,
    shadowOpacity: 0.08,
    shadowColor: '#181a1e',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  address: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    flex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  heading: {
    fontWeight: 'bold',
  },
})

const messages = defineMessages({
  unusedAddresses: {
    id: 'components.receive.receivescreen.unusedAddresses',
    defaultMessage: '!!!Unused addresses',
  },
  usedAddresses: {
    id: 'components.receive.receivescreen.usedAddresses',
    defaultMessage: '!!!Used addresses',
  },
  verifyAddress: {
    id: 'components.receive.receivescreen.verifyAddress',
    defaultMessage: '!!!Verify address',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    unusedAddresses: intl.formatMessage(messages.unusedAddresses),
    usedAddresses: intl.formatMessage(messages.usedAddresses),
    verifyAddress: intl.formatMessage(messages.verifyAddress),
  }
}

const useAddressIndex = (address: string) => {
  const wallet = useSelectedWallet()
  const index = fromPairs(wallet.externalAddresses.map((addr, i) => [addr, i]))[address]

  return index
}

type Addresses = {
  used: string[]
  unused: string[]
}

export const useAddresses = (): Addresses => {
  const wallet = useSelectedWallet()
  const receiveAddresses = useReceiveAddresses(wallet)
  const isUsedAddressIndex = wallet.isUsedAddressIndex

  return receiveAddresses.reduce(
    (addresses, address) => {
      isUsedAddressIndex[address]
        ? (addresses.used = [...addresses.used, address])
        : (addresses.unused = [...addresses.unused, address])
      return addresses
    },
    {used: [], unused: []} as Addresses,
  )
}
