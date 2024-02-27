import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer, useModal} from '../../../../../../components'
import {useStrings} from '../../../../common/strings'

export const ShowSlippageInfo = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {openModal} = useModal()

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{strings.slippageTolerance}</Text>

      <Spacer width={4} />

      <TouchableOpacity
        onPress={() => {
          openModal(strings.slippageTolerance, <Text style={styles.sheetContent}>{strings.slippageToleranceInfo}</Text>)
        }}
      >
        <Icon.Info size={24} />
      </TouchableOpacity>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      ...typography['body-1-l-regular'],
      color: color.gray[600],
    },
    sheetContent: {
      ...typography['body-1-l-regular'],
      color: color.gray[900],
    },
  })

  return styles
}
