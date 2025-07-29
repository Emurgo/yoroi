import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {IOpenOrders} from '~/features/Portfolio/common/hooks/useGetOpenOrders'
import {useStrings} from '~/features/ReviewTx/common/hooks/useStrings'
import {AssetLogo} from '~/ui/AssetLogo/AssetLogo'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'
import {TokenInfoIcon} from '~/ui/TokenInfoIcon/TokenInfoIcon'

type Props = {
  tokenInfo: IOpenOrders
  splitTokenSymbol: string
}

export const OpenOrderModal = ({tokenInfo, splitTokenSymbol}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const [firstToken, secondToken] = tokenInfo.assets
  const firstTokenBalance = amountBreakdown(firstToken).bn.toFormat(2)
  const secondTokenBalance = amountBreakdown(secondToken).bn.toFormat(2)
  const firstTokenName = infoExtractName(firstToken.info)
  const secondTokenName = infoExtractName(secondToken.info)

  return (
    <View style={[a.flex_col, a.gap_sm, {paddingVertical: 14}, a.pl_lg]}>
      <View style={[a.flex_row, a.align_center, a.gap_md]}>
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
              imageStyle={{width: 26, height: 26}}
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
              imageStyle={{width: 26, height: 26}}
            />
          </AssetLogo>
        </View>

        <Text
          style={[a.body_1_lg_medium, {color: p.gray_900}]}
        >{`${firstTokenName} ${splitTokenSymbol} ${secondTokenName}`}</Text>
      </View>

      <InfoGroup label={strings.total}>
        <View>
          <Text
            style={[a.body_1_lg_regular, a.text_right, {color: p.gray_900}]}
          >{`${firstTokenBalance} ${firstTokenName}`}</Text>

          <PairedBalance
            amount={firstToken}
            textStyle={[a.body_3_sm_regular, a.text_right, {color: p.gray_600}]}
          />
        </View>
      </InfoGroup>

      <InfoGroup label={strings.dex}>
        <View style={[a.flex_row, a.align_center, a.justify_end, a.gap_xs]}>
          <DexLogo
            source={tokenInfo.dex.logo}
            style={{width: 32, height: 32}}
          />

          <Text
            style={[
              a.body_1_lg_medium,
              a.font_semibold,
              {color: p.primary_500},
            ]}
          >
            {tokenInfo.dex.name}
          </Text>
        </View>
      </InfoGroup>

      <InfoGroup label={strings.assetPrice}>
        <Text
          style={[a.body_1_lg_regular, a.text_right, {color: p.gray_900}]}
        >{`${firstTokenBalance} ${firstTokenName}/${secondTokenName}`}</Text>
      </InfoGroup>

      <InfoGroup label={strings.assetAmount}>
        <Text
          style={[a.body_1_lg_regular, a.text_right, {color: p.gray_900}]}
        >{`${secondTokenBalance} ${secondTokenName}`}</Text>
      </InfoGroup>

      <InfoGroup label={strings.txId}>
        <TxLink
          txId={shortenString('f23ad8f38f23ad8f38f23ad8f38f23ad8f38bcb')}
          onTxPress={() => Linking.openURL('http://')}
        />
      </InfoGroup>
    </View>
  )
}

const shortenString = (text: string) => {
  if (text.length > 14) {
    return text.substring(0, 9) + '...' + text.substring(text.length - 4)
  }
  return text
}

const TxLink = ({onTxPress, txId}: {onTxPress: () => void; txId: string}) => {
  const {palette: p} = useTheme()
  return (
    <TouchableOpacity onPress={onTxPress}>
      <Text style={[{color: p.primary_500}, a.link_2_md_underline]}>
        {txId}
      </Text>
    </TouchableOpacity>
  )
}

type InfoGroupProps = {
  label: string
}
const InfoGroup = ({
  children,
  label,
}: React.PropsWithChildren<InfoGroupProps>) => {
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex_row, a.justify_between, a.align_center]}>
      <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>{label}</Text>

      <View>{children}</View>
    </View>
  )
}

const DexLogo = ({
  source,
  style,
}: {
  source: string | ImageSourcePropType
  style: ImageStyle
}) => {
  return (
    <Image
      source={typeof source === 'string' ? {uri: source} : source}
      style={[style]}
    />
  )
}
