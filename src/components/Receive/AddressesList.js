// @flow

import React from 'react'
import {withTranslations} from '../../utils/renderUtils'
import {compose} from 'redux'
import {View, FlatList} from 'react-native'

import AddressView from './AddressView'

import styles from './styles/AddressesList.style'

import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.AddressesList

const _keyExtractor = ({address}) => address
const _renderItem = ({item}) => (
  <View style={styles.container}>
    <AddressView {...item} />
  </View>
)

const AddressesList = ({addresses, showFresh, translations}) => {
  const shownAddresses = showFresh
    ? addresses.filter((x) => !x.isUsed)
    : addresses.filter((x) => x.isUsed)
  // We want newest first
  shownAddresses.reverse()

  return (
    <FlatList
      data={shownAddresses}
      keyExtractor={_keyExtractor}
      renderItem={_renderItem}
    />
  )
}

type ExternalProps = {
  addresses: Array<{address: string, index: number, isUsed: boolean}>,
  showFresh?: boolean,
}

export default (compose(withTranslations(getTranslations))(
  AddressesList,
): ComponentType<ExternalProps>)
