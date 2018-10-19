// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import {Text} from '../UiKit'
import AddressDetail from './AddressDetail'
import AddressesList from './AddressesList'

import styles from './styles/ReceiveScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslation = (state) => state.trans.receiveScreen.description

type Props = {
  receiveAddresses: Array<string>,
  translation: SubTranslation<typeof getTranslation>,
}

const ReceiveScreen = ({receiveAddresses, translation}: Props) => (
  <View style={styles.root}>
    <Screen scroll>
      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>{translation.line1}</Text>
        <Text style={styles.warningText}>{translation.line2}</Text>
        <Text style={styles.warningText}>{translation.line3}</Text>
      </View>
      <AddressDetail address={receiveAddresses[0]} />
      <AddressesList addresses={receiveAddresses} />
    </Screen>
  </View>
)

export default compose(
  connect((state) => ({
    receiveAddresses: state.receiveAddresses,
    translation: getTranslation(state),
  }))
)(ReceiveScreen)
