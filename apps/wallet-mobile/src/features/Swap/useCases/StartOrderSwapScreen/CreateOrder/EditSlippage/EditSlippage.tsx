import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer} from '../../../../../../components'
import {useNavigateTo} from '../../../../common/navigation'
import {ShowSlippageInfo} from './ShowSlippageInfo'

export const EditSlippage = () => {
  const navigate = useNavigateTo()
  const {styles, colors} = useStyles()
  const {orderData} = useSwap()

  return (
    <View style={styles.container}>
      <ShowSlippageInfo />

      <View style={styles.row}>
        <Text style={styles.text}>{`${orderData.slippage}%`}</Text>

        <Spacer width={4} />

        <TouchableOpacity onPress={() => navigate.editSlippage()}>
          <Icon.Edit size={24} color={colors.gray} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      fontSize: 16,
      fontFamily: 'Rubik',
      color: color.gray_max,
    },
  })

  const colors = {
    gray: color.gray_max,
  }
  return {styles, colors}
}
