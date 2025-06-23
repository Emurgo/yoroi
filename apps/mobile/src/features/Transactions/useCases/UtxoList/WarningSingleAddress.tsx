import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useStrings} from '../../common/strings'

export const WarningSingleAddress = () => {
  const {styles, color} = useStyles()
  const strings = useStrings()
  const {navigateToUtxoConsolidation} = useWalletNavigation()

  return (
    <View style={styles.notice}>
      <Icon.Warning size={20} color={color.sys_magenta_500} />

      <Text style={styles.text}>
        <Text>{strings.organizeWalletDescription}</Text>
      </Text>

      <Button
        type={ButtonType.Critical}
        title={strings.organizeWallet}
        size="S"
        onPress={navigateToUtxoConsolidation}
      />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    notice: {
      ...atoms.p_lg,
      ...atoms.gap_md,
      ...atoms.rounded_sm,
      backgroundColor: color.sys_magenta_100,
    },
    text: {
      color: color.gray_max,
      ...atoms.body_2_md_regular,
    },
  })

  return {styles, color}
}
