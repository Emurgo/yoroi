import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {DashboardTokenSkeletonItem} from './DashboardTokenSkeletonItem'

type Props = {
  tokenInfo?: {
    logo: ImageSourcePropType | string
    symbol: string
    name: string
  }
}

export const DashboardTokenItem = ({tokenInfo}: Props) => {
  const {styles} = useStyles()
  const navigationTo = useNavigateTo()

  if (!tokenInfo) return <DashboardTokenSkeletonItem />

  return (
    <TouchableOpacity onPress={() => navigationTo.tokenDetail({id: 'some_id', name: tokenInfo.symbol})}>
      <View style={styles.root}>
        <View style={styles.tokenInfoContainer}>
          <Image
            source={typeof tokenInfo.logo === 'string' ? {uri: tokenInfo.logo} : tokenInfo.logo}
            style={styles.tokenLogo}
          />

          <View>
            <Text style={styles.symbol}>{tokenInfo.symbol}</Text>

            <Text style={styles.name}>{tokenInfo.name}</Text>
          </View>
        </View>

        <Spacer height={16} />

        <View>
          <PnlTag variant="success" withIcon>
            <Text>0.03%</Text>
          </PnlTag>

          <Text style={styles.tokenValue}>2083,33</Text>

          <Text style={styles.usdValue}>2083,33</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.p_lg,
      ...atoms.rounded_sm,
      ...atoms.flex_col,
      ...atoms.align_start,
      ...atoms.border,
      borderColor: color.gray_c300,
      width: 164,
    },
    symbol: {
      ...atoms.body_2_md_medium,
      ...atoms.font_semibold,
      textTransform: 'uppercase',
    },
    name: {
      ...atoms.body_3_sm_regular,
      color: color.gray_c600,
    },
    tokenValue: {
      ...atoms.heading_4_medium,
      ...atoms.font_semibold,
    },
    usdValue: {
      ...atoms.body_3_sm_regular,
      color: color.gray_c600,
    },
    tokenInfoContainer: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
    },
    tokenLogo: {
      width: 40,
      height: 40,
      resizeMode: 'cover',
    },
  })

  return {styles} as const
}
