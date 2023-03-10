import {RouteProp, useRoute} from '@react-navigation/native'
import React, {ReactNode, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {CopyButton, FadeIn, Icon, Link, Spacer, Text} from '../components'
import {Tab, TabPanel, TabPanels, Tabs} from '../components/Tabs'
import {MODERATING_NFTS_ENABLED} from '../legacy/config'
import {NftRoutes} from '../navigation'
import {useModeratedNftImage} from '../Nfts/hooks'
import {useNavigateTo} from '../Nfts/navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {useNft} from '../yoroi-wallets'
import {YoroiNft} from '../yoroi-wallets/types'
import placeholder from './../assets/img/nft-placeholder.png'

export const NftDetails = () => {
  const {id} = useRoute<RouteProp<NftRoutes, 'nft-details'>>().params
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const nft = useNft(wallet, {id})

  const [activeTab, setActiveTab] = useState<'overview' | 'metadata'>('overview')

  return (
    <FadeIn style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {MODERATING_NFTS_ENABLED ? <ModeratedNftImage nft={nft} /> : <UnModeratedNftImage nft={nft} />}

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
            <NftOverview nft={nft} />
          </TabPanel>

          <TabPanel active={activeTab === 'metadata'}>
            <NftMetadata nft={nft} />
          </TabPanel>
        </TabPanels>
      </ScrollView>
    </FadeIn>
  )
}

const UnModeratedNftImage = ({nft}: {nft: YoroiNft}) => {
  const navigateTo = useNavigateTo()
  return <NftImage source={{uri: nft.image}} onPress={() => navigateTo.nftZoom(nft.id)} />
}

const NftImage = ({
  source,
  onPress,
  disabled,
}: {
  source: ImageSourcePropType
  onPress?: () => void
  disabled?: boolean
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={styles.imageWrapper}>
      <Image source={source} style={styles.image} resizeMode="contain" />
    </TouchableOpacity>
  )
}

const ModeratedNftImage = ({nft}: {nft: YoroiNft}) => {
  const wallet = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const {moderationStatus} = useModeratedNftImage({wallet, fingerprint: nft.fingerprint})
  const canShowNft = moderationStatus === 'approved' || moderationStatus === 'consent'

  return (
    <NftImage
      source={canShowNft ? {uri: nft.image} : placeholder}
      onPress={() => navigateTo.nftZoom(nft.id)}
      disabled={!canShowNft}
    />
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

const NftOverview = ({nft}: {nft: YoroiNft}) => {
  const strings = useStrings()

  return (
    <View>
      <MetadataRow title={strings.nftName}>
        <Text secondary>{nft.name}</Text>
      </MetadataRow>

      <HR />

      <MetadataRow title={strings.description}>
        <Text secondary>{nft.description}</Text>
      </MetadataRow>

      <HR />

      <MetadataRow title={strings.author}>
        <Text secondary>{nft.metadata.originalMetadata.author ?? '-'}</Text>
      </MetadataRow>

      <HR />

      <MetadataRow title={strings.fingerprint} copyText={nft.fingerprint}>
        <Text secondary>{nft.fingerprint}</Text>
      </MetadataRow>

      <HR />

      <MetadataRow title={strings.policyId} copyText={nft.metadata.policyId}>
        <Text secondary>{nft.metadata.policyId}</Text>
      </MetadataRow>

      <HR />

      <MetadataRow title={strings.detailsLinks}>
        <Link url={`https://cardanoscan.io/token/${nft.fingerprint}`}>
          <View style={styles.linkContent}>
            <Icon.ExternalLink size={12} color={COLORS.SHELLEY_BLUE} />

            <Spacer width={2} />

            <Text style={styles.linkText}>Cardanoscan</Text>
          </View>
        </Link>

        <Link url={`https://cexplorer.io/asset/${nft.fingerprint}`}>
          <View style={styles.linkContent}>
            <Icon.ExternalLink size={12} color={COLORS.SHELLEY_BLUE} />

            <Spacer width={2} />

            <Text style={styles.linkText}>Cexplorer</Text>
          </View>
        </Link>
      </MetadataRow>

      <HR />

      <Spacer height={24} />
    </View>
  )
}

const HR = () => (
  <View
    style={{
      borderBottomWidth: 1,
      borderColor: 'rgba(173, 174, 182, 0.3)',
    }}
  />
)

const NftMetadata = ({nft}: {nft: YoroiNft}) => {
  const strings = useStrings()
  const stringifiedMetadata = JSON.stringify(nft, undefined, 2)

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
  image: {
    height: 380,
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  rowContainer: {
    paddingVertical: 16,
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
