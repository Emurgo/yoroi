// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import {Text} from '../UiKit'
import CopyButton from './CopyButton'

import styles from './styles/ReceiveAddressesList.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslation = (state) => state.trans.receiveScreen

type Props = {
  receiveAddresses: Array<string>,
  translation: SubTranslation<typeof getTranslation>,
}

const ReceiveAddressesList = ({receiveAddresses, translation}: Props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.addressLabel}>{translation.walletAddresses}</Text>
    </View>
    {receiveAddresses.map((receiveAddress) => (
      <View key={receiveAddress} style={styles.addressContainer}>
        <View>
          <Text style={styles.address}>{receiveAddress}</Text>
        </View>
        <CopyButton value={receiveAddress} />
      </View>
    ))}
  </View>
)

export default compose(
  connect((state) => ({
    translation: getTranslation(state),
  }))
)(ReceiveAddressesList)
