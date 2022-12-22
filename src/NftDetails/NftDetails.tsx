import {useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {CopyButton, FadeIn, OfflineBanner, Spacer, StatusBar, Text} from '../components'
import {Tab, TabPanel, TabPanels, Tabs} from '../components/Tabs'
import {useNfts} from '../hooks'
import {NftDetailsNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'

enum VIEW_TABS {
  OVERVIEW = 'OVERVIEW',
  METADATA = 'METADATA',
}

type Params = {id: string}

export const NftDetails = () => {
  const wallet = useSelectedWallet()
  const {nfts} = useNfts(wallet)

  const navigation = useNavigation<NftDetailsNavigation>()
  const [activeTab, setActiveTab] = useState<VIEW_TABS>(VIEW_TABS.OVERVIEW)
  const {id} = useRoute().params as Params
  const nft = nfts.find((nft) => nft.id === id)
  const stringifiedMetadata = JSON.stringify(nft, undefined, 2)

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
              onPress={() => setActiveTab(VIEW_TABS.OVERVIEW)}
              label="Overview"
              active={activeTab === VIEW_TABS.OVERVIEW}
              testID={VIEW_TABS.OVERVIEW}
            />
            <Tab
              onPress={() => setActiveTab(VIEW_TABS.METADATA)}
              label="Metadata"
              active={activeTab === VIEW_TABS.METADATA}
              testID={VIEW_TABS.METADATA}
            />
          </Tabs>

          <TabPanels>
            <TabPanel active={activeTab === VIEW_TABS.OVERVIEW}>
              <MetadataRow title="NFT Name" content={nft.name} />
              <MetadataRow title="Created" content={nft.name} />
              <MetadataRow title="Description" content={nft.name} />
              <MetadataRow title="Author" content={nft.name} />
              <MetadataRow title="Collection name" content={nft.name} />
              <MetadataRow title="Fingerprint" content={nft.name} withCopy />
              <MetadataRow title="Policy id" content={nft.name} withCopy />
              <MetadataRow title="Details on" content={nft.name} />
            </TabPanel>

            <TabPanel active={activeTab === VIEW_TABS.METADATA}>
              <View style={styles.metadataTab}>
                <View style={styles.copyMetadata}>
                  <CopyButton value={stringifiedMetadata} />
                  <Text>COPY METADATA</Text>
                </View>
                <Spacer height={14} />

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
      <Spacer height={2} />
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
  rowTitleText: {},
  metadataTab: {
    paddingVertical: 34,
  },
  copyMetadata: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
})

const useTitle = (text: string) => {
  const navigation = useNavigation()
  useEffect(() => navigation.setOptions({title: text}))
}
