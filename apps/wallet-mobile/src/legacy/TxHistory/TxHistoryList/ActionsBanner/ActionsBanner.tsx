import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../../components'
import {features} from '../../../../features'
import {LockedDeposit} from '../../LockedDeposit'

type Props = {
  onExport: () => void
  onSearch: () => void
}

export const ActionsBanner = (props: Props) => {
  const {styles, colors} = useStyles()

  const {onExport, onSearch} = props
  return (
    <View style={styles.actionsRoot}>
      {features.txHistory.export && (
        <TouchableOpacity onPress={onExport}>
          <Icon.Export size={24} color={colors.iconColor} />
        </TouchableOpacity>
      )}

      <LockedDeposit />

      {features.txHistory.search && (
        <TouchableOpacity onPress={onSearch}>
          <Icon.Magnify size={24} color={colors.iconColor} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    actionsRoot: {
      display: 'flex',
      ...atoms.px_lg,
      ...atoms.pb_2xs,
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
    },
  })
  const colors = {
    iconColor: color.primary_c500,
  }
  return {styles, colors}
}
