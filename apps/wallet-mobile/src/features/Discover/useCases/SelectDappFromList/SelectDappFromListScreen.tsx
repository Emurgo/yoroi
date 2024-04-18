import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, ScrollView, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../components'
import {useSearch, useSearchOnNavBar} from '../../../../Search/SearchContext'
import {makeList} from '../../../../utils'
import {DAppCategory, getGoogleSearchItem, TDAppCategory} from '../../common/DAppMock'
import {useDAppsConnected} from '../../common/useDAppsConnected'
import {useDAppsList} from '../../common/useDAppsList'
import {useStrings} from '../../common/useStrings'
import {CountDAppsAvailable} from './CountDAppsAvailable/CountDAppsAvailable'
import {DAppExplorerTabItem} from './DAppExplorerTabItem/DAppExplorerTabItem'
import {DAppItem} from './DAppItem/DAppItem'
import {DAppItemSkeleton} from './DAppItem/DAppItemSkeleton'
import {DAppTypes} from './DAppTypes/DAppTypes'
import {WelcomeDAppModal} from './WelcomeDAppModal'

const DAppTabs = {
  connected: 'connected',
  recommended: 'recommended',
} as const
type TDAppTabs = keyof typeof DAppTabs

export const SelectDappFromListScreen = () => {
  const styles = useStyles()
  const strings = useStrings()
  const {search, visible} = useSearch()

  const [currentTab, setCurrentTab] = React.useState<TDAppTabs>('connected')
  const [categoriesSelected, setCategoriesSelected] = React.useState<Partial<{[key in TDAppCategory]: boolean}>>()

  const isSearching = visible

  useSearchOnNavBar({
    title: strings.discoverTitle,
    placeholder: strings.searchDApps,
    noBack: true,
  })
  const {data: listDApp, isFetching: fetchingDApp} = useDAppsList()
  const {data: listDAppConnected, isFetching: fetchingDAppConnected} = useDAppsConnected({refetchOnMount: true})
  const haveDAppsConnected = (listDAppConnected ?? [])?.length > 0

  const getDAppCategories = Object.keys(DAppCategory) as TDAppCategory[]

  const handleToggleCategory = React.useCallback(
    (category: TDAppCategory) => {
      const handleSelected = {...categoriesSelected}
      if (categoriesSelected?.[category]) {
        delete handleSelected[category]
      } else {
        handleSelected[category] = true
      }

      setCategoriesSelected(handleSelected)
    },
    [categoriesSelected],
  )

  const getCategoriesSelected = () => {
    return Object.keys(categoriesSelected ?? {}).filter(
      (key) => (categoriesSelected ?? {})[key as TDAppCategory],
    ) as TDAppCategory[]
  }

  const getListDApps = () => {
    if (!listDApp) return []

    if (isSearching) {
      if (search?.length > 0) {
        return listDApp
          .filter((dApp) => dApp.name.toLowerCase().includes(search.toLowerCase()))
          .sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
          .concat(getGoogleSearchItem(search))
      }

      return listDApp
    }

    if (haveDAppsConnected && currentTab === DAppTabs.connected) {
      return listDApp
        .filter((dApp) => listDAppConnected?.includes(dApp.id))
        .sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
    }

    if (getCategoriesSelected().length > 0) {
      const selectedCategories = getCategoriesSelected()
      return listDApp
        .filter((dApp) => dApp.category !== undefined && selectedCategories.includes(dApp.category))
        .sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
    }

    return listDApp.sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
  }

  const handleChangeTab = (tab: TDAppTabs) => {
    setCurrentTab(tab)
  }

  const headerDAppControl = () => {
    if (isSearching) return <Spacer height={16} />

    return (
      <>
        {haveDAppsConnected && (
          <View style={[styles.dAppItemBox, styles.tabsContainer]}>
            <DAppExplorerTabItem
              name={strings.connected}
              isActive={currentTab === DAppTabs.connected}
              onPress={() => handleChangeTab(DAppTabs.connected)}
            />

            <DAppExplorerTabItem
              name={strings.recommended}
              isActive={currentTab === DAppTabs.recommended}
              onPress={() => handleChangeTab(DAppTabs.recommended)}
            />
          </View>
        )}

        {(!haveDAppsConnected || currentTab === DAppTabs.recommended) && (
          <View style={styles.containerHeader}>
            <DAppTypes
              types={getDAppCategories}
              onToggle={handleToggleCategory}
              selected={categoriesSelected}
              listCategoriesSelected={getCategoriesSelected()}
            />

            <CountDAppsAvailable total={getListDApps().length} />

            <Spacer style={styles.dAppsBox} />
          </View>
        )}
      </>
    )
  }

  const loadingDAppsList = fetchingDAppConnected || fetchingDApp

  return (
    <>
      <WelcomeDAppModal />

      <View style={[styles.root]}>
        {loadingDAppsList ? (
          <ScrollView>
            {makeList(7).map((_, index) => (
              <View style={styles.dAppItemBox} key={index}>
                <DAppItemSkeleton />

                <Spacer style={styles.dAppsBox} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <FlatList
            data={getListDApps()}
            extraData={listDAppConnected}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponentStyle={styles.boxHeader}
            ListHeaderComponent={headerDAppControl}
            renderItem={({item: entry}) => (
              <View style={styles.dAppItemBox}>
                <DAppItem dApp={entry} connected={(listDAppConnected ?? [])?.includes(entry.id)} />
              </View>
            )}
            ItemSeparatorComponent={() => <Spacer style={styles.dAppsBox} />}
            ListFooterComponent={() => <Spacer style={styles.dAppsBox} />}
          />
        )}
      </View>
    </>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray_cmin,
    },
    boxHeader: {},
    containerHeader: {},
    dAppsBox: {
      height: 16,
    },
    dAppItemBox: {
      ...theme.atoms.px_lg,
    },
    tabsContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingBottom: 16,
    },
  })

  return styles
}
