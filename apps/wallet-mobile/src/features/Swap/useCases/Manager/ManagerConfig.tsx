import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {useSwap} from '../../common/SwapProvider'

export const ManagerConfig = () => {
  const {styles} = useStyles()
  const swapForm = useSwap()
  const [aggregator, setAggregator] = React.useState(swapForm.managerConfig.aggregatorSelected)

  const assign = (a: Swap.ManagerConfig['aggregatorSelected']) => {
    setAggregator(a)
    swapForm.assignManagerConfig({...swapForm.managerConfig, aggregatorSelected: a})
  }

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Adapter:</Text>

      <View style={styles.group}>
        <View>
          <Button
            onPress={() => assign('auto')}
            type={ButtonType.SecondaryText}
            title="Auto"
            size="S"
            {...(aggregator === 'auto' && {style: styles.activeButton})}
          />
        </View>

        <View>
          <Button
            onPress={() => assign('dexhunter')}
            type={ButtonType.SecondaryText}
            title="Dexhunter"
            size="S"
            {...(aggregator === 'dexhunter' && {style: styles.activeButton})}
          />
        </View>

        <View>
          <Button
            onPress={() => assign('muesliswap')}
            type={ButtonType.SecondaryText}
            title="Muesliswap"
            size="S"
            {...(aggregator === 'muesliswap' && {style: styles.activeButton})}
          />
        </View>
      </View>

      <Text style={styles.warn}>
        Manager is only for developer mode, allows to pick which dex aggregator is used. Auto uses both at the same time
        and gets the best result for swap estimates, the merged list for order history, merged list for tokens.
      </Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.p_lg,
      ...atoms.gap_lg,
      backgroundColor: color.bg_color_max,
    },
    group: {
      ...atoms.flex_row,
      ...atoms.gap_md,
    },
    heading: {
      ...atoms.body_2_md_medium,
      color: color.text_gray_medium,
    },
    activeButton: {
      backgroundColor: color.el_gray_min,
    },
    warn: {
      ...atoms.body_2_md_regular,
      color: color.text_warning,
    },
  })
  return {styles, color}
}
