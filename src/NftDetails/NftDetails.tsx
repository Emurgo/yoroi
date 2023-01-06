import {useNavigation} from '@react-navigation/native'
import React, {ReactNode, useMemo, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {getPrettyDate} from '../../tests/helpers/utils'
import {CopyButton, FadeIn, Icon, Link, OfflineBanner, Spacer, StatusBar, Text} from '../components'
import {Tab, TabPanel, TabPanels, Tabs} from '../components/Tabs'
import {useNfts, useTransactionInfos} from '../hooks'
import {getAssetFingerprint} from '../legacy/format'
import {NftDetailsNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'

type VIEW_TABS = 'overview' | 'metadata'

type Props = {route: {params: {id: string}}}

export const NftDetails = ({
  route: {
    params: {id},
  },
}: Props) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {nfts} = useNfts(wallet)
  const transactionsInfo = useTransactionInfos(wallet)

  const navigation = useNavigation<NftDetailsNavigation>()
  const [activeTab, setActiveTab] = useState<VIEW_TABS>('overview')
  const nft = nfts.find((nft) => nft.id === id)
  const stringifiedMetadata = JSON.stringify(nft, undefined, 2)
  const fingerprint = useMemo(
    () => (nft !== undefined ? getAssetFingerprint(nft.metadata.policyId, nft.metadata.assetNameHex) : null),
    [nft],
  )

  const matchingTransaction = Object.values(transactionsInfo).find((t) => Object.keys(t.tokens).includes(id))
  const transactionUpdatedAt = matchingTransaction?.submittedAt ?? null
  const formattedTime = transactionUpdatedAt !== null ? getPrettyDate(new Date(transactionUpdatedAt)) : null

  const onFullscreen = () => navigation.navigate('nft-details-image', {id})

  if (nft === undefined) {
    return null
  }

  return (
    <FadeIn style={styles.container}>
      <StatusBar type="dark" />
      <OfflineBanner />

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
              <MetadataRow title={strings.nftName} content={<Text secondary>{nft.name}</Text>} />
              <MetadataRow title={strings.createdAt} content={<Text secondary>{formattedTime}</Text>} />
              <MetadataRow title={strings.description} content={<Text secondary>{nft.description}</Text>} />
              <MetadataRow
                title={strings.author}
                content={<Text secondary>{nft.metadata.originalMetadata.author ?? '-'}</Text>}
              />
              <MetadataRow
                title={strings.fingerprint}
                content={<Text secondary>{fingerprint ?? '-'}</Text>}
                withCopy
                copyText={fingerprint ?? '-'}
              />
              <MetadataRow
                title={strings.policyId}
                content={<Text secondary>{nft.metadata.policyId}</Text>}
                withCopy
                copyText={nft.metadata.policyId}
              />
              <MetadataRow
                title={strings.detailsLinks}
                content={
                  <>
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
                  </>
                }
              />
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

const MetadataRow = ({
  title,
  copyText,
  content,
  withCopy = false,
}: {
  title: string
  withCopy?: boolean
  content: ReactNode
  copyText?: string
}) => {
  return (
    <View style={styles.rowContainer}>
      <View style={styles.rowTitleContainer}>
        <Text>{title}</Text>
        {withCopy && copyText && <CopyButton value={copyText} />}
      </View>
      <Spacer height={2} />
      {content}
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
  imageContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
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
    id: 'components.nftDetails.title',
    defaultMessage: '!!!NFT Details',
  },
  overview: {
    id: 'components.nftDetails.overview',
    defaultMessage: '!!!Overview',
  },
  metadata: {
    id: 'components.nftDetails.metadata',
    defaultMessage: '!!!Metadata',
  },
  nftName: {
    id: 'components.nftDetails.nftName',
    defaultMessage: '!!!NFT Name',
  },
  createdAt: {
    id: 'components.nftDetails.createdAt',
    defaultMessage: '!!!Created',
  },
  description: {
    id: 'components.nftDetails.description',
    defaultMessage: '!!!Description',
  },
  author: {
    id: 'components.nftDetails.author',
    defaultMessage: '!!!Author',
  },
  fingerprint: {
    id: 'components.nftDetails.fingerprint',
    defaultMessage: '!!!Fingerprint',
  },
  policyId: {
    id: 'components.nftDetails.policyId',
    defaultMessage: '!!!Policy id',
  },
  detailsLinks: {
    id: 'components.nftDetails.detailsLinks',
    defaultMessage: '!!!Details on',
  },
  copyMetadata: {
    id: 'components.nftDetails.copyMetadata',
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
