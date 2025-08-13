import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'

type Props = {
  total: number
}
export const CountDAppsConnected = ({total}: Props) => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View>
      <Text
        style={[a.body_2_md_regular, ta.text_gray_medium]}
      >{`${strings.discover.totalDAppConnected(total)}`}</Text>
    </View>
  )
}
