// @flow

import Clipboard from '@react-native-community/clipboard'
import React, {useEffect, useState} from 'react'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import {type ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes'

import copiedIcon from '../../assets/img/icon/copied.png'
import copyIcon from '../../assets/img/icon/copy-ext.png'
import verifyIcon from '../../assets/img/icon/verify-address.png'
import {Text} from '../UiKit'

type Props = {|
  isUsed: boolean,
  index: number,
  address: string,
  onPressDetails: () => mixed,
|}

const AddressView = ({isUsed, index, address, onPressDetails}: Props) => {
  return (
    <Row>
      <Address>
        <Text secondary={isUsed} small bold>{`/${index}`}</Text>
        <Text secondary={isUsed} small numberOfLines={1} ellipsizeMode="middle" monospace style={styles.text}>
          {address}
        </Text>
      </Address>

      <Actions>
        <CopyButton text={address} />
        <VerifyButton onPress={() => onPressDetails()} />
      </Actions>
    </Row>
  )
}

export default AddressView

const Row = (props: ViewProps) => <View {...props} style={styles.container} />
const Address = (props) => <View {...props} style={styles.addressContainer} />
const Actions = (props) => <View {...props} style={styles.actionContainer} />
const CopyButton = ({text}: {text: string}) => {
  const MESSAGE_TIMEOUT = 1000
  const [isCopying, setIsCopying] = useState<boolean>(false)

  useEffect(() => {
    if (isCopying) {
      const timeout = setTimeout(() => {
        clearTimeout(timeout)
        Clipboard.setString(text)
        setIsCopying(false)
      }, MESSAGE_TIMEOUT)
    }
  }, [isCopying, setIsCopying, text])

  return (
    <TouchableOpacity onPress={() => setIsCopying(true)} disabled={isCopying}>
      <Image source={isCopying ? copiedIcon : copyIcon} />
    </TouchableOpacity>
  )
}
const VerifyButton = (props) => (
  <TouchableOpacity {...props}>
    <Image source={verifyIcon} />
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
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
  addressContainer: {
    flexDirection: 'row',
    flex: 4,
    alignItems: 'center',
  },
  text: {
    paddingLeft: 5,
  },
  actionContainer: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
})
