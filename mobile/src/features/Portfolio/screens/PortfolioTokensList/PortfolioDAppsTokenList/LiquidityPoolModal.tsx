import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Image, ImageSourcePropType, ImageStyle, Text, View} from 'react-native'

import {ILiquidityPool} from '~/features/Portfolio/common/hooks/useGetLiquidityPool'
import {AssetLogo} from '~/features/Portfolio/ui/AssetLogo/AssetLogo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'
import {TokenInfoIcon} from '~/ui/TokenInfoIcon/TokenInfoIcon'

type Props = {
  tokenInfo: ILiquidityPool
  splitTokenSymbol: string
}

export const LiquidityPoolModal = ({tokenInfo, splitTokenSymbol}: Props) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const [firstToken, secondToken] = tokenInfo.assets
  const firstTokenBalance = amountBreakdown(firstToken).bn.toFormat(2)
  const secondTokenBalance = amountBreakdown(secondToken).bn.toFormat(2)
  const firstTokenName = infoExtractName(firstToken.info)
  const secondTokenName = infoExtractName(secondToken.info)

  return (
    <Modal.Content style={[a.flex_col, a.gap_sm]}>
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
          style={[a.body_1_lg_medium, ta.text_gray_max]}
        >{`${firstTokenName} ${splitTokenSymbol} ${secondTokenName}`}</Text>
      </View>

      <InfoGroup label={strings.portfolio.value}>
        <View>
          <Text
            style={[a.body_1_lg_regular, a.text_right, ta.text_gray_max]}
          >{`${firstTokenBalance} ${firstTokenName}`}</Text>

          <PairedBalance
            amount={firstToken}
            textStyle={{
              ...a.body_3_sm_regular,
              ...a.text_right,
              ...ta.text_gray_medium,
            }}
          />
        </View>
      </InfoGroup>

      <InfoGroup label={strings.portfolio.dex}>
        <View style={[a.flex_row, a.align_center, a.justify_end, a.gap_xs]}>
          <DexLogo
            source={tokenInfo.dex.logo}
            style={{width: 32, height: 32}}
          />

          <Text
            style={[
              a.body_1_lg_medium,
              a.font_semibold,
              ta.text_primary_medium,
            ]}
          >
            {tokenInfo.dex.name}
          </Text>
        </View>
      </InfoGroup>

      <InfoGroup label={strings.portfolio.lp}>
        <Text style={[a.body_1_lg_regular, a.text_right, ta.text_gray_max]}>
          {firstTokenBalance}
        </Text>
      </InfoGroup>

      <InfoGroup label={firstTokenName}>
        <Text style={[a.body_1_lg_regular, a.text_right, ta.text_gray_max]}>
          {firstTokenBalance}
        </Text>
      </InfoGroup>

      <InfoGroup label={secondTokenName}>
        <Text style={[a.body_1_lg_regular, a.text_right, ta.text_gray_max]}>
          {secondTokenBalance}
        </Text>
      </InfoGroup>
    </Modal.Content>
  )
}

type InfoGroupProps = {
  label: string
}
const InfoGroup = ({
  children,
  label,
}: React.PropsWithChildren<InfoGroupProps>) => {
  const {atoms: ta} = useTheme()

  return (
    <View style={[a.flex_row, a.justify_between, a.align_center]}>
      <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>{label}</Text>

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
