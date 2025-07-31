import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {TokenEmptyList} from '~/features/Portfolio/ui/TokenEmptyList/TokenEmptyList'
import {Space} from '~/ui/Space/Space'

export const LendAndBorrowTab = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_1]}>
      <Space.Height.md />

      <TokenEmptyList emptyText={strings.availableSoon} />
    </View>
  )
}
