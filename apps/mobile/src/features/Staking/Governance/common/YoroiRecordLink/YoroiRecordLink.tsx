import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, TouchableOpacity, View} from 'react-native'

import {Button, ButtonType} from '~/ui/Button/Button'
import {Divider} from '~/ui/Divider/Divider'
import {useStrings} from '../strings'

export const YoroiRecordLink = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const onPress = () =>
    Linking.openURL(
      'https://2025budget.intersectmbo.org/voters/drep1ygr9tuapcanc3kpeyy4dc3vmrz9cfe5q7v9wj3x9j0ap3tswtre9j',
    )

  return (
    <TouchableOpacity onPress={onPress}>
      <Divider />

      <View style={[a.pt_md, a.align_start]}>
        <Button
          title={strings.yoroiRecord}
          type={ButtonType.Link}
          onPress={onPress}
        />
      </View>
    </TouchableOpacity>
  )
}
