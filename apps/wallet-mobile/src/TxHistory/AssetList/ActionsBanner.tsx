import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../components'
import {Spacer} from '../../components/Spacer'
import {features} from '../../features'
import {ChipButton} from './ChipButton'

type AssetsOptions = 'tokens' | 'nfts'

type Props = {
  tokensLabel: string
  nftsLabel: string
  onPressTokens: () => void
  onPressNFTs: () => void
  onSearch: () => void
}

export const ActionsBanner = (props: Props) => {
  const [assetSelected, setAssetSelected] = useState<AssetsOptions>('tokens')
  const {styles, colors} = useStyles()
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
          <Icon.Magnify size={24} color={colors.iconColor} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    actionsRoot: {
      display: 'flex',
      ...atoms.px_lg,
      ...atoms.pb__xxs,
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    assets: {
      flexDirection: 'row',
    },
  })
  const colors = {
    iconColor: color.gray_c600,
  }
  return {styles, colors}
}
