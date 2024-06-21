import {useDappList} from '@yoroi/dapp-connector'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../components'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useSearch, useSearchOnNavBar} from '../../../Search/SearchContext'
import {getGoogleSearchItem} from '../../common/helpers'
import {useDAppsConnected} from '../../common/useDAppsConnected'
import {useStrings} from '../../common/useStrings'
import {CountDAppsAvailable} from './CountDAppsAvailable/CountDAppsAvailable'
import {CountDAppsConnected} from './CountDAppsConnected/CountDAppsConnected'
import {DAppExplorerTabItem} from './DAppExplorerTabItem/DAppExplorerTabItem'
import {DAppListItem} from './DAppListItem/DAppListItem'
import {DAppTypes} from './DAppTypes/DAppTypes'
import {WelcomeDAppModal} from './WelcomeDAppModal'

const DAppTabs = {
  connected: 'connected',
  recommended: 'recommended',
} as const
type TDAppTabs = keyof typeof DAppTabs
type Category = 'Investment' | 'Media' | 'Trading' | 'NFT' | 'Community'

export const SelectDappFromListScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const [currentTab, setCurrentTab] = React.useState<TDAppTabs>('connected')
  const [categoriesSelected, setCategoriesSelected] = React.useState<string[]>([])
  const {track} = useMetrics()

  React.useEffect(() => {
    if (currentTab === 'recommended') {
      track.discoverPageViewed()
    }
  }, [currentTab, track])

  useSearchOnNavBar({
    title: strings.discoverTitle,
    placeholder: strings.searchDApps,
    noBack: true,
  })
  const {data: connectedOrigins = []} = useDAppsConnected({refetchOnMount: true, refetchInterval: 500})

  const isDappConnected = (dappOrigins: string[]) => {
    return dappOrigins.some((dappOrigin) => connectedOrigins.includes(dappOrigin))
  }

  const handleToggleCategory = React.useCallback(
    (category: string) => {
      track.discoverFilterSelected({dapp_filter: category as Category})

      if (categoriesSelected.includes(category)) {
        setCategoriesSelected(categoriesSelected.filter((c) => c !== category))
        return
      }

      setCategoriesSelected([...categoriesSelected, category])
    },
    [categoriesSelected, track],
  )

  const myDapps = useFilteredDappList(currentTab, categoriesSelected)

  const handleChangeTab = (tab: TDAppTabs) => {
    setCurrentTab(tab)
  }

  const handleOnPress = (connected: boolean) => {
    track.discoverDAppItemClicked()
    if (connected) track.discoverConnectedDAppItemClicked()
  }

  return (
    <>
      <WelcomeDAppModal />

      <View style={[styles.root]}>
        <FlatList
          data={myDapps}
          extraData={connectedOrigins}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponentStyle={styles.boxHeader}
          ListHeaderComponent={
            <HeaderControl
              currentTab={currentTab}
              onTabChange={handleChangeTab}
              count={myDapps.length}
              selectedCategories={categoriesSelected}
              onCategoryToggle={handleToggleCategory}
            />
          }
          renderItem={({item: entry}) => {
            const connected = isDappConnected(entry.origins)
            return (
              <View style={styles.dAppItemBox}>
                <DAppListItem dApp={entry} connected={connected} onPress={() => handleOnPress(connected)} />
              </View>
            )
          }}
          ItemSeparatorComponent={() => <Spacer style={styles.dAppsBox} />}
          ListFooterComponent={() => <Spacer style={styles.dAppsBox} />}
        />
      </View>
    </>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    boxHeader: {},
    containerHeader: {},
    dAppsBox: {
      height: 16,
    },
    dAppItemBox: {
      ...atoms.px_lg,
    },
    tabsContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingBottom: 16,
    },
  })

  return styles
}

const HeaderControl = ({
  currentTab,
  onTabChange,
  count,
  selectedCategories,
  onCategoryToggle,
}: {
  currentTab: TDAppTabs
  onTabChange: (tab: TDAppTabs) => void
  count: number
  selectedCategories: string[]
  onCategoryToggle: (category: string) => void
}) => {
  const {visible} = useSearch()
  const styles = useStyles()
  const strings = useStrings()
  const {data: connectedOrigins = []} = useDAppsConnected({refetchOnMount: true, refetchInterval: 500})
  const hasConnectedDapps = connectedOrigins.length > 0
  const {data: list} = useDappList({suspense: true})
  const filters = Object.keys(list?.filters ?? {})

  if (visible) return <Spacer height={16} />

  return (
    <>
      {hasConnectedDapps && (
        <View style={[styles.dAppItemBox, styles.tabsContainer]}>
          <DAppExplorerTabItem
            name={strings.connected}
            isActive={currentTab === DAppTabs.connected}
            onPress={() => onTabChange(DAppTabs.connected)}
          />

          <DAppExplorerTabItem
            name={strings.recommended}
            isActive={currentTab === DAppTabs.recommended}
            onPress={() => onTabChange(DAppTabs.recommended)}
          />
        </View>
      )}

      {hasConnectedDapps && currentTab === DAppTabs.connected && (
        <View style={styles.containerHeader}>
          <CountDAppsConnected total={connectedOrigins.length} />

          <Spacer style={styles.dAppsBox} />
        </View>
      )}

      {(!hasConnectedDapps || currentTab === DAppTabs.recommended) && (
        <View style={styles.containerHeader}>
          <DAppTypes types={filters} onToggle={onCategoryToggle} selectedTypes={selectedCategories} />

          <CountDAppsAvailable total={count} />

          <Spacer style={styles.dAppsBox} />
        </View>
      )}
    </>
  )
}

const useFilteredDappList = (tab: TDAppTabs, categoriesSelected: string[]) => {
  const {search, visible} = useSearch()
  const {data: list} = useDappList({suspense: true})
  const {data: connectedOrigins = []} = useDAppsConnected({refetchOnMount: true, refetchInterval: 500})
  const hasConnectedDapps = connectedOrigins.length > 0
  const isSearching = visible

  const isDappConnected = (dappOrigins: string[]) => {
    return dappOrigins.some((dappOrigin) => connectedOrigins.includes(dappOrigin))
  }

  const dAppOriginsThatAreConnectedButNotInList = connectedOrigins.filter((connectedOrigin) => {
    return !list?.dapps.some((dapp) => dapp.origins.includes(connectedOrigin))
  })

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

  if (!list?.dapps) return []

  const allDapps = tab === 'connected' ? [...list.dapps, ...getDAppsConnectedButNotInList()] : list.dapps

  if (isSearching) {
    if (search?.length > 0) {
      return allDapps
        .filter((dApp) => dApp.name.toLowerCase().includes(search.toLowerCase()))
        .sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
        .concat(getGoogleSearchItem(search))
    }

    return allDapps
  }

  if (hasConnectedDapps && tab === DAppTabs.connected) {
    return allDapps
      .filter((dApp) => isDappConnected(dApp.origins))
      .sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
  }

  if (categoriesSelected.length > 0) {
    return allDapps
      .filter((dApp) => categoriesSelected.some((filter) => list.filters[filter].includes(dApp.category)))
      .sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
  }

  return allDapps.sort((dAppFirst, dAppSecond) => dAppFirst.name.localeCompare(dAppSecond.name))
}
