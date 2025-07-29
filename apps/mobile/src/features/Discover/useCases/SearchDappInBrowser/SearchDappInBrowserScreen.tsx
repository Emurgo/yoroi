import {useIsFocused} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, View} from 'react-native'

import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {getGoogleSearchItem, urlWithProtocol} from '../../common/helpers'
import {useNavigateTo} from '../../common/useNavigateTo'
import {BrowserSearchToolbar} from '../BrowseDapp/BrowserSearchToolbar'
import {DAppListItem} from '../SelectDappFromList/DAppListItem/DAppListItem'

const getUrl = (searchValue: string, isEngineSearch: boolean) => {
  if (isEngineSearch) {
    return 'https://www.google.com/search?q=' + encodeURIComponent(searchValue)
  }

  return urlWithProtocol(searchValue)
}

export const SearchDappInBrowserScreen = () => {
  const {palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const {updateTab, tabs, tabActiveIndex} = useBrowser()
  const tabActive = tabs[tabActiveIndex]
  const [searchValue, setSearchValue] = React.useState('')
  const isFocused = useIsFocused()
  const googleItem = getGoogleSearchItem(searchValue)

  const handleGoBack = () => {
    if (tabActiveIndex >= 0) {
      navigateTo.browseDapp()
    } else {
      navigateTo.selectDappFromList()
    }
  }

  React.useEffect(() => {
    const handleSetUrl = () => {
      setSearchValue(tabActive?.url)
    }

    const handleClearSearchValue = () => {
      setSearchValue('')
    }

    if (isFocused) {
      handleSetUrl()
    } else {
      handleClearSearchValue()
    }
  }, [isFocused, tabActive?.url])

  const handleSubmit = (isEngineSearch: boolean) => {
    if (searchValue === '') return
    const url = getUrl(searchValue, isEngineSearch)
    updateTab(tabActiveIndex, {url})
    navigateTo.browseDapp()
  }

  return (
    <View style={[{flex: 1, backgroundColor: p.bg_color_max}]}>
      <BrowserSearchToolbar
        onBack={handleGoBack}
        searchValue={searchValue}
        onSearchChange={(value) => setSearchValue(value)}
        onSearchSubmit={() => handleSubmit(false)}
      />

      <ScrollView style={[a.p_lg]}>
        {searchValue !== '' && (
          <DAppListItem
            key={googleItem.id}
            dApp={googleItem}
            connected={false}
            onPress={() => handleSubmit(true)}
          />
        )}
      </ScrollView>
    </View>
  )
}
