import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {features} from '../../../../kernel/features'
import {PortfolioDetailsTab, usePortfolio} from '../../common/PortfolioProvider'

const ExportTokenTransactions = () => {
  const {styles, colors} = useStyles()
  const {detailsTab} = usePortfolio()

  if (!features.portfolioExport || detailsTab !== PortfolioDetailsTab.Transactions) return null

  return (
    <TouchableOpacity style={styles.button}>
      <Icon.Export size={32} color={colors.primary} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    button: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
      minHeight: 24,
    },
  })
  const colors = {
    gray: color.gray_800,
    primary: color.primary_500,
  }
  return {styles, colors} as const
}

export default ExportTokenTransactions
