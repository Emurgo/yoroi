import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {View} from 'react-native'

import {
  PortfolioDetailsTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {TabPanel, TabPanels} from '~/ui/Tabs'
import {Overview} from './Overview/Overview'
import {Performance} from './Performance'

export const PortfolioTokenInfo = () => {
  const {atoms: ta, palette: p} = useTheme()
  const {detailsTab} = usePortfolio()

  return (
    <View style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <TabPanels>
        <TabPanel active={detailsTab === PortfolioDetailsTab.Performance}>
          <Performance />
        </TabPanel>

        <TabPanel active={detailsTab === PortfolioDetailsTab.Overview}>
          <Overview />
        </TabPanel>
      </TabPanels>
    </View>
  )
}
