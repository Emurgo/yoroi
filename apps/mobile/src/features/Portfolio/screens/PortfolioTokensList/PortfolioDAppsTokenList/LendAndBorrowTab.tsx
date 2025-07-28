import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {Space} from '~/components/Space/Space'
import {useStrings} from '~/../../common/hooks/useStrings'
import {TokenEmptyList} from '~/ui/TokenEmptyList/TokenEmptyList'

export const LendAndBorrowTab = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_1]}>
      <Space height={16} />

      <TokenEmptyList emptyText={strings.availableSoon} />
    </View>
  )
}
