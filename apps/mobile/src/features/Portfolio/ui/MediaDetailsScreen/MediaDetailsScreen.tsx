import {RouteProp, useRoute} from '@react-navigation/native'
import {isString, time} from '@yoroi/common'
import {
  traitValueExpander,
  usePortfolioTokenDiscovery,
  usePortfolioTokenTraits,
} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Explorers, Network, Portfolio} from '@yoroi/types'
import React, {ReactNode, useState} from 'react'
import {
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import {useStrings} from '~/kernel/i18n/useStrings'

import {usePortfolioImageInvalidate} from '~/features/Portfolio/common/hooks/usePortfolioImage'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {NftRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Copiable} from '~/ui/Copiable/Copiable'
import {FadeIn} from '~/ui/FadeIn/FadeIn'
import {Hr} from '~/ui/Hr/Hr'
import {MediaPreview} from '~/ui/MediaPreview/MediaPreview'
import {Space} from '~/ui/Space/Space'
import {Tab, TabPanel, TabPanels, Tabs} from '~/ui/Tabs'
import {Text} from '~/ui/Text/Text'
import {useNavigateTo} from '../../common/navigation'

export const MediaDetailsScreen = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {track} = useMetrics()
  const {invalidate, isLoading} = usePortfolioImageInvalidate()

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  const {id} = useRoute<RouteProp<NftRoutes, 'nft-details'>>().params
  const {
    wallet: {networkManager, balances},
  } = useSelectedWallet()

  // reading from the getter, there is no need to subscribe to changes
  const amount = balances.records.get(id)

  // TODO: revisit + product definition (missing is gone state)
  if (!amount) return null

  const onRefresh = () => invalidate([amount.info.id])

  return (
    <FadeIn style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <SafeAreaView>
        <ScrollView
          contentContainerStyle={[{paddingHorizontal: imagePadding}]}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={isLoading} />
          }
        >
          <SelectableMedia info={amount.info} />

          <Tabs>
            <Tab
              onPress={() => {
                if (activeTab !== 'overview') {
                  setActiveTab('overview')
                  track.nftGalleryDetailsTab({nft_tab: 'Overview'})
                }
              }}
              label={strings.portfolio.overview}
              active={activeTab === 'overview'}
              testID="overview"
            />

            <Tab
              onPress={() => {
                if (activeTab !== 'metadata') {
                  setActiveTab('metadata')
                  track.nftGalleryDetailsTab({nft_tab: 'Metadata'})
                }
              }}
              label={strings.portfolio.info}
              active={activeTab === 'metadata'}
              testID="metadata"
            />
          </Tabs>

          <Boundary loading={{enabled: true}}>
            <Details
              info={amount.info}
              activeTab={activeTab}
              networkManager={networkManager}
            />
          </Boundary>
        </ScrollView>
      </SafeAreaView>
    </FadeIn>
  )
}

type DetailsProps = {
  info: Portfolio.Token.Info
  activeTab: ActiveTab
  networkManager: Network.Manager
}
const Details = ({activeTab, info, networkManager}: DetailsProps) => {
  const {tokenManager, network, explorers} = networkManager

  const {tokenDiscovery} = usePortfolioTokenDiscovery(
    {
      id: info.id,
      network,
      getTokenDiscovery: tokenManager.api.tokenDiscovery,
    },
    {
      staleTime: time.session,
    },
  )
  const {tokenTraits} = usePortfolioTokenTraits(
    {
      id: info.id,
      network,
      getTokenTraits: tokenManager.api.tokenTraits,
    },
    {
      staleTime: time.oneDay,
    },
  )

  // TODO: revisit + product definition (missing is gone state, error state, loading state)
  if (!tokenDiscovery) return null

  return (
    <TabPanels>
      <TabPanel active={activeTab === 'overview'}>
        <NftOverview info={info} explorers={explorers} traits={tokenTraits} />
      </TabPanel>

      <TabPanel active={activeTab === 'metadata'}>
        <NftMetadata discovery={tokenDiscovery} />
      </TabPanel>
    </TabPanels>
  )
}

const imageHeight = 380
const imagePadding = 16
const horizontalPadding = imagePadding * 2 // left and right

