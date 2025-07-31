import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {TokenInfoIcon} from '~/ui/TokenInfoIcon/TokenInfoIcon'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'
import {ILiquidityPool} from '~/features/Portfolio/common/hooks/useGetLiquidityPool'
import {AssetLogo} from '~/features/Portfolio/ui/AssetLogo/AssetLogo'

type Props = {
  tokenInfo: ILiquidityPool
  splitTokenSymbol: string
  onPress?: () => void
}

export const DAppTokenItem = ({
  tokenInfo,
  splitTokenSymbol,
  onPress,
}: Props) => {
  const {atoms: ta, palette: p} = useTheme()

  const [firstToken, secondToken] = tokenInfo.assets
  const firstTokenBalance = amountBreakdown(firstToken).bn.toFormat(2)
  const firstTokenName = infoExtractName(firstToken.info)
  const secondTokenName = infoExtractName(secondToken.info)

  return (
    <TouchableOpacity onPress={onPress} style={[a.flex_row, a.justify_between]}>
      <View style={[a.flex_row, a.gap_md]}>
        <View style={[a.relative, {width: 40, height: 40}]}>
          <AssetLogo
            style={[
              a.rounded_sm,
              a.absolute,
              {top: 0, left: 0, width: 26, height: 26},
            ]}
          >
            <TokenInfoIcon
              info={firstToken.info}
              size="sm"
              imageStyle={[{width: 26, height: 26}]}
            />
          </AssetLogo>

          <AssetLogo
            style={[
              a.rounded_sm,
              a.absolute,
              {bottom: 0, right: 0, width: 26, height: 26},
            ]}
          >
            <TokenInfoIcon
              info={secondToken.info}
              size="sm"
              imageStyle={[{width: 26, height: 26}]}
            />
          </AssetLogo>
        </View>

        <View>
          <Text
            style={[{color: p.gray_900}, a.body_1_lg_medium]}
          >{`${firstTokenName} ${splitTokenSymbol} ${secondTokenName}`}</Text>

          <Text style={[a.body_3_sm_regular, {color: p.gray_600}]}>
            {tokenInfo.dex.name}
          </Text>
        </View>
      </View>

      <View>
        <Text
          style={[{color: p.gray_max}, a.body_1_lg_regular, a.text_right]}
        >{`${firstTokenBalance} ${firstTokenName}`}</Text>

        <PairedBalance
          amount={firstToken}
          textStyle={[{color: p.gray_600}, a.body_3_sm_regular, a.text_right]}
        />
      </View>
    </TouchableOpacity>
  )
}
