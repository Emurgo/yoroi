// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import {withHandlers, withState} from 'recompose'
import QRCodeScanner from 'react-native-qrcode-scanner'

import {Text} from '../UiKit'
import type {SubTranslation} from '../../l10n/typeHelpers'

import styles from './styles/AddressReaderQR.style'

const getTranslation = (state) => state.trans.qrCodeReader

type Props = {
  translation: SubTranslation<typeof getTranslation>,
  address: string,
  setAddress: (string) => void,
  onSuccess: (any) => void,
}

const AddressReaderQR = ({translation, address, setAddress, onSuccess}: Props) => (
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
  connect((state) => ({
    translation: getTranslation(state),
  })),
  withState('address', 'setAddress', ''),
  withHandlers({
    onSuccess: ({setAddress}) => (event) => setAddress(event.data),
  })
)(AddressReaderQR)