const SelectableMedia = ({info}: {info: Portfolio.Token.Info}) => {
  const {palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const dimensions = useWindowDimensions()
  const imageWidth = dimensions.width - horizontalPadding

  return (
    <TouchableOpacity
      onPress={() => navigateTo.nftZoom(info.id)}
      style={[{display: 'flex', flexDirection: 'row'}]}
    >
      <MediaPreview
        info={info}
        style={[{flexGrow: 1, backgroundColor: p.gray_100}]}
        height={imageHeight}
        width={imageWidth}
        contentFit="contain"
      />
    </TouchableOpacity>
  )
}

const MetadataRow = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => {
  const {palette: p} = useTheme()
  return (
    <View style={[{paddingVertical: imagePadding}]}>
      <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
        {title}
      </Text>

      <Space.Height._2xs />

      {children}
    </View>
  )
}

type NftOverviewProps = {
  info: Portfolio.Token.Info
  traits: Portfolio.Token.Traits | undefined
  explorers: Record<Explorers.Explorer, Explorers.Manager>
}
const NftOverview = ({info, explorers, traits}: NftOverviewProps) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const [policyId] = info.id.split('.')

  return (
    <View>
      <MetadataRow title={strings.portfolio.info}>
        <Text style={[a.body_2_md_regular, {color: p.gray_600}, a.flex_1]}>
          {info.name}
        </Text>
      </MetadataRow>

      <MetadataRow title={strings.portfolio.info}>
        <Text style={[a.body_2_md_regular, {color: p.gray_600}, a.flex_1]}>
          {normalizeMetadataString(info.description)}
        </Text>
      </MetadataRow>

      <MetadataRow title={strings.portfolio.fingerprint}>
        <Copiable title={info.fingerprint} text={info.fingerprint} />
      </MetadataRow>

      <MetadataRow title={strings.portfolio.policyID}>
        <Copiable title={policyId} text={policyId} />
      </MetadataRow>

      {traits?.traits.map((trait) => (
        <Trait key={`trait-${trait.type}`} trait={trait} />
      ))}

      <MetadataRow title={strings.portfolio.info}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(explorers.cardanoscan.token(info.fingerprint))
            }
            style={{flex: 2}}
          >
            <View
              style={[
                {
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: 'row',
                },
              ]}
            >
              <Space.Width._2xs />

              <Text
                style={[
                  a.link_1_lg_underline,
                  a.flex_1,
                  {color: p.primary_500},
                ]}
              >
                Cardanoscan
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(explorers.cexplorer.token(info.fingerprint))
            }
            style={{flex: 4}}
          >
            <View
              style={[
                {
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: 'row',
                },
              ]}
            >
              <Space.Width._2xs />

              <Text
                style={[
                  a.link_1_lg_underline,
                  a.flex_1,
                  {color: p.primary_500},
                ]}
              >
                Cexplorer
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </MetadataRow>

      <Hr />

      <Space.Height.lg />
    </View>
  )
}

const normalizeMetadataString = (content?: unknown): string => {
  return !isString(content) || content.length === 0 ? '-' : content
}

const Trait = ({trait}: {trait: Portfolio.Token.Trait}) => {
  const {palette: p} = useTheme()
  const expandedTraitValue = traitValueExpander(trait.value)
  const isOpenableLink =
    expandedTraitValue.type === 'link' &&
    isSupportedUrl(expandedTraitValue.transformedValue)

  return (
    <MetadataRow title={trait.type}>
      <View style={[a.flex_row, a.align_center, a.justify_between, a.gap_lg]}>
        {isOpenableLink && expandedTraitValue.type === 'link' ? (
          <View
            style={[
              {display: 'flex', alignItems: 'flex-start', flexDirection: 'row'},
              a.flex_1,
            ]}
          >
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(expandedTraitValue.transformedValue)
              }
            >
              <Text
                style={[
                  a.link_1_lg_underline,
                  a.flex_1,
                  {color: p.primary_500},
                ]}
              >
                {trait.value}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[a.body_2_md_regular, {color: p.gray_600}, a.flex_1]}>
            {trait.value}
          </Text>
        )}

        <Text
          style={[
            a.body_2_md_regular,
            a.text_right,
            {minWidth: 60, color: p.gray_600},
          ]}
        >
          {trait.rarity}
        </Text>
      </View>
    </MetadataRow>
  )
}

const NftMetadata = ({discovery}: {discovery: Portfolio.Token.Discovery}) => {
  const strings = useStrings()
  const stringifiedMetadata = JSON.stringify(
    discovery.originalMetadata,
    null,
    2,
  )

  return (
    <View>
      <Copiable
        title={strings.portfolio.nftDetail.copyMetadata}
        text={stringifiedMetadata}
      />

      <Space.Height.sm />

      <Text>{stringifiedMetadata}</Text>
    </View>
  )
}

const isSupportedUrl = (url: string) =>
  url.toLocaleLowerCase().startsWith('https')

type ActiveTab = 'overview' | 'metadata'
