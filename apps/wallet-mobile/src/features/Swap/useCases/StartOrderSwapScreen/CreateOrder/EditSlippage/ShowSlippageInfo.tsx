import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../../components/Icon'
import {useModal} from '../../../../../../components/Modal/ModalContext'
import {Spacer} from '../../../../../../components/Spacer/Spacer'
import {useStrings} from '../../../../common/strings'

export const ShowSlippageInfo = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
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
        <Icon.Info size={24} color={colors.icon} />
      </TouchableOpacity>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      ...atoms.body_1_lg_regular,
      color: color.gray_600,
    },
    sheetContent: {
      ...atoms.body_1_lg_regular,
      ...atoms.px_lg,
      color: color.gray_900,
    },
  })

  const colors = {
    icon: color.gray_max,
  }

  return {styles, colors}
}
