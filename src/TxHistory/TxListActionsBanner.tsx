import React, {useState} from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import {Spacer} from '../components/Spacer'
import features from '../features'
import {ChipButton} from './ChipButton'

type AssetsOptions = 'tokens' | 'nfts'

type ActionListBaseProps = {
  onSearch: () => void
}

type TxListActionsBannerForTransactionsTabProps = ActionListBaseProps & {
  onExport: () => void
}

type TxListActionsBannerForAssetsTabProps = ActionListBaseProps & {
  tokensLabel: string
  nftsLabel: string
  onPressTokens: () => void
  onPressNFTs: () => void
}

export const TxListActionsBannerForTransactionsTab = (props: TxListActionsBannerForTransactionsTabProps) => {
  const {onExport, onSearch} = props
  return (
    <View style={styles.actionsRoot}>
      {features.txHistory.export && (
        <TouchableOpacity onPress={onExport}>
          <Icon name="export" size={24} color="#6B7384" />
        </TouchableOpacity>
      )}

      {features.txHistory.search && (
        <TouchableOpacity onPress={onSearch}>
          <Icon name="magnify" size={24} color="#6B7384" />
        </TouchableOpacity>
      )}
    </View>
  )
}

export const TxListActionsBannerForAssetsTab = (props: TxListActionsBannerForAssetsTabProps) => {
  const [assetSelected, setAssetSelected] = useState<AssetsOptions>('tokens')
  const {onPressTokens, onPressNFTs, tokensLabel, nftsLabel} = props

  const handleOnSelectTokens = () => {
    setAssetSelected('tokens')
    onPressTokens()
  }

  const handleOnSelectNFTs = () => {
    setAssetSelected('nfts')
    onPressNFTs()
  }

  return (
    <View style={styles.actionsRoot}>
      <View style={styles.assets}>
        <ChipButton label={tokensLabel} disabled onPress={handleOnSelectTokens} selected={assetSelected === 'tokens'} />

        <Spacer width={12} />

        {features.txHistory.nfts && (
          <ChipButton label={nftsLabel} disabled onPress={handleOnSelectNFTs} selected={assetSelected === 'nfts'} />
        )}
      </View>

      {features.txHistory.search && (
        <TouchableOpacity onPress={props.onSearch}>
          <Icon name="magnify" size={24} color="#6B7384" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  actionsRoot: {
    display: 'flex',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingBottom: 2,
  },
  assets: {
    flexDirection: 'row',
  },
})
