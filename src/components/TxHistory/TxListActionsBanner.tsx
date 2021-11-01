import React, {useState} from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import globalMessages from '../../../legacy/i18n/global-messages'
import features from '../../features'
import Spacer from '../Spacer/Spacer'
import {ChipButton} from './ChipButton'

type Actions = 'txs' | 'assets'
type AssetsOptions = 'tokens' | 'nfts'

interface ActionListBaseProps {
  onSearch: () => void
  actions: Actions
}

interface ActionsTransactionProps extends ActionListBaseProps {
  actions: 'txs'
  onExport: () => void
}

interface ActionsAssetsProps extends ActionListBaseProps {
  actions: 'assets'
  // TODO: should receive the labels with the qty
  onPressTokens: () => void
  onPressNFTs: () => void
}

type TxListActionsBannerProps = ActionsAssetsProps | ActionsTransactionProps

export const TxListActionsBanner = (props: TxListActionsBannerProps) => {
  const [assetSelected, setAssetSelected] = useState<AssetsOptions>('tokens')
  const strings = useStrings()
  const {onPressTokens, onPressNFTs} = props as ActionsAssetsProps

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
      <View style={styles.leftActions}>
        {props.actions === 'assets' && (
          <ChipButton label={strings.tokens} onPress={handleOnSelectTokens} isSelected={assetSelected === 'tokens'} />
        )}

        <Spacer width={12} />

        {props.actions === 'assets' && features.txHistory.nfts && (
          <ChipButton label={strings.nfts} onPress={handleOnSelectNFTs} isSelected={assetSelected === 'nfts'} />
        )}

        {props.actions === 'txs' && features.txHistory.export && (
          <TouchableOpacity onPress={props.onExport}>
            <Icon name="export" size={24} color="#6B7384" />
          </TouchableOpacity>
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

// NOTE: layout is following inVision spec
// https://projects.invisionapp.com/d/main?origin=v7#/console/21500065/456867605/inspect?scrollOffset=2856#project_console
const styles = StyleSheet.create({
  actionsRoot: {
    display: 'flex',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingBottom: 2,
  },
  leftActions: {
    flexDirection: 'row',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    tokens: intl.formatMessage(globalMessages.tokens),
    nfts: intl.formatMessage(globalMessages.nfts),
  }
}
