import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '../../../common/useStrings'

type Props = {
  total: number
}
export const CountDAppsConnected = ({total}: Props) => {
  const {atoms: a, palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View>
      <Text
        style={[a.body_2_md_regular, {color: p.gray_700}]}
      >{`${strings.totalDAppConnected(total)}`}</Text>
    </View>
  )
}
