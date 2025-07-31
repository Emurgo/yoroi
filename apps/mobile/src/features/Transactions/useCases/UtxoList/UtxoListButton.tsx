import {atoms as a} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {useWalletNavigation} from '~/kernel/navigation/navigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'

export const UtxoListButton = () => {
  const {navigateToUtxoList} = useWalletNavigation()
  return (
    <View style={[a.absolute, a.p_lg, {top: 0, right: 0}, a.z_50]}>
      <Button
        type={ButtonType.SecondaryText}
        icon={Icon.Burger}
        onPress={navigateToUtxoList}
      />
    </View>
  )
}
