import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useSearchOnNavBar} from '~/features/Search/SearchContext'
import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {useStrings} from '~/kernel/i18n/useStrings'

import {PortfolioWalletTokenList} from './PortfolioWalletTokenList/PortfolioWalletTokenList'

export const PortfolioTokenListScreen = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  useSearchOnNavBar({
    title: strings.portfolio.tokenList,
    placeholder: strings.portfolio.searchTokens,
    extraNavigationOptions: {
      headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
    },
  })

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
    >
      <PortfolioWalletTokenList />
    </SafeAreaView>
  )
}
