import {RouteProp, useRoute} from '@react-navigation/native'
import {isRecord, isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import React, {ReactNode, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {
  Dimensions,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import {CopyButton, FadeIn, Spacer, Text} from '../components'
import {NftPreview} from '../components/NftPreview'
import {Tab, TabPanel, TabPanels, Tabs} from '../components/Tabs'
import {features} from '../features'
import {useSelectedWallet} from '../features/WalletManager/Context'
import {useMetrics} from '../metrics/metricsManager'
import {NftRoutes} from '../navigation'
import {useModeratedNftImage} from '../Nfts/hooks'
import {useNavigateTo} from '../Nfts/navigation'
import {getNetworkConfigById} from '../yoroi-wallets/cardano/networks'
import {useNativeAssetInvalidation, useNft} from '../yoroi-wallets/hooks'

export const NftDetails = () => {
  const {id} = useRoute<RouteProp<NftRoutes, 'nft-details'>>().params
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const nft = useNft(wallet, {id})
  const [policy, name] = nft.id.split('.')
  const [activeTab, setActiveTab] = useState<'overview' | 'metadata'>('overview')
  const {track} = useMetrics()
  const {invalidate, isLoading} = useNativeAssetInvalidation({networkId: wallet.networkId, policy, name})

  return (
    <FadeIn style={styles.container}>
      <SafeAreaView>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl onRefresh={invalidate} refreshing={isLoading} />}
        >
          {features.moderatingNftsEnabled ? <ModeratedNftImage nft={nft} /> : <UnModeratedNftImage nft={nft} />}

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

          <TabPanels>
            <TabPanel active={activeTab === 'overview'}>
              <NftOverview nft={nft} />
            </TabPanel>

            <TabPanel active={activeTab === 'metadata'}>
              <NftMetadata nft={nft} />
            </TabPanel>
          </TabPanels>
        </ScrollView>
      </SafeAreaView>
    </FadeIn>
  )
}

const UnModeratedNftImage = ({nft}: {nft: Balance.TokenInfo}) => {
  const styles = useStyles()
  const navigateTo = useNavigateTo()
  return (
    <TouchableOpacity onPress={() => navigateTo.nftZoom(nft.id)} style={styles.imageWrapper}>
      <NftPreview nft={nft} style={styles.image} height={IMAGE_HEIGHT} width={IMAGE_WIDTH} contentFit="contain" />
    </TouchableOpacity>
  )
}

const ModeratedNftImage = ({nft}: {nft: Balance.TokenInfo}) => {
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const {status} = useModeratedNftImage({wallet, fingerprint: nft.fingerprint})
  const canShowNft = status === 'approved' || status === 'consent'

  if (!canShowNft) {
    return (
      <View style={styles.imageWrapper}>
        <NftPreview nft={nft} style={styles.image} height={IMAGE_HEIGHT} width={IMAGE_WIDTH} showPlaceholder />
      </View>
    )
  }

  return (
    <TouchableOpacity onPress={() => navigateTo.nftZoom(nft.id)} style={styles.imageWrapper}>
      <NftPreview nft={nft} style={styles.image} height={IMAGE_HEIGHT} width={IMAGE_WIDTH} contentFit="contain" />
    </TouchableOpacity>
  )
}

const MetadataRow = ({title, copyText, children}: {title: string; children: ReactNode; copyText?: string}) => {
  const styles = useStyles()
  return (
    <View style={styles.rowContainer}>
      <View style={styles.rowTitleContainer}>
        <Text style={styles.title}>{title}</Text>

        {copyText !== undefined ? <CopyButton value={copyText} /> : null}
      </View>

      <Spacer height={4} />

      {children}
    </View>
  )
}

const NftOverview = ({nft}: {nft: Balance.TokenInfo}) => {
  const styles = useStyles()
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const config = getNetworkConfigById(wallet.networkId)

  return (
    <View>
      <MetadataRow title={strings.nftName}>
        <Text style={styles.name}>{nft.name}</Text>
      </MetadataRow>

      <MetadataRow title={strings.description}>
        <Text style={styles.name}>{normalizeMetadataString(nft.description)}</Text>
      </MetadataRow>

      {isRecord(nft.metadatas.mintNft) && (
        <MetadataRow title={strings.author}>
          <Text style={styles.name}>{normalizeMetadataString(nft.metadatas.mintNft.author)}</Text>
        </MetadataRow>
      )}

      <MetadataRow title={strings.fingerprint} copyText={nft.fingerprint}>
        <Text style={styles.name}>{nft.fingerprint}</Text>
      </MetadataRow>

      <MetadataRow title={strings.policyId} copyText={nft.group}>
        <Text style={styles.name}>{nft.group}</Text>
      </MetadataRow>

      <MetadataRow title={strings.detailsLinks}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity onPress={() => Linking.openURL(config.EXPLORER_URL_FOR_TOKEN(nft.id))} style={{flex: 2}}>
            <View style={styles.linkContent}>
              <Spacer width={2} />

              <Text style={styles.linkText}>Cardanoscan</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL(config.CEXPLORER_URL_FOR_TOKEN(nft.id))} style={{flex: 4}}>
            <View style={styles.linkContent}>
              <Spacer width={2} />

              <Text style={styles.linkText}>Cexplorer</Text>
            </View>
          </TouchableOpacity>
        </View>
      </MetadataRow>

      <HR />

      <Spacer height={24} />
    </View>
  )
}

const normalizeMetadataString = (content?: unknown): string => {
  return !isString(content) || content.length === 0 ? '-' : content
}

const HR = () => (
  <View
    style={{
      borderBottomWidth: 1,
      borderColor: 'rgba(173, 174, 182, 0.3)',
    }}
  />
)

const NftMetadata = ({nft}: {nft: Balance.TokenInfo}) => {
  const styles = useStyles()
  const strings = useStrings()
  const stringifiedMetadata = JSON.stringify(nft.metadatas.mintNft, undefined, 2)

  return (
    <View>
      <View style={styles.copyMetadata}>
        <CopyButton value={stringifiedMetadata} style={styles.copyButton}>
          <Text style={styles.copyText}>{strings.copyMetadata}</Text>
        </CopyButton>
      </View>

      <Spacer height={14} />

      <Text>{stringifiedMetadata}</Text>
    </View>
  )
}

const IMAGE_HEIGHT = 380
const IMAGE_PADDING = 16
const IMAGE_WIDTH = Dimensions.get('window').width - IMAGE_PADDING * 2

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
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
      color: color.primary_c500,
      ...atoms.body_1_lg_regular,
      flex: 1,
      textDecorationLine: 'underline',
    },
    copyText: {
      color: color.gray_c900,
      ...atoms.body_2_md_medium,
      textTransform: 'uppercase',
    },
    container: {
      flex: 1,
    },
    image: {
      flexGrow: 1,
    },
    contentContainer: {
      paddingHorizontal: IMAGE_PADDING,
    },
    rowContainer: {
      paddingVertical: IMAGE_PADDING,
    },
    rowTitleContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
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
    },
    name: {
      color: color.gray_c600,
      ...atoms.body_2_md_regular,
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
