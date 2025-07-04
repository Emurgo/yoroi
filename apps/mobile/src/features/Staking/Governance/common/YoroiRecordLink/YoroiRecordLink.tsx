import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Button, ButtonType} from '../../../../../components/Button/Button'
import {Divider} from '../../../../../components/Divider/Divider'
import {useStrings} from '../strings'

export const YoroiRecordLink = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const onPress = () =>
    Linking.openURL(
      'https://2025budget.intersectmbo.org/voters/drep1ygr9tuapcanc3kpeyy4dc3vmrz9cfe5q7v9wj3x9j0ap3tswtre9j',
    )

  return (
    <TouchableOpacity onPress={onPress}>
      <Divider />

      <View style={styles.footer}>
        <Button
          title={strings.yoroiRecord}
          type={ButtonType.Link}
          onPress={onPress}
        />
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    footer: {
      ...atoms.pt_md,
      ...atoms.align_start,
    },
  })

  return {styles}
}
