import {RouteProp, useIsFocused, useRoute} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import uuid from 'uuid'

import {BrowserRoutes} from '../../../../navigation'
import {useBrowser} from '../../common/BrowserProvider'
import {getGoogleSearchItem} from '../../common/DAppMock'
import {urlWithProtocol, validUrl} from '../../common/helpers'
import {useNavigateTo} from '../../common/useNavigateTo'
import {BrowserSearchToolbar} from '../BrowseDappScreen/BrowserSearchToolbar'
import {DAppItem} from '../DiscoverListScreen/DAppItem/DAppItem'

const getUrl = (searchValue: string, isEngineSearch: boolean) => {
  if (isEngineSearch || !validUrl(searchValue)) {
    const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(searchValue)
    return searchUrl
  }

  return urlWithProtocol(searchValue)
}

export const BrowseSearchDappScreen = () => {
  const {styles} = useStyles()
  const router = useRoute<RouteProp<BrowserRoutes, 'browser-search'>>()
  const {isEdit} = router.params ?? {isEdit: false}
  const navigateTo = useNavigateTo()
  const {addBrowserTab, setTabActive, updateTab, tabs, tabActiveIndex} = useBrowser()
  const tabActive = tabs[tabActiveIndex]
  const [searchValue, setSearchValue] = React.useState('')

  const isFocused = useIsFocused()
  const googleItem = getGoogleSearchItem(searchValue)

  const handleGoBack = () => {
    if (tabActiveIndex >= 0) {
      navigateTo.browserView()
    } else {
      navigateTo.discover()
    }
  }

  React.useEffect(() => {
    const handleSetUrl = () => {
      if (isEdit) {
        setSearchValue(tabActive?.url)
      }
    }

    const handleClearSearchValue = () => {
      setSearchValue('')
    }

    if (isFocused) {
      handleSetUrl()
    } else {
      handleClearSearchValue()
    }
  }, [isEdit, isFocused, tabActive?.url])

  const handleSubmit = (isEngineSearch: boolean) => {
    if (searchValue === '') return

    let tabId = ''
    const url = getUrl(searchValue, isEngineSearch)

    if (isEdit) {
      updateTab(tabActiveIndex, {url})
      tabId = tabActive.id
    } else {
      tabId = uuid.v4()
      addBrowserTab(url, tabId)
      setTabActive(tabs.length)
    }
    navigateTo.browserView()
  }

  return (
    <View style={styles.root}>
      <BrowserSearchToolbar
        onBack={handleGoBack}
        searchValue={searchValue}
        onSearchChange={(value) => setSearchValue(value)}
        onSearchSubmit={() => handleSubmit(false)}
      />

      <ScrollView style={styles.dAppContainer}>
        {searchValue !== '' && (
          <DAppItem key={googleItem.id} dApp={googleItem} connected={false} onPress={() => handleSubmit(true)} />
        )}
      </ScrollView>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {padding} = theme

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
    },
    dAppContainer: {
      ...padding['l'],
    },
  })

  return {styles} as const
}
