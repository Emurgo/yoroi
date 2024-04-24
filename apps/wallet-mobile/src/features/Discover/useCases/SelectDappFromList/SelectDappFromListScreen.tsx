import {useDappList} from '@yoroi/dapp-connector'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../components'
import {useSearch, useSearchOnNavBar} from '../../../../Search/SearchContext'
import {DAppItem, getGoogleSearchItem} from '../../common/helpers'
import {useDAppsConnected} from '../../common/useDAppsConnected'
import {useStrings} from '../../common/useStrings'
import {CountDAppsAvailable} from './CountDAppsAvailable/CountDAppsAvailable'
import {DAppExplorerTabItem} from './DAppExplorerTabItem/DAppExplorerTabItem'
import {DAppListItem} from './DAppListItem/DAppListItem'
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
  const [categoriesSelected, setCategoriesSelected] = React.useState<string[]>([])

  const isSearching = visible

  useSearchOnNavBar({
    title: strings.discoverTitle,
    placeholder: strings.searchDApps,
    noBack: true,
  })
  const {data: list} = useDappList({suspense: true})
  const {data: connectedOrigins = []} = useDAppsConnected({refetchOnMount: true, refetchInterval: 500})
  const hasConnectedDapps = connectedOrigins.length > 0

  const filters = Object.keys(list?.filters ?? {})

  const isDappConnected = (dappOrigins: string[]) => {
    return dappOrigins.some((dappOrigin) => connectedOrigins.includes(dappOrigin))
  }

  const dAppOriginsThatAreConnectedButNotInList = connectedOrigins.filter((connectedOrigin) => {
    return !list?.dapps.some((dapp) => dapp.origins.includes(connectedOrigin))
  })

  const handleToggleCategory = React.useCallback(
    (category: string) => {
      if (categoriesSelected.includes(category)) {
        setCategoriesSelected(categoriesSelected.filter((c) => c !== category))
        return
      }

      setCategoriesSelected([...categoriesSelected, category])
    },
    [categoriesSelected],
  )

  const getDAppsConnectedButNotInList = () => {
    return dAppOriginsThatAreConnectedButNotInList.map((origin) => {
      return {
        id: origin,
        name: origin.replace(/^https?:\/\//, ''),
        description: origin,
        category: 'Other',
        logo: '',
        uri: origin,
        origins: [origin],
      }
    })
  }

  const getListDApps = (): DAppItem[] => {
    if (!list?.dapps) return []

    if (isSearching) {
      if (search?.length > 0) {
        return list.dapps
          .filter((dApp) => dApp.name.toLowerCase().includes(search.toLowerCase()))
          .sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
          .concat(getGoogleSearchItem(search))
      }

      return list.dapps
    }

    if (hasConnectedDapps && currentTab === DAppTabs.connected) {
      return list.dapps
        .filter((dApp) => isDappConnected(dApp.origins))
        .sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
    }

    if (categoriesSelected.length > 0) {
      return list.dapps
        .filter((dApp) => categoriesSelected.some((filter) => list.filters[filter].includes(dApp.category)))
        .sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
    }

    return list.dapps.sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
  }

  const handleChangeTab = (tab: TDAppTabs) => {
    setCurrentTab(tab)
  }

  const headerDAppControl = () => {
    if (isSearching) return <Spacer height={16} />

    return (
      <>
        {hasConnectedDapps && (
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

        {(!hasConnectedDapps || currentTab === DAppTabs.recommended) && (
          <View style={styles.containerHeader}>
            <DAppTypes types={filters} onToggle={handleToggleCategory} selectedTypes={categoriesSelected} />

            <CountDAppsAvailable total={getListDApps().length} />

            <Spacer style={styles.dAppsBox} />
          </View>
        )}
      </>
    )
  }

  return (
    <>
      <WelcomeDAppModal />

      <View style={[styles.root]}>
        <FlatList
          data={currentTab === 'connected' ? [...getListDApps(), ...getDAppsConnectedButNotInList()] : getListDApps()}
          extraData={connectedOrigins}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponentStyle={styles.boxHeader}
          ListHeaderComponent={headerDAppControl}
          renderItem={({item: entry}) => (
            <View style={styles.dAppItemBox}>
              <DAppListItem dApp={entry} connected={isDappConnected(entry.origins)} />
            </View>
          )}
          ItemSeparatorComponent={() => <Spacer style={styles.dAppsBox} />}
          ListFooterComponent={() => <Spacer style={styles.dAppsBox} />}
        />
      </View>
    </>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray.min,
    },
    boxHeader: {},
    containerHeader: {},
    dAppsBox: {
      height: 16,
    },
    dAppItemBox: {
      ...theme.padding['x-l'],
    },
    tabsContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingBottom: 16,
    },
  })

  return styles
}
