import {useDappList} from '@yoroi/dapp-connector'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, View} from 'react-native'

import {ChainDAppsWarning} from '~/features/Discover/common/ChainDAppsWarning'
import {getGoogleSearchItem} from '~/features/Discover/common/helpers'
import {useDAppsConnected} from '~/features/Discover/common/useDAppsConnected'
import {useShowWelcomeDApp} from '~/features/Discover/common/useShowWelcomeDApp'
import {useStrings} from '~/features/Discover/common/useStrings'
import {ShowDisclaimer} from '~/features/Legal/Disclaimer/ShowDisclaimer'
import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {SimpleTab} from '~/ui/SimpleTab/SimpleTab'
import {Space} from '~/ui/Space/Space'
import {CountDAppsAvailable} from './CountDAppsAvailable/CountDAppsAvailable'
import {CountDAppsConnected} from './CountDAppsConnected/CountDAppsConnected'
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
  const {palette: p} = useTheme()
  const [currentTab, setCurrentTab] = React.useState<TDAppTabs>('connected')
  const [categoriesSelected, setCategoriesSelected] = React.useState<string[]>(
    [],
  )
  const {track} = useMetrics()
  const [isShowedWelcomeDApp] = useShowWelcomeDApp()

  React.useEffect(() => {
    if (currentTab === 'recommended') {
      track.discoverPageViewed()
    }
  }, [currentTab, track])

  useSearchOnNavBar({
    title: strings.discoverTitle,
    placeholder: strings.searchDApps,
    noBack: true,
    extraNavigationOptions: {
      headerTitle: ({children}) => (
        <NetworkTag style={{width: 200}}>{children}</NetworkTag>
      ),
    },
  })
  const {data: connectedOrigins = []} = useDAppsConnected({
    refetchOnMount: true,
  })

  const isDappConnected = (dappOrigins: string[]) => {
    return dappOrigins.some((dappOrigin) =>
      connectedOrigins.includes(dappOrigin),
    )
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

  return (
    <>
      <WelcomeDAppModal disabled={isShowedWelcomeDApp} />

      <ShowDisclaimer type="dapps" disabled={!isShowedWelcomeDApp} />

      <View
        style={[{flex: 1, backgroundColor: p.bg_color_max}, a.px_lg, a.gap_lg]}
      >
        <ChainDAppsWarning />

        <FlatList
          data={myDapps}
          extraData={connectedOrigins}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <HeaderControl
              currentTab={currentTab}
              onTabChange={handleChangeTab}
              count={myDapps.length}
              selectedCategories={categoriesSelected}
              onCategoryToggle={handleToggleCategory}
            />
          }
          renderItem={({item}) => (
            <DAppListItem
              dApp={item}
              connected={isDappConnected(item.origins)}
            />
          )}
          ItemSeparatorComponent={() => <Space.Height.md />}
        />
      </View>
    </>
  )
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
  const strings = useStrings()
  const {data: connectedOrigins = []} = useDAppsConnected({
    refetchOnMount: true,
  })
  const hasConnectedDapps = connectedOrigins.length > 0
  const {data: list} = useDappList({suspense: true})
  const filters = Object.keys(list?.filters ?? {})

  if (visible) return <Space.Height.md />

  return (
    <>
      {hasConnectedDapps && (
        <View style={[{flexDirection: 'row', gap: 8, paddingBottom: 16}]}>
          <SimpleTab
            name={strings.connected}
            isActive={currentTab === DAppTabs.connected}
            onPress={() => onTabChange(DAppTabs.connected)}
          />

          <SimpleTab
            name={strings.recommended}
            isActive={currentTab === DAppTabs.recommended}
            onPress={() => onTabChange(DAppTabs.recommended)}
          />
        </View>
      )}

      {hasConnectedDapps && currentTab === DAppTabs.connected && (
        <View>
          <CountDAppsConnected total={connectedOrigins.length} />

          <Space.Height._2xs style={{height: 16}} />
        </View>
      )}

      {(!hasConnectedDapps || currentTab === DAppTabs.recommended) && (
        <View>
          <DAppTypes
            types={filters}
            onToggle={onCategoryToggle}
            selectedTypes={selectedCategories}
          />

          <CountDAppsAvailable total={count} />

          <Space.Height._2xs style={{height: 16}} />
        </View>
      )}
    </>
  )
}

const useFilteredDappList = (tab: TDAppTabs, categoriesSelected: string[]) => {
  const {search, visible} = useSearch()
  const {track} = useMetrics()
  const {data: list} = useDappList({suspense: true})
  const {data: connectedOrigins = []} = useDAppsConnected({
    refetchOnMount: true,
  })
  const hasConnectedDapps = connectedOrigins.length > 0
  const isSearching = visible

  const isDappConnected = (dappOrigins: string[]) => {
    return dappOrigins.some((dappOrigin) =>
      connectedOrigins.includes(dappOrigin),
    )
  }

  const dAppOriginsThatAreConnectedButNotInList = connectedOrigins.filter(
    (connectedOrigin) => {
      return !list?.dapps.some((dapp) => dapp.origins.includes(connectedOrigin))
    },
  )

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    const sendMetrics = () => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        track.discoverSearchActivated({search_term: search})
      }, 500) // 0.5s requirement
    }

    if (isSearching && search.length > 0) sendMetrics()

    return () => clearTimeout(timeout)
  }, [isSearching, search, track])

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
        isSingleAddress: false,
      }
    })
  }

  if (!list?.dapps) return []

  const allDapps =
    tab === 'connected'
      ? [...list.dapps, ...getDAppsConnectedButNotInList()]
      : list.dapps

  if (isSearching) {
    if (search?.length > 0) {
      return allDapps
        .filter((dApp) =>
          dApp.name.toLowerCase().includes(search.toLowerCase()),
        )
        .sort((dAppFirst, dAppSecond) =>
          dAppFirst.name.localeCompare(dAppSecond.name),
        )
        .concat(getGoogleSearchItem(search))
    }

    return allDapps
  }

  if (hasConnectedDapps && tab === DAppTabs.connected) {
    return allDapps
      .filter((dApp) => isDappConnected(dApp.origins))
      .sort((dAppFirst, dAppSecond) =>
        dAppFirst.name.localeCompare(dAppSecond.name),
      )
  }

  if (categoriesSelected.length > 0) {
    return allDapps
      .filter((dApp) =>
        categoriesSelected.some((filter) =>
          list.filters[filter].includes(dApp.category),
        ),
      )
      .sort((dAppFirst, dAppSecond) =>
        dAppFirst.name.localeCompare(dAppSecond.name),
      )
  }

  return allDapps.sort((dAppFirst, dAppSecond) =>
    dAppFirst.name.localeCompare(dAppSecond.name),
  )
}
