export type FungibilityFilter = 'all' | 'ft' | 'nft'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Text} from '../../../../components'
import {useSearch} from '../../../../Search/SearchContext'
import {COLORS} from '../../../../theme'
import {useStrings} from '../strings'

export const Counter = ({counter, customText}: {counter: number; customText?: string}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const strings = useStrings()

  if (!isSearching) {
    return (
      <View style={styles.counter}>
        <Text style={styles.counterText}>{strings.youHave}</Text>

        <Text style={styles.counterTextBold}>{` ${counter} ${customText ?? strings.assets(counter)}`}</Text>
      </View>
    )
  }

  if (isSearching && assetSearchTerm.length > 0) {
    return (
      <View style={styles.counter}>
        <Text style={styles.counterTextBold}>{`${counter} ${customText ?? strings.assets(counter)} `}</Text>

        <Text style={styles.counterText}>{strings.found}</Text>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  counter: {
    paddingTop: 16,
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  counterText: {
    fontWeight: '400',
    color: COLORS.SHELLEY_BLUE,
  },
  counterTextBold: {
    fontWeight: '500',
    color: COLORS.SHELLEY_BLUE,
  },
})
