import {RouteProp, useRoute} from '@react-navigation/native'
import {isString} from '@yoroi/common'
import {traitValueExpander, usePortfolioTokenDiscovery, usePortfolioTokenTraits} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Explorers, Network, Portfolio} from '@yoroi/types'
import React, {ReactNode, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'

import {Boundary} from '../../../../components/Boundary/Boundary'
import {CopyButton} from '../../../../components/CopyButton'
import {FadeIn} from '../../../../components/FadeIn'
import {Hr} from '../../../../components/Hr/Hr'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {Tab, TabPanel, TabPanels, Tabs} from '../../../../components/Tabs/Tabs'
import {Text} from '../../../../components/Text'
import {time} from '../../../../kernel/constants'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {NftRoutes} from '../../../../kernel/navigation'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioImageInvalidate} from '../hooks/usePortfolioImage'
import {MediaPreview} from '../MediaPreview/MediaPreview'
import {useNavigateTo} from '../navigation'

export const MediaDetailsScreen = () => {
  const styles = useStyles()
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
    <FadeIn style={styles.container}>
      <SafeAreaView>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isLoading} />}
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
              label={strings.overview}
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
              label={strings.metadata}
              active={activeTab === 'metadata'}
              testID="metadata"
            />
          </Tabs>

          <Boundary loading={{enabled: true}}>
            <Details info={amount.info} activeTab={activeTab} networkManager={networkManager} />
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
  const styles = useStyles()
  const navigateTo = useNavigateTo()
  const dimensions = useWindowDimensions()
  const imageWidth = dimensions.width - horizontalPadding

  return (
    <TouchableOpacity onPress={() => navigateTo.nftZoom(info.id)} style={styles.imageWrapper}>
      <MediaPreview info={info} style={styles.image} height={imageHeight} width={imageWidth} contentFit="contain" />
    </TouchableOpacity>
  )
}

const MetadataRow = ({title, children}: {title: string; children: ReactNode}) => {
  const styles = useStyles()
  return (
    <View style={styles.rowContainer}>
      <Text style={styles.title}>{title}</Text>

      <Spacer height={4} />

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
  const styles = useStyles()
  const strings = useStrings()

  const [policyId] = info.id.split('.')

  return (
    <View>
      <MetadataRow title={strings.nftName}>
        <Text style={styles.name}>{info.name}</Text>
      </MetadataRow>

      <MetadataRow title={strings.description}>
        <Text style={styles.name}>{normalizeMetadataString(info.description)}</Text>
      </MetadataRow>

      <MetadataRow title={strings.fingerprint}>
        <CopyButton title={info.fingerprint} value={info.fingerprint} />
      </MetadataRow>

      <MetadataRow title={strings.policyId}>
        <CopyButton title={policyId} value={policyId} />
      </MetadataRow>

      {traits?.traits.map((trait) => (
        <Trait key={`trait-${trait.type}`} trait={trait} />
      ))}

      <MetadataRow title={strings.detailsLinks}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity
            onPress={() => Linking.openURL(explorers.cardanoscan.token(info.fingerprint))}
            style={{flex: 2}}
          >
            <View style={styles.linkContent}>
              <Spacer width={2} />

              <Text style={styles.linkText}>Cardanoscan</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL(explorers.cexplorer.token(info.fingerprint))}
            style={{flex: 4}}
          >
            <View style={styles.linkContent}>
              <Spacer width={2} />

              <Text style={styles.linkText}>Cexplorer</Text>
            </View>
          </TouchableOpacity>
        </View>
      </MetadataRow>

      <Hr />

      <Spacer height={24} />
    </View>
  )
}

const normalizeMetadataString = (content?: unknown): string => {
  return !isString(content) || content.length === 0 ? '-' : content
}

