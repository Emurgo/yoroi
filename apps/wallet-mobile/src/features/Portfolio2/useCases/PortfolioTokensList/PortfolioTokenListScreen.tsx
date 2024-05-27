import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Tab, TabPanel, Tabs} from '../../../../components/Tabs'
import {useSearchOnNavBar} from '../../../../Search/SearchContext'
import {useStrings} from '../../common/useStrings'
import {PortfolioDAppsTokenScreen} from './PortfolioDAppsTokenScreen'
import {PortfolioWalletTokenScreen} from './PortfolioWalletTokenScreen'

export const PortfolioTokenListScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const [activeTab, setActiveTab] = React.useState<'wallet' | 'dapps'>('wallet')

  useSearchOnNavBar({
    title: strings.tokenList,
    placeholder: strings.searchTokens,
  })

  const hasWithDAps = true

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      {hasWithDAps ? (
        <Tabs>
          <Tab
            onPress={() => {
              setActiveTab('wallet')
            }}
            label={strings.walletToken}
            active={activeTab === 'wallet'}
          />

          <Tab
            onPress={() => {
              setActiveTab('dapps')
            }}
            label={strings.dappsToken}
            active={activeTab === 'dapps'}
          />
        </Tabs>
      ) : null}

      <TabPanel active={activeTab === 'wallet'}>
        <PortfolioWalletTokenScreen />
      </TabPanel>

      <TabPanel active={activeTab === 'dapps'}>
        <PortfolioDAppsTokenScreen />
      </TabPanel>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.gray_cmin,
    },
  })

  return {styles, atoms, color} as const
}
