import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'

type Props = {
  total: number
}
export const CountDAppsAvailable = ({total}: Props) => {
  const {atoms: a, palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.px_lg]}>
      <Text
        style={[a.body_2_md_regular, {color: p.gray_700}]}
      >{`${strings.totalDAppAvailable(total)}`}</Text>
    </View>
  )
}
