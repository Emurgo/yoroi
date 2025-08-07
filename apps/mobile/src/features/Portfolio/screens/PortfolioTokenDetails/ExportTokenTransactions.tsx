import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {TouchableOpacity} from 'react-native'

import {
  PortfolioDetailsTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {features} from '~/kernel/features'
import {Icon} from '~/ui/Icon'

const ExportTokenTransactions = () => {
  const {atoms: ta, palette: p} = useTheme()
  const {detailsTab} = usePortfolio()

  if (
    !features.portfolioExport ||
    detailsTab !== PortfolioDetailsTab.Transactions
  )
    return null

  return (
    <TouchableOpacity
      style={[a.flex_row, a.justify_between, a.align_center, {minHeight: 24}]}
    >
      <Icon.Export size={32} color={p.primary_500} />
    </TouchableOpacity>
  )
}

export default ExportTokenTransactions
