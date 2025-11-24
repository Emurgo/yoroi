import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {FlatList, View} from 'react-native'

import {ChainDAppsWarning} from '~/features/Discover/common/ChainDAppsWarning'
import {DAppItem, getGoogleSearchItem} from '~/features/Discover/common/helpers'
import {useDAppsConnected} from '~/features/Discover/common/useDAppsConnected'
import {useShowWelcomeDApp} from '~/features/Discover/common/useShowWelcomeDApp'
import {ShowDisclaimer} from '~/features/Legal/ui/shared/Disclaimer/ShowDisclaimer'
import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'
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
  const {data: connectedOrigins = []} = useDAppsConnected()
  const hasConnectedDapps = connectedOrigins.length > 0
  const {config} = useRemoteConfig()
  const filters = Object.keys(config?.dapps?.filters ?? {})

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
  const {config} = useRemoteConfig()
  const {data: connectedOrigins = []} = useDAppsConnected()
  const hasConnectedDapps = connectedOrigins.length > 0
  const isSearching = visible

  const isDappConnected = (dappOrigins: string[]) => {
    return dappOrigins.some((dappOrigin) =>
      connectedOrigins.includes(dappOrigin),
    )
  }

  // Use config recommended dapps from remote config
  const logoBaseUrl =
    'https://raw.githubusercontent.com/Emurgo/yoroi-config/refs/heads/main/images'
  const dapps = React.useMemo((): DAppItem[] => {
    if (!config?.dapps?.recommended) return []
    return config.dapps.recommended.map((dapp) => ({
      id: dapp.id,
      name: dapp.name,
      description: dapp.description,
      category: dapp.category,
      logo: dapp.logo ? `${logoBaseUrl}/${dapp.logo}` : '',
      uri: dapp.uri,
      origins: [...dapp.origins],
      isSingleAddress: dapp.isSingleAddress ?? false,
    }))
  }, [config?.dapps?.recommended])

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
    const filters = (config?.dapps?.filters || {}) as Record<string, string[]>
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
