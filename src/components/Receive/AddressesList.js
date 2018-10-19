// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import {Text} from '../UiKit'
import AddressView from './AddressView'

import styles from './styles/AddressesList.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.receiveScreen

type Props = {
  addresses: Array<string>,
  addressesUsed: Array<string>,
  showAll: boolean,
  translation: SubTranslation<typeof getTranslation>,
}

const AddressesList = ({addresses, addressesUsed, showAll, translation}: Props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.addressLabel}>{translations.walletAddresses}</Text>
    </View>

    {addressesUsed.map((address) => (
      <View key={address} style={styles.addressContainer}>
        <AddressView address={address} isUsed />
      </View>
    ))}

    { (showAll) && addresses.map((address) => (
      <View key={address} style={styles.addressContainer}>
        <AddressView address={address} isUsed={false} />
      </View>
    ))}
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
)(AddressesList)
