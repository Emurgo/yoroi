// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import {Text} from '../UiKit'
import AddressView from './AddressView'

import styles from './styles/AddressesList.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslation = (state) => state.trans.receiveScreen

type Props = {
  addresses: Array<string>,
  translation: SubTranslation<typeof getTranslation>,
}

const AddressesList = ({addresses, translation}: Props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.addressLabel}>{translation.walletAddresses}</Text>
    </View>
    {addresses.map((address) => (
      <View key={address} style={styles.addressContainer}>
        <AddressView address={address} />
      </View>
    ))}
  </View>
)

export default compose(
  connect((state) => ({
    translation: getTranslation(state),
  }))
)(AddressesList)
