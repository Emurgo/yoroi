import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'

import noAssetsImage from '../../../../../assets/img/no-assets-found.png'
import {Boundary, Spacer, Text} from '../../../../../components'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import globalMessages, {txLabels} from '../../../../../i18n/global-messages'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch} from '../../../../../Search'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {maxTokensPerTx} from '../../../../../yoroi-wallets/contants'
import {useBalances, useTokenInfos} from '../../../../../yoroi-wallets/hooks'
import {TokenInfo} from '../../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {filterAssets} from '../../../common/filterAssets'
import {useSelectedTokensCounter, useSend, useTokenQuantities} from '../../../common/SendContext'
import {MaxTokensPerTx} from './ShowError/MaxTokensPerTx'

export const SelectTokenFromListScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const balances = useBalances(wallet)

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })
  const selectedTokensCounter = useSelectedTokensCounter()
  const canAddToken = selectedTokensCounter < maxTokensPerTx

  const {search: assetSearchTerm} = useSearch()
  const sortedTokenInfos = sortTokenInfos({wallet, tokenInfos: filterAssets(assetSearchTerm, tokenInfos)})

  return (
    <View style={styles.container}>
      <View style={styles.subheader}>
        {!canAddToken && (
          <>
            <MaxTokensPerTx />

            <Spacer height={16} />
          </>
        )}
      </View>

      <FlashList
        data={sortedTokenInfos}
        renderItem={({item: tokenInfo}: {item: TokenInfo}) => (
          <Boundary>
            <SelectableAssetItem tokenInfo={tokenInfo} disabled={!canAddToken} wallet={wallet} />
          </Boundary>
        )}
        bounces={false}
        contentContainerStyle={{paddingHorizontal: 16}}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
        ListEmptyComponent={assetSearchTerm.length > 0 && sortedTokenInfos.length === 0 ? <NoAssets /> : undefined}
      />

      <View style={styles.counter}>
        <Text style={styles.counterText1}>{strings.counter1(sortedTokenInfos.length)}</Text>

        <Text style={styles.counterText2}>{` ${strings.counter2}`}</Text>
      </View>
    </View>
  )
}

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, disabled, wallet}: SelectableAssetItemProps) => {
  const {tokenSelectedChanged, amountChanged} = useSend()
  const {spendable} = useTokenQuantities(tokenInfo.id)
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  const onSelect = () => {
    tokenSelectedChanged(tokenInfo.id)

    // if the balance is atomic there is no need to edit the amount
    if (Quantities.isAtomic(spendable, tokenInfo.decimals)) {
      amountChanged(spendable)
      navigation.navigate('send-list-amounts-to-send')
    } else {
      navigation.navigate('send-edit-amount')
    }
  }

  return (
    <TouchableOpacity style={styles.item} onPress={onSelect} testID="selectTokenButton" disabled={disabled}>
      <AmountItem amount={{tokenId: tokenInfo.id, quantity: spendable}} wallet={wallet} />
    </TouchableOpacity>
  )
}

export const NoAssets = () => {
  const strings = useStrings()
  return (
    <View style={styles.imageContainer}>
      <Spacer height={160} />

      <Image source={noAssetsImage} style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.contentText}>{strings.noAssets}</Text>
    </View>
  )
}
const useStrings = () => {
  const intl = useIntl()

  return {
    unknownAsset: intl.formatMessage(messages.unknownAsset),
    assetsLabel: intl.formatMessage(globalMessages.assetsLabel),
    amount: intl.formatMessage(txLabels.amount),
    counter1: (count) => intl.formatMessage(messages.counter1, {count}),
    counter2: intl.formatMessage(messages.counter2),
    noAssets: intl.formatMessage(messages.noAssets),
  }
}

const messages = defineMessages({
  unknownAsset: {
    id: 'components.send.assetselectorscreen.unknownAsset',
    defaultMessage: '!!!Unknown asset',
  },
  counter1: {
    id: 'components.send.assetselectorscreen.counter1',
    defaultMessage: '!!!{count} assets',
  },
  counter2: {
    id: 'components.send.assetselectorscreen.counter2',
    defaultMessage: '!!!found',
  },
  noAssets: {
    id: 'components.send.assetselectorscreen.noAssets',
    defaultMessage: '!!!No assets found',
  },
})

const styles = StyleSheet.create({
  counter: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  counterText1: {
    fontWeight: 'bold',
    color: '#3154CB',
  },
  counterText2: {
    fontWeight: '400',
    color: '#3154CB',
  },
  item: {
    paddingVertical: 16,
  },
  subheader: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
  },
  image: {
    flex: 1,
    alignSelf: 'center',
    width: 200,
    height: 228,
  },
  imageContainer: {
    flex: 1,
    textAlign: 'center',
  },
})