const Trait = ({trait}: {trait: Portfolio.Token.Trait}) => {
  const styles = useStyles()
  const expandedTraitValue = traitValueExpander(trait.value)
  const isOpenableLink = expandedTraitValue.type === 'link' && isSupportedUrl(expandedTraitValue.transformedValue)

  return (
    <MetadataRow title={trait.type}>
      <View style={styles.rowBetween}>
        {isOpenableLink && expandedTraitValue.type === 'link' ? (
          <View style={[styles.linkContent, styles.flex]}>
            <TouchableOpacity onPress={() => Linking.openURL(expandedTraitValue.transformedValue)}>
              <Text style={styles.linkText}>{trait.value}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.name}>{trait.value}</Text>
        )}

        <Text style={styles.rarity}>{trait.rarity}</Text>
      </View>
    </MetadataRow>
  )
}

const NftMetadata = ({discovery}: {discovery: Portfolio.Token.Discovery}) => {
  const styles = useStyles()
  const strings = useStrings()
  const stringifiedMetadata = JSON.stringify(discovery.originalMetadata, null, 2)

  return (
    <View>
      <View style={styles.copyMetadata}>
        <CopyButton title={strings.copyMetadata} value={stringifiedMetadata} style={styles.copyButton} />
      </View>

      <Spacer height={14} />

      <Text>{stringifiedMetadata}</Text>
    </View>
  )
}

const isSupportedUrl = (url: string) => url.toLocaleLowerCase().startsWith('https')

type ActiveTab = 'overview' | 'metadata'

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    flex: {
      ...atoms.flex_1,
    },
    copyButton: {
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    linkContent: {
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'row',
    },
    linkText: {
      color: color.primary_500,
      ...atoms.link_1_lg_underline,
      ...atoms.flex_1,
    },
    container: {
      flex: 1,
      backgroundColor: color.bg_color_max,
    },
    image: {
      flexGrow: 1,
      backgroundColor: color.gray_100,
    },
    contentContainer: {
      paddingHorizontal: imagePadding,
    },
    rowContainer: {
      paddingVertical: imagePadding,
    },
    rowBetween: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_between,
      ...atoms.gap_lg,
    },
    copyMetadata: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageWrapper: {
      display: 'flex',
      flexDirection: 'row',
    },
    title: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    name: {
      color: color.gray_600,
      ...atoms.body_2_md_regular,
      ...atoms.flex_1,
    },
    rarity: {
      minWidth: 60,
      color: color.gray_600,
      ...atoms.body_2_md_regular,
      ...atoms.text_right,
    },
  })
  return styles
}

const messages = defineMessages({
  title: {
    id: 'nft.detail.title',
    defaultMessage: '!!!NFT Details',
  },
  overview: {
    id: 'nft.detail.overview',
    defaultMessage: '!!!Overview',
  },
  metadata: {
    id: 'nft.detail.metadata',
    defaultMessage: '!!!Metadata',
  },
  nftName: {
    id: 'nft.detail.nftName',
    defaultMessage: '!!!NFT Name',
  },
  createdAt: {
    id: 'nft.detail.createdAt',
    defaultMessage: '!!!Created',
  },
  description: {
    id: 'nft.detail.description',
    defaultMessage: '!!!Description',
  },
  author: {
    id: 'nft.detail.author',
    defaultMessage: '!!!Author',
  },
  fingerprint: {
    id: 'nft.detail.fingerprint',
    defaultMessage: '!!!Fingerprint',
  },
  policyId: {
    id: 'nft.detail.policyId',
    defaultMessage: '!!!Policy id',
  },
  detailsLinks: {
    id: 'nft.detail.detailsLinks',
    defaultMessage: '!!!Details on',
  },
  copyMetadata: {
    id: 'nft.detail.copyMetadata',
    defaultMessage: '!!!Copy metadata',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    overview: intl.formatMessage(messages.overview),
    metadata: intl.formatMessage(messages.metadata),
    nftName: intl.formatMessage(messages.nftName),
    createdAt: intl.formatMessage(messages.createdAt),
    description: intl.formatMessage(messages.description),
    author: intl.formatMessage(messages.author),
    fingerprint: intl.formatMessage(messages.fingerprint),
    policyId: intl.formatMessage(messages.policyId),
    detailsLinks: intl.formatMessage(messages.detailsLinks),
    copyMetadata: intl.formatMessage(messages.copyMetadata),
  }
}
