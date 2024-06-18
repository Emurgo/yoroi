import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import React from 'react'
import {SectionList, SectionListProps, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {ITokenTransaction} from '../../common/useGetPortfolioTokenTransaction'

interface Props extends SectionListProps<ITokenTransaction> {
  topContent?: React.ReactNode
}

export const PortfolioTokenDetailLayout = ({children, topContent, ...props}: Props) => {
  const {styles} = useStyles()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      {topContent}

      <SectionList bounces scrollEventThrottle={16} style={styles.scrollView} {...props} />

      {children}
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.flex_col,
      backgroundColor: color.gray_cmin,
    },
    scrollView: {
      ...atoms.flex_1,
    },
  })

  return {styles} as const
}
