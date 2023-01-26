import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {ReactNode, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {CopyButton, FadeIn, Icon, Link, Spacer, Text} from '../components'
import {Tab, TabPanel, TabPanels, Tabs} from '../components/Tabs'
import {useNft} from '../hooks'
import {getAssetFingerprint} from '../legacy/format'
import {NftDetailsNavigation, NftRoutes} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {YoroiNft} from '../yoroi-wallets/types'

type ViewTabs = 'overview' | 'metadata'

export const NftDetails = () => {
  const {id} = useRoute<RouteProp<NftRoutes, 'nft-details'>>().params
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const navigation = useNavigation<NftDetailsNavigation>()
  const [activeTab, setActiveTab] = useState<ViewTabs>('overview')
  const nft = useNft(wallet, {id})

  const stringifiedMetadata = JSON.stringify(nft, undefined, 2)

  const onFullscreen = () => navigation.navigate('nft-details-image', {id})

  return (
    <FadeIn style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={onFullscreen}>
            <Image source={{uri: nft.image}} style={styles.image} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <Tabs>
            <Tab
              onPress={() => setActiveTab('overview')}
              label={strings.overview}
              active={activeTab === 'overview'}
              testID="overview"
            />
            <Tab
              onPress={() => setActiveTab('metadata')}
              label={strings.metadata}
              active={activeTab === 'metadata'}
              testID="metadata"
            />
          </Tabs>

          <TabPanels>
            <TabPanel active={activeTab === 'overview'}>
              <NftMetadataPanel nft={nft} />
            </TabPanel>

            <TabPanel active={activeTab === 'metadata'}>
              <View style={styles.copyMetadata}>
                <CopyButton value={stringifiedMetadata} style={styles.copyButton}>
                  <Text style={styles.copyText}>{strings.copyMetadata}</Text>
                </CopyButton>
              </View>
              <Spacer height={14} />

              <Text>{stringifiedMetadata}</Text>
            </TabPanel>
          </TabPanels>
        </View>
      </ScrollView>
    </FadeIn>
  )
}

const MetadataRow = ({title, copyText, children}: {title: string; children: ReactNode; copyText?: string}) => {
  return (
    <View style={styles.rowContainer}>
      <View style={styles.rowTitleContainer}>
        <Text>{title}</Text>
        {copyText !== undefined ? <CopyButton value={copyText} /> : null}
      </View>
      <Spacer height={2} />
      {children}
    </View>
  )
}

const NftMetadataPanel = ({nft}: {nft: YoroiNft}) => {
  const strings = useStrings()
  const fingerprint = getAssetFingerprint(nft.metadata.policyId, nft.metadata.assetNameHex)

  return (
    <>
      <MetadataRow title={strings.nftName}>
        <Text secondary>{nft.name}</Text>
      </MetadataRow>
      <MetadataRow title={strings.description}>
        <Text secondary>{nft.description}</Text>
      </MetadataRow>
      <MetadataRow title={strings.author}>
        <Text secondary>{nft.metadata.originalMetadata.author ?? '-'}</Text>
      </MetadataRow>
      <MetadataRow title={strings.fingerprint} copyText={fingerprint}>
        <Text secondary>{fingerprint}</Text>
      </MetadataRow>
      <MetadataRow title={strings.policyId} copyText={nft.metadata.policyId}>
        <Text secondary>{nft.metadata.policyId}</Text>
      </MetadataRow>
      <MetadataRow title={strings.detailsLinks}>
        <View>
          <Link url={`https://cardanoscan.io/token/${fingerprint}`}>
            <View style={styles.linkContent}>
              <Icon.ExternalLink size={12} color={COLORS.SHELLEY_BLUE} />
              <Spacer width={2} />
              <Text style={styles.linkText}>Cardanoscan</Text>
            </View>
          </Link>
        </View>
        <View>
          <Link url={`https://cexplorer.io/asset/${fingerprint}`}>
            <View style={styles.linkContent}>
              <Icon.ExternalLink size={12} color={COLORS.SHELLEY_BLUE} />
              <Spacer width={2} />
              <Text style={styles.linkText}>Cexplorer</Text>
            </View>
          </Link>
        </View>
      </MetadataRow>
    </>
  )
}

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
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  linkText: {
    flex: 1,
    fontWeight: 'bold',
    textDecorationLine: 'none',
    color: COLORS.SHELLEY_BLUE,
  },
  copyText: {
    fontWeight: 'bold',
    color: '#242838',
    textTransform: 'uppercase',
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
    height: 380,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  tabsContainer: {flex: 1},
  rowContainer: {
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderColor: 'rgba(173, 174, 182, 0.3)',
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
})

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
