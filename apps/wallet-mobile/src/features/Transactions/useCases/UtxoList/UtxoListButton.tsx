import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useWalletNavigation} from '../../../../kernel/navigation'

export const UtxoListButton = () => {
  const {styles} = useStyles()
  const {navigateToUtxoList} = useWalletNavigation()
  return (
    <View style={styles.corner}>
      <Button type={ButtonType.SecondaryText} icon={Icon.Burger} onPress={navigateToUtxoList} />
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()

  const styles = StyleSheet.create({
    corner: {
      ...atoms.absolute,
      ...atoms.p_lg,
      top: 0,
      right: 0,
      ...atoms.z_50,
    },
  })

  return {styles}
}
