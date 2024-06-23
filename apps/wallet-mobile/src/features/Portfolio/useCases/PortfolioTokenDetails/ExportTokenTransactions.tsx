import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {usePortfolioTokenDetailContext} from '../../common/PortfolioTokenDetailContext'

const ExportTokenTransactions = () => {
  const {styles, colors} = useStyles()
  const {activeTab} = usePortfolioTokenDetailContext()

  if (activeTab !== 'transactions') return null
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
    gray: color.gray_c800,
    primary: color.primary_c500,
  }
  return {styles, colors} as const
}

export default ExportTokenTransactions
