import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {useSwap} from '../../common/SwapProvider'

export const ManagerConfig = () => {
    const {styles} = useStyles()
    const swapForm = useSwap()
    const [adapter, setAdapter] = React.useState(swapForm.managerConfig.adapter)

    const assign = (a: Swap.ManagerConfig['adapter']) => {
        setAdapter(a)
        swapForm.assignManagerConfig({...swapForm.managerConfig, adapter: a})
    }
    
      return (
        <View style={styles.root}>
          <View style={styles.group}>
            <View>
              <Button
                onPress={() => assign('auto')}
                type={ButtonType.SecondaryText}
                title="Auto"
                size="S"
                {...(adapter === 'auto' && {style: styles.activeButton})}
              />
            </View>
    
            <View>
              <Button
                onPress={() => assign('dexhunter')}
                type={ButtonType.SecondaryText}
                title="Dexhunter"
                size="S"
                {...(adapter === 'dexhunter' && {style: styles.activeButton})}
              />
            </View>

            <View>
              <Button
                onPress={() => assign('muesliswap')}
                type={ButtonType.SecondaryText}
                title="Muesliswap"
                size="S"
                {...(adapter === 'muesliswap' && {style: styles.activeButton})}
              />
            </View>
          </View>
          </View>
          )
          
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    group: {
      ...atoms.flex_row,
      ...atoms.gap_md,
      ...atoms.justify_center,
    },
    root: {
      ...atoms.flex_1,
      ...atoms.p_lg,
      ...atoms.gap_lg,
      backgroundColor: color.bg_color_max,
    },
    activeButton: {
      backgroundColor: color.el_gray_min,
    },

  })
  return {styles, color}
}