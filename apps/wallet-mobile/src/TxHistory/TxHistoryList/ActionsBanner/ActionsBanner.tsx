import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components'
import {features} from '../../../features'

type Props = {
  onExport: () => void
  onSearch: () => void
}

export const ActionsBanner = (props: Props) => {
  const {onExport, onSearch} = props
  return (
    <View style={styles.actionsRoot}>
      {features.txHistory.export && (
        <TouchableOpacity onPress={onExport}>
          <Icon.Export size={24} color="#6B7384" />
        </TouchableOpacity>
      )}

      {features.txHistory.search && (
        <TouchableOpacity onPress={onSearch}>
          <Icon.Magnify size={24} color="#6B7384" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  actionsRoot: {
    display: 'flex',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingBottom: 2,
  },
})
