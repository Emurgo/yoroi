/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect} from 'react'
// import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {CopyButton, FadeIn, OfflineBanner, StatusBar, Text} from '../components'
// import globalMessages from '../i18n/global-messages'
// import {useSelectedWallet} from '../SelectedWallet'
import {mockNFTs} from './Nfts'

export const NftDetails = () => {
  // const strings = useStrings()
  // const intl = useIntl()
  // const wallet = useSelectedWallet()
  const {id} = useRoute().params as Params
  const nft = mockNFTs[id] ?? {}

  useTitle('NFT Details')

  return (
    <FadeIn style={styles.container}>
      <StatusBar type="dark" />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image source={nft.image} style={styles.image} />
        </View>
        <View style={styles.contentContainer}>
          <Text secondary monospace numberOfLines={1} ellipsizeMode="middle">
            {nft.text}
          </Text>
          <CopyButton value={nft.text} />
        </View>
      </ScrollView>
    </FadeIn>
  )
}

// const Label = ({children}: {children: string}) => <Text style={styles.label}>{children}</Text>

export type Params = {
  id: string
}

// const useStrings = () => {
//   const intl = useIntl()

//   return {
//     fee: intl.formatMessage(messages.fee),
//     fromAddresses: intl.formatMessage(messages.fromAddresses),
//     toAddresses: intl.formatMessage(messages.toAddresses),
//     transactionId: intl.formatMessage(messages.transactionId),
//     txAssuranceLevel: intl.formatMessage(messages.txAssuranceLevel),
//     confirmations: (cnt) => intl.formatMessage(messages.confirmations, {cnt}),
//     omittedCount: (cnt) => intl.formatMessage(messages.omittedCount, {cnt}),
//     openInExplorer: intl.formatMessage(messages.openInExplorer),
//     assetsLabel: intl.formatMessage(globalMessages.assetsLabel),
//   }
// }

// const messages = defineMessages({
//   addressPrefixReceive: {
//     id: 'components.txhistory.txdetails.addressPrefixReceive',
//     defaultMessage: '!!!/{idx}',
//   },
//   addressPrefixChange: {
//     id: 'components.txhistory.txdetails.addressPrefixChange',
//     defaultMessage: '!!!/change',
//   },
//   addressPrefixNotMine: {
//     id: 'components.txhistory.txdetails.addressPrefixNotMine',
//     defaultMessage: '!!!not mine',
//   },
//   fee: {
//     id: 'components.txhistory.txdetails.fee',
//     defaultMessage: '!!!Fee: ',
//   },
//   fromAddresses: {
//     id: 'components.txhistory.txdetails.fromAddresses',
//     defaultMessage: '!!!From Addresses',
//   },
//   toAddresses: {
//     id: 'components.txhistory.txdetails.toAddresses',
//     defaultMessage: '!!!To Addresses',
//   },
//   transactionId: {
//     id: 'components.txhistory.txdetails.transactionId',
//     defaultMessage: '!!!Transaction ID',
//   },
//   txAssuranceLevel: {
//     id: 'components.txhistory.txdetails.txAssuranceLevel',
//     defaultMessage: '!!!Transaction assurance level',
//   },
//   confirmations: {
//     id: 'components.txhistory.txdetails.confirmations',
//     defaultMessage: '!!!{cnt} {cnt, plural, one {CONFIRMATION} other {CONFIRMATIONS}}',
//   },
//   omittedCount: {
//     id: 'components.txhistory.txdetails.omittedCount',
//     defaultMessage: '!!!+ {cnt} omitted {cnt, plural, one {address} other {addresses}}',
//   },
//   openInExplorer: {
//     id: 'global.openInExplorer',
//     defaultMessage: '!!!Open in explorer',
//   },
// })

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  image: {
    flex: 1,
    paddingHorizontal: 16,
    width: 350,
    height: 350,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  // label: {
  //   marginTop: 16,
  //   marginBottom: 8,
  // },
  // borderBottom: {
  //   borderBottomWidth: 1,
  //   borderColor: 'rgba(173, 174, 182, 0.3)',
  // },
})

const useTitle = (text: string) => {
  const navigation = useNavigation()
  useEffect(() => navigation.setOptions({title: text}))
}
