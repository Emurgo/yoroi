/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation, useRoute} from '@react-navigation/native'
import React, {ReactNode, useEffect, useState} from 'react'
// import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {CopyButton, FadeIn, OfflineBanner, StatusBar, Text} from '../components'
import {Tab, TabPanel, TabPanels, Tabs} from '../components/Tabs'
// import globalMessages from '../i18n/global-messages'
// import {useSelectedWallet} from '../SelectedWallet'
import {mockNFTs} from './Nfts'

const VIEW_TABS = {
  OVERVIEW: {
    id: 'nftOverviewTabButton',
  },
  METADATA: {
    id: 'nftMetadataTabButton',
  },
}

type Params = {id: string}

export const NftDetails = () => {
  // const strings = useStrings()
  // const intl = useIntl()
  // const wallet = useSelectedWallet()
  const [activeTab, setActiveTab] = useState(VIEW_TABS.OVERVIEW.id)
  const {id} = useRoute().params as Params
  const nft = mockNFTs[id] ?? {}
  const stringifiedMetadata = JSON.stringify(nft, undefined, 2)

  useTitle('NFT Details')

  return (
    <FadeIn style={styles.container}>
      <StatusBar type="dark" />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image source={nft.image} style={styles.image} />
        </View>
        <View style={styles.tabsContainer}>
          <Tabs>
            <Tab
              onPress={() => setActiveTab(VIEW_TABS.OVERVIEW.id)}
              label="Overview"
              active={activeTab === VIEW_TABS.OVERVIEW.id}
              testID={VIEW_TABS.OVERVIEW.id}
            />
            <Tab //
              onPress={() => setActiveTab(VIEW_TABS.METADATA.id)}
              label="Metadata"
              active={activeTab === VIEW_TABS.METADATA.id}
              testID={VIEW_TABS.METADATA.id}
            />
          </Tabs>

          <TabPanels>
            <TabPanel active={activeTab === VIEW_TABS.OVERVIEW.id}>
              <MetadataRow title="NFT Name" content={nft.text} />
              <MetadataRow title="Created" content={nft.text} />
              <MetadataRow title="Description" content={nft.text} />
              <MetadataRow title="Author" content={nft.text} />
              <MetadataRow title="Collection name" content={nft.text} />
              <MetadataRow title="Fingerprint" content={nft.text} withCopy />
              <MetadataRow title="Policy id" content={nft.text} withCopy />
              <MetadataRow title="Details on" content={nft.text} />
            </TabPanel>
            <TabPanel active={activeTab === VIEW_TABS.METADATA.id}>
              <View style={styles.metadataTab}>
                <View style={styles.copyMetadata}>
                  <CopyButton value={stringifiedMetadata} />
                  <Text>COPY METADATA</Text>
                </View>
                <Text>{stringifiedMetadata}</Text>
              </View>
            </TabPanel>
          </TabPanels>
        </View>
      </ScrollView>
    </FadeIn>
  )
}

const MetadataRow = ({title, content, withCopy = false}: {title: string; content: string; withCopy?: boolean}) => {
  return (
    <View style={styles.rowContainer}>
      <View style={styles.rowTitleContainer}>
        <Text style={styles.rowTitleText}>{title}</Text>
        {withCopy && <CopyButton value={content} />}
      </View>
      <Text secondary>{content}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: 380,
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
    marginBottom: 2,
  },
  rowTitleText: {},
  metadataTab: {
    paddingVertical: 34,
  },
  copyMetadata: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
})

const useTitle = (text: string) => {
  const navigation = useNavigation()
  useEffect(() => navigation.setOptions({title: text}))
}
