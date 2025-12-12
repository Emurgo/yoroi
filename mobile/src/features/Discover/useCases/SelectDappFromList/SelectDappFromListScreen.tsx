import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {FlatList, View} from 'react-native'

import {ChainDAppsWarning} from '~/features/Discover/common/ChainDAppsWarning'
import {
  DAppItem,
  getDirectUrlItem,
  getGoogleSearchItem,
  looksLikeUrl,
} from '~/features/Discover/common/helpers'
import {useDAppsConnected} from '~/features/Discover/common/useDAppsConnected'
import {useDappList} from '~/features/Discover/common/useDappList'
import {useShowWelcomeDApp} from '~/features/Discover/common/useShowWelcomeDApp'
import {ShowDisclaimer} from '~/features/Legal/ui/shared/Disclaimer/ShowDisclaimer'
import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {useStrings} from '~/kernel/i18n/useStrings'
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

const HeaderTitleComponent = ({children}: {children: React.ReactNode}) => (
  <NetworkTag style={{width: 200}}>{children}</NetworkTag>
)

export const SelectDappFromListScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const [currentTab, setCurrentTab] = React.useState<TDAppTabs>('connected')
  const [categoriesSelected, setCategoriesSelected] = React.useState<string[]>(
    [],
  )
  const [isShowedWelcomeDApp] = useShowWelcomeDApp()
  const {search} = useSearch()

  useSearchOnNavBar({
    title: strings.discover.discoverTitle,
    placeholder: strings.discover.searchDApps,
    noBack: true,
    extraNavigationOptions: {
      headerTitle: HeaderTitleComponent,
    },
  })
  const {data: connectedOrigins = []} = useDAppsConnected()

  const isDappConnected = (dappOrigins: string[]) => {
    return dappOrigins.some((dappOrigin) =>
      connectedOrigins.includes(dappOrigin),
    )
  }

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

  const myDapps = useFilteredDappList(currentTab, categoriesSelected)

  const handleChangeTab = (tab: TDAppTabs) => {
    setCurrentTab(tab)
  }

  return (
    <>
      <WelcomeDAppModal disabled={isShowedWelcomeDApp !== false} />

      <ShowDisclaimer
        type="dapps"
        disabled={isShowedWelcomeDApp === undefined}
      />

      <View style={[a.flex_1, ta.bg_color_max, a.px_lg, a.gap_lg]}>
        <ChainDAppsWarning />

        <FlatList
          data={myDapps}
          extraData={[connectedOrigins, search]}
          keyExtractor={(item, index) => {
            // Include search value in key for direct URL and Google items to ensure they update
            if (item.id === 'direct_url' || item.id === 'google_search') {
              return `${item.id}-${search || index}`
            }
            return item.id.toString()
          }}
          ListHeaderComponent={
            <>
              <HeaderControl
                currentTab={currentTab}
                onTabChange={handleChangeTab}
                count={myDapps.length}
                selectedCategories={categoriesSelected}
                onCategoryToggle={handleToggleCategory}
              />
              <Space.Height.lg />
            </>
          }
          renderItem={({item}) => (
            <DAppListItem
              dApp={item}
              connected={isDappConnected(item.origins)}
            />
          )}
          ItemSeparatorComponent={() => <Space.Height.md />}
          ListFooterComponent={() => <Space.Height.lg />}
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
  const {data: connectedOrigins = []} = useDAppsConnected()
  const hasConnectedDapps = connectedOrigins.length > 0
  const {data: dappListData} = useDappList()
  const filters = Object.keys(dappListData?.filters ?? {})

  if (visible) return <Space.Height.md />

  return (
    <>
      {hasConnectedDapps && (
        <View style={[a.flex_row, a.gap_xs, a.pb_md]}>
          <SimpleTab
            name={strings.discover.connected}
            isActive={currentTab === DAppTabs.connected}
            onPress={() => onTabChange(DAppTabs.connected)}
          />

          <SimpleTab
            name={strings.discover.recommended}
            isActive={currentTab === DAppTabs.recommended}
            onPress={() => onTabChange(DAppTabs.recommended)}
          />
        </View>
      )}

      {hasConnectedDapps && currentTab === DAppTabs.connected && (
        <View>
          <CountDAppsConnected total={connectedOrigins.length} />

          <Space.Height._2xs />
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

          <Space.Height._2xs />
        </View>
      )}
    </>
  )
}

const useFilteredDappList = (tab: TDAppTabs, categoriesSelected: string[]) => {
  const {search, visible} = useSearch()
  const {data: dappListData} = useDappList()
  const {data: connectedOrigins = []} = useDAppsConnected()
  const hasConnectedDapps = connectedOrigins.length > 0
  const isSearching = visible

  const isDappConnected = (dappOrigins: string[]) => {
    return dappOrigins.some((dappOrigin) =>
      connectedOrigins.includes(dappOrigin),
    )
  }

  // Use dapps from useDappList hook (already transformed with logo URLs)
  const dapps = React.useMemo((): DAppItem[] => {
    if (!dappListData?.dapps) return []
    // Convert DappResponse to DAppItem (they have the same structure)
    return dappListData.dapps.map((dapp) => ({
      id: dapp.id,
      name: dapp.name,
      description: dapp.description,
      category: dapp.category,
      logo: dapp.logo,
      uri: dapp.uri,
      origins: [...dapp.origins],
      isSingleAddress: dapp.isSingleAddress,
    }))
  }, [dappListData?.dapps])

  const dAppOriginsThatAreConnectedButNotInList = connectedOrigins.filter(
    (connectedOrigin) => {
      return !dapps.some((dapp) => dapp.origins.includes(connectedOrigin))
    },
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
        isSingleAddress: false,
      }
    })
  }

  if (dapps.length === 0) return []

  const allDapps =
    tab === 'connected' ? [...dapps, ...getDAppsConnectedButNotInList()] : dapps

  if (isSearching) {
    if (search?.length > 0) {
      const filteredDapps = allDapps
        .filter((dApp) =>
          dApp.name.toLowerCase().includes(search.toLowerCase()),
        )
        .sort((dAppFirst, dAppSecond) =>
          dAppFirst.name.localeCompare(dAppSecond.name),
        )

      const results: DAppItem[] = []
      const isUrl = looksLikeUrl(search)

      // Add direct URL option first if it's a URL
      if (isUrl) {
        results.push(getDirectUrlItem(search))
      }

      // Add filtered dapps
      results.push(...filteredDapps)

      // Add Google search option last
      results.push(getGoogleSearchItem(search))

      return results
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
    const filters = (dappListData?.filters || {}) as Record<string, string[]>
    return allDapps
      .filter((dApp) =>
        categoriesSelected.some((filter) =>
          filters[filter]?.includes(dApp.category),
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
