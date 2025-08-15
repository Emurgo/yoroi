import {atoms as a} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {TokenEmptyList} from '~/features/Portfolio/ui/TokenEmptyList/TokenEmptyList'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

export const LendAndBorrowTab = () => {
  const strings = useStrings()

  return (
    <View style={[a.flex_1]}>
      <Space.Height.md />

      <TokenEmptyList emptyText={strings.portfolio.availableSoon} />
    </View>
  )
}
