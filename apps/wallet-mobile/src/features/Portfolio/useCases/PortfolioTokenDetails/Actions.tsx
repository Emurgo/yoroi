import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Icon} from '../../../../components'
import {useSwapForm} from '../../../Swap/common/SwapFormProvider'
import {useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'

type Props = {
  tokenInfo: Portfolio.Token.Info
}
export const Actions = ({tokenInfo}: Props) => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const swap = useSwap()
  const swapForm = useSwapForm()

  const handleOnSwap = () => {
    swapForm.resetSwapForm()
    swap.resetState()
    swap.buyTokenInfoChanged(tokenInfo)
    swapForm.buyTouched()
    navigateTo.swap()
  }

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Button
          block
          shelleyTheme
          outlineOnLight
          title={strings.send.toLocaleUpperCase()}
          startContent={<Icon.Send color={colors.primary} size={24} />}
          onPress={navigateTo.send}
        />

        <Button
          block
          shelleyTheme
          title={strings.swap.toLocaleUpperCase()}
          startContent={<Icon.Swap color={colors.white} size={24} />}
          onPress={handleOnSwap}
        />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      borderTopColor: color.gray_c200,
      ...atoms.border_t,
    },
    container: {
      ...atoms.flex_row,
      ...atoms.gap_lg,
      ...atoms.p_lg,
    },
  })

  const colors = {
    white: color.white_static,
    primary: color.primary_c500,
  } as const

  return {styles, colors} as const
}
