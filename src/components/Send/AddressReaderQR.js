// @flow

import React from 'react'
import {compose} from 'redux'
import {View} from 'react-native'
import {withHandlers, withState} from 'recompose'
import QRCodeScanner from 'react-native-qrcode-scanner'

import {Text} from '../UiKit'

import styles from './styles/AddressReaderQR.style'

type Props = {
  address: string,
  setAddress: (string) => void,
  onSuccess: (any) => void,
}

const AddressReaderQR = ({address, setAddress, onSuccess}: Props) => (
  <QRCodeScanner
    onRead={onSuccess}
    bottomContent={
      <View style={styles.container}>
        <Text style={styles.qrContent}>{address}</Text>
      </View>
    }
  />
)

export default compose(
  withState('address', 'setAddress', ''),
  withHandlers({
    onSuccess: ({navigation}) => (event) => {
      const onSuccess = navigation.getParam('onSuccess')
      if (onSuccess) {
        onSuccess(event.data)
      }
    },
  }),
)(AddressReaderQR)
