import {RouteProp, useIsFocused, useRoute} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import lodash from 'lodash'
import React, {useEffect, useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {WebViewNavigation} from 'react-native-webview'

import {BrowserRoutes} from '../../../../navigation'
import {useBrowser} from '../../common/Browser/BrowserProvider'
import {BrowserSearchToolbar} from '../../common/Browser/BrowserSearchToolbar'
import {urlWithProtocol, validUrl} from '../../common/helpers'
import {useNavigateTo} from '../../common/useNavigateTo'
import {DAppItem} from '../DiscoverList/DAppItem/DAppItem'
import {mockDAppGoogle} from '../DiscoverList/DAppMock'

export type WebViewState = Partial<WebViewNavigation> & Required<Pick<WebViewNavigation, 'url'>>

export const BrowserSearch = () => {
  const {styles} = useStyles()
  const router = useRoute<RouteProp<BrowserRoutes, 'browser-search'>>()
  const {isEdit} = router.params ?? {isEdit: false}
  const navigateTo = useNavigateTo()
  const {addBrowserTab, setTabActive, updateTab, tabs, tabActiveIndex} = useBrowser()
  const tabActive = tabs[tabActiveIndex]
  const [searchValue, setSearchValue] = useState('')

  const isFocused = useIsFocused()

  const handleGoBack = () => {
    if (tabActiveIndex >= 0) {
      const tabId = tabs[tabActiveIndex].id
      navigateTo.browserView(`browser-view-${tabId}`)
    } else {
      navigateTo.browserTabs()
    }
  }

  const getUrl = () => {
    if (!validUrl(searchValue)) {
      const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(searchValue)
      return searchUrl
    }

    return urlWithProtocol(searchValue)
  }

  useEffect(() => {
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

  const handleSubmit = () => {
    if (searchValue === '') return

    let tabId = ''
    const url = getUrl()
    if (isEdit) {
      updateTab(tabActiveIndex, {url})
      tabId = tabActive.id
    } else {
      tabId = lodash.uniqueId('browser-tab-id-')
      addBrowserTab(url, tabId)
      setTabActive(tabs.length)
    }
    const screenName = `browser-view-${tabId}`
    navigateTo.browserView(screenName)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'top']} style={styles.root}>
      <BrowserSearchToolbar
        onBack={handleGoBack}
        searchValue={searchValue}
        onSearchChange={(value) => setSearchValue(value)}
        onSearchSubmit={handleSubmit}
      />

      <View style={styles.dAppContainer}>
        {searchValue !== '' &&
          [mockDAppGoogle(searchValue)].map((dApp) => (
            <DAppItem key={dApp.id} dApp={dApp} connected={false} onPress={handleSubmit} />
          ))}
      </View>
    </SafeAreaView>
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
