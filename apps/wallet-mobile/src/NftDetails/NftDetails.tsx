import {RouteProp, useRoute} from '@react-navigation/native'
import {isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import React, {ReactNode, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Linking, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View} from 'react-native'

import {CopyButton, FadeIn, Spacer, Text} from '../components'
import {Tab, TabPanel, TabPanels, Tabs} from '../components/Tabs'
import {MediaPreview} from '../features/Portfolio/common/MediaGallery/MediaPreview'
import {useSelectedWallet} from '../features/WalletManager/Context'
import {useMetrics} from '../metrics/metricsManager'
import {NftRoutes} from '../navigation'
import {useNavigateTo} from '../Nfts/navigation'
import {getNetworkConfigById} from '../yoroi-wallets/cardano/networks'

export const NftDetails = () => {
  const styles = useStyles()
  const strings = useStrings()
  const {track} = useMetrics()

  const [activeTab, setActiveTab] = useState<'overview' | 'metadata'>('overview')

  const {id} = useRoute<RouteProp<NftRoutes, 'nft-details'>>().params
  const wallet = useSelectedWallet()

  // TODO: revisit (missing refresh mechanism)
  // reading from the getter, there is no need to subscribe to changes
  // until implementation of the new refresh mechanism in here
  const amount = wallet.balances.records.get(id)

  // record can be gone when arriving here, need a state
  // TODO: revisit + product definition (missing is gone state)
  if (!amount) return null

  return (
    <FadeIn style={styles.container}>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.contentContainer}>
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

          <TabPanels>
            <TabPanel active={activeTab === 'overview'}>
              <NftOverview info={amount.info} />
            </TabPanel>

            <TabPanel active={activeTab === 'metadata'}>
              <NftMetadata info={amount.info} />
            </TabPanel>
          </TabPanels>
        </ScrollView>
      </SafeAreaView>
    </FadeIn>
  )
}

const imageHeight = 380
const imagePadding = 16

const SelectableMedia = ({info}: {info: Portfolio.Token.Info}) => {
  const styles = useStyles()
  const navigateTo = useNavigateTo()
  const dimensions = useWindowDimensions()
  const imageWidth = dimensions.width - imagePadding * 2

  return (
    <TouchableOpacity onPress={() => navigateTo.nftZoom(info.id)} style={styles.imageWrapper}>
      <MediaPreview info={info} style={styles.image} height={imageHeight} width={imageWidth} contentFit="contain" />
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

// TODO: revisit (missing hit the discovery and product screen)
const NftOverview = ({info}: {info: Portfolio.Token.Info}) => {
  const styles = useStyles()
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const config = getNetworkConfigById(wallet.networkId)

  const [policyId] = info.id.split('.')

  return (
    <View>
      <MetadataRow title={strings.nftName}>
        <Text style={styles.name}>{info.name}</Text>
      </MetadataRow>

      <MetadataRow title={strings.description}>
        <Text style={styles.name}>{normalizeMetadataString(info.description)}</Text>
      </MetadataRow>

      {/* {isRecord(info.metadatas.mintNft) && (
        <MetadataRow title={strings.author}>
          <Text style={styles.name}>{normalizeMetadataString(info.metadatas.mintNft.author)}</Text>
        </MetadataRow>
      )} */}

      <MetadataRow title={strings.fingerprint} copyText={info.fingerprint}>
        <Text style={styles.name}>{info.fingerprint}</Text>
      </MetadataRow>

      <MetadataRow title={strings.policyId} copyText={policyId}>
        <Text style={styles.name}>{policyId}</Text>
      </MetadataRow>

      <MetadataRow title={strings.detailsLinks}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity onPress={() => Linking.openURL(config.EXPLORER_URL_FOR_TOKEN(info.id))} style={{flex: 2}}>
            <View style={styles.linkContent}>
              <Spacer width={2} />

              <Text style={styles.linkText}>Cardanoscan</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL(config.CEXPLORER_URL_FOR_TOKEN(info.id))} style={{flex: 4}}>
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

// TODO: revisit (missing hit the discovery and product screen)
const NftMetadata = ({info}: {info: Portfolio.Token.Info}) => {
  const styles = useStyles()
  const strings = useStrings()
  // const stringifiedMetadata = JSON.stringify(info.metadatas.mintNft, undefined, 2)
  const stringifiedMetadata = info.name

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
      paddingHorizontal: imagePadding,
    },
    rowContainer: {
      paddingVertical: imagePadding,
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
