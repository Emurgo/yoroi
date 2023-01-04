import {useNavigation, useRoute} from '@react-navigation/native'
import React, {ReactNode, useEffect, useMemo, useState} from 'react'
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

type Params = {id: string}

export const NftDetails = () => {
  const wallet = useSelectedWallet()
  const {nfts} = useNfts(wallet)
  const transactionsInfo = useTransactionInfos(wallet)

  const navigation = useNavigation<NftDetailsNavigation>()
  const [activeTab, setActiveTab] = useState<VIEW_TABS>('overview')
  const {id} = useRoute().params as Params
  const nft = nfts.find((nft) => nft.id === id)
  const stringifiedMetadata = JSON.stringify(nft, undefined, 2)
  const fingerprint = useMemo(
    () => (nft ? getAssetFingerprint(nft.metadata.policyId, nft.metadata.assetNameHex) : null),
    [nft],
  )

  const matchingTransaction = Object.values(transactionsInfo).find((t) => Object.keys(t.tokens).includes(id))
  const transactionUpdatedAt = matchingTransaction?.submittedAt ?? null
  const formattedTime = transactionUpdatedAt !== null ? getPrettyDate(new Date(transactionUpdatedAt)) : null

  useTitle('NFT Details')

  const onFullscreen = () => navigation.navigate('nft-details-image', {id})

  if (!nft) {
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
              label="Overview"
              active={activeTab === 'overview'}
              testID="overview"
            />
            <Tab
              onPress={() => setActiveTab('metadata')}
              label="Metadata"
              active={activeTab === 'metadata'}
              testID="metadata"
            />
          </Tabs>

          <TabPanels>
            <TabPanel active={activeTab === 'overview'}>
              <MetadataRow title="NFT Name" content={<Text secondary>{nft.name}</Text>} />
              <MetadataRow title="Created" content={<Text secondary>{formattedTime}</Text>} />
              <MetadataRow title="Description" content={<Text secondary>{nft.description}</Text>} />
              <MetadataRow
                title="Author"
                content={<Text secondary>{nft.metadata.originalMetadata.author ?? '-'}</Text>}
              />
              {/* <MetadataRow title="Collection name" content={<Text secondary>{nft.name}</Text>} /> */}
              <MetadataRow
                title="Fingerprint"
                content={<Text secondary>{fingerprint ?? '-'}</Text>}
                withCopy
                copyText={fingerprint ?? '-'}
              />
              <MetadataRow
                title="Policy id"
                content={<Text secondary>{nft.metadata.policyId}</Text>}
                withCopy
                copyText={nft.metadata.policyId}
              />
              <MetadataRow
                title="Details on"
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
                  <Text style={styles.copyText}>COPY METADATA</Text>
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

const useTitle = (text: string) => {
  const navigation = useNavigation()
  useEffect(() => navigation.setOptions({title: text}), [navigation, text])
}
