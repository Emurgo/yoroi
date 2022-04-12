import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import verifyIcon from '../assets/img/icon/verify-address.png'
import {CopyButton, Spacer, Text} from '../components'
import {externalAddressIndexSelector, isUsedAddressIndexSelector, receiveAddressesSelector} from '../legacy/selectors'
import {Modals} from './Modals'

export const UnusedAddresses = () => {
  const strings = useStrings()
  const addresses = useUnusedAddresses()
  const [address, setAddress] = React.useState<string | void>()

  return (
    <View>
      <Header>
        <Text style={styles.heading}>{strings.unusedAddresses}</Text>
        <Text style={styles.heading}>{strings.verifyAddress}</Text>
      </Header>

      {addresses.map((address, index) => (
        <>
          <UnusedAddress key={address} address={address} onPress={() => setAddress(address)} />
          {index !== addresses.length - 1 && <Spacer height={16} />}
        </>
      ))}

      {address && <Modals address={address} onDone={() => setAddress()} />}
    </View>
  )
}

export const UsedAddresses = () => {
  const strings = useStrings()
  const addresses = useUsedAddresses()
  const [address, setAddress] = React.useState<string | void>()

  return (
    <View>
      <Header>
        <Text style={styles.heading}>{strings.usedAddresses}</Text>
      </Header>

      {addresses.map((address, index) => (
        <>
          <UsedAddress key={address} address={address} onPress={() => setAddress(address)} />
          {index !== addresses.length - 1 && <Spacer height={16} />}
        </>
      ))}

      {address && <Modals address={address} onDone={() => setAddress()} />}
    </View>
  )
}

const UsedAddress = ({address, onPress}: {address: string; onPress: () => void}) => {
  const index = useAddressIndex(address)

  return (
    <Row>
      <Address>
        <Text secondary small bold>{`/${index}`}</Text>

        <Spacer width={8} />

        <Text style={{flex: 1}} secondary small numberOfLines={1} ellipsizeMode="middle" monospace>
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
    <Row>
      <Address>
        <Text small bold>{`/${index}`}</Text>

        <Spacer width={8} />

        <Text style={{flex: 1}} small numberOfLines={1} ellipsizeMode="middle" monospace>
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

const Header = (props) => <View {...props} style={styles.header} />
const Row = (props) => <View {...props} style={styles.row} />
const Address = (props) => <View {...props} style={styles.address} />
const Actions = (props) => <View {...props} style={styles.actions} />
const VerifyButton = (props) => (
  <TouchableOpacity {...props}>
    <Image source={verifyIcon} />
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
  const index = useSelector(externalAddressIndexSelector)[address]

  return index
}

const useUnusedAddresses = () => {
  const receiveAddresses = useSelector(receiveAddressesSelector)
  const isUsedAddressIndex = useSelector(isUsedAddressIndexSelector)

  return receiveAddresses.filter((address) => !isUsedAddressIndex[address])
}

const useUsedAddresses = () => {
  const receiveAddresses = useSelector(receiveAddressesSelector)
  const isUsedAddressIndex = useSelector(isUsedAddressIndexSelector)

  return receiveAddresses.filter((address) => isUsedAddressIndex[address])
}
