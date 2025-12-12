import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {
  PortfolioDetailsTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {TabPanel, TabPanels} from '~/ui/Tabs'

import {Overview} from './Overview/Overview'

export const PortfolioTokenInfo = () => {
  const {palette: p} = useTheme()
  const {detailsTab} = usePortfolio()

  return (
    <View style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <TabPanels>
        <TabPanel active={detailsTab === PortfolioDetailsTab.Overview}>
          <Overview />
        </TabPanel>
      </TabPanels>
    </View>
  )
}
