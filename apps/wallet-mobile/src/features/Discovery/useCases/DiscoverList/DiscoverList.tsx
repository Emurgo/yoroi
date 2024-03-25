import {useTheme} from '@yoroi/theme'
import React from 'react'
import {FlatList, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Spacer} from '../../../../components'
import {useSearch, useSearchOnNavBar} from '../../../../Search/SearchContext'
import {makeList} from '../../../../utils'
import {useShowWelcomeDApp} from '../../common/useShowWelcomeDApp'
import {useStrings} from '../../common/useStrings'
import {CountDAppsAvailable} from './CountDAppsAvailable/CountDAppsAvailable'
import {DAppItem} from './DAppItem/DAppItem'
import {DAppItemSkeleton} from './DAppItem/DAppItemSkeleton'
import {DAppCategory, mockDAppGoogle, mockDAppList, TDAppCategory} from './DAppMock'
import {DAppTypes} from './DAppTypes/DAppTypes'

export const DiscoverList = () => {
  const styles = useStyles()
  const strings = useStrings()
  const {search, visible} = useSearch()

  const [isLoading, setIsLoading] = React.useState(true)
  const [categoriesSelected, setCategoriesSelected] = React.useState<Partial<{[key in TDAppCategory]: boolean}>>()

  const isSearching = visible

  useShowWelcomeDApp()

  useSearchOnNavBar({
    title: strings.discoverTitle,
    placeholder: strings.searchDApps,
    noBack: true,
  })

  const getDAppCategories = Object.keys(DAppCategory) as TDAppCategory[]

  const handleToggleCategory = React.useCallback(
    (category: TDAppCategory) => {
      setCategoriesSelected({
        ...categoriesSelected,
        [category]: !(categoriesSelected ?? {})[category],
      })
    },
    [categoriesSelected],
  )

  const getCategoriesSelected = () => {
    return Object.keys(categoriesSelected ?? {}).filter(
      (key) => (categoriesSelected ?? {})[key as TDAppCategory],
    ) as TDAppCategory[]
  }

  const getListDApps = () => {
    if (search?.length > 0) {
      return mockDAppList
        .filter((dApp) => dApp.name.toLowerCase().includes(search.toLowerCase()))
        .sort((_, __) => _.name.localeCompare(__.name))
        .concat(mockDAppGoogle(search))
    }

    if (getCategoriesSelected().length > 0) {
      const selectedCategories = getCategoriesSelected()
      return mockDAppList
        .filter((dApp) => dApp.category !== undefined && selectedCategories.includes(dApp.category))
        .sort((_, __) => _.name.localeCompare(__.name))
    }

    return mockDAppList.sort((_, __) => _.name.localeCompare(__.name))
  }

  React.useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.root]}>
      {/* <View style={styles.dAppItemBox}>
        <Text>12313123</Text>
      </View> */}

      {isLoading ? (
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
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponentStyle={styles.boxHeader}
          ListHeaderComponent={() =>
            isSearching ? (
              <View></View>
            ) : (
              <View style={styles.containerHeader}>
                <DAppTypes
                  types={getDAppCategories}
                  onToggle={handleToggleCategory}
                  selected={categoriesSelected}
                  listCategoriesSelected={getCategoriesSelected()}
                />

                <CountDAppsAvailable total={getListDApps().length} />
              </View>
            )
          }
          renderItem={({item: entry}) => (
            <View style={styles.dAppItemBox}>
              <DAppItem dApp={entry} />
            </View>
          )}
          ItemSeparatorComponent={() => <Spacer style={styles.dAppsBox} />}
        />
      )}
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray.min,
    },
    boxHeader: {
      marginBottom: 16,
    },
    containerHeader: {},
    dAppsBox: {
      height: 16,
    },
    dAppItemBox: {
      ...theme.padding['x-l'],
    },
  })

  return styles
}
