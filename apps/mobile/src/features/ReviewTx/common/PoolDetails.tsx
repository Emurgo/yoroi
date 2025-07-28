import {FullPoolInfo} from '@emurgo/yoroi-lib'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Copiable} from '~/ui/Copiable'
import {ExplorerInfoLinks} from '~/ui/ExplorerInfoLinks/ExplorerInfoLinks'
import {Space} from '~/ui/Space/Space'
import {formatTokenWithText} from '~/wallets/utils/format'
import {isEmptyString} from '~/wallets/utils/string'
import {asQuantity, Quantities} from '~/wallets/utils/utils'
import {useStrings} from './hooks/useStrings'
import {generatePoolName} from './operations'

export const PoolDetails = ({poolInfo}: {poolInfo: FullPoolInfo}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {palette: p} = useTheme()

  const {chain, explorer} = poolInfo

  const lastChainPoolInfo = chain?.history.at(-1) ?? null
  const poolName = generatePoolName(poolInfo)

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <PoolIcon imageUrl={explorer?.pic} />

      <Space.Height.sm />

      <Row>
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {poolName}
        </Text>
      </Row>

      <Space.Height.xl />

      <PoolId poolId={explorer?.id} />

      <Space.Height.lg />

      <PoolHash poolHash={explorer?.hash} />

      <Space.Height.lg />

      <Info
        label={strings.poolSize}
        value={formatTokenWithText(
          asQuantity(explorer?.stake ?? Quantities.zero),
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Space.Height.sm />

      <Info label={strings.poolRoa} value={`${explorer?.roa ?? '-'}%`} />

      <Space.Height.sm />

      <Info label={strings.poolShare} value={`${explorer?.share ?? '-'}%`} />

      <Space.Height.sm />

      <Info
        label={strings.poolSaturation}
        value={`${explorer?.saturation ?? '-'}%`}
      />

      <Space.Height.sm />

      <Info
        label={strings.poolTaxFix}
        value={formatTokenWithText(
          asQuantity(explorer?.taxFix ?? Quantities.zero),
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Space.Width.sm />

      <Info
        label={strings.poolTaxRatio}
        value={`${explorer?.taxRatio ?? '-'}%`}
      />

      <Space.Width.sm />

      <Info
        label={strings.poolPledge}
        value={formatTokenWithText(
          asQuantity(
            (lastChainPoolInfo?.payload as {poolParams: {pledge: string}})
              ?.poolParams?.pledge ?? Quantities.zero,
          ),
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Space.Height.lg />

      {poolInfo.explorer && !isEmptyString(poolInfo.explorer.id) && (
        <ExplorerInfoLinks value={poolInfo.explorer.id} type="pool" />
      )}
    </View>
  )
}

const PoolIcon = ({imageUrl}: {imageUrl: string | null | undefined}) => {
  if (imageUrl == null) return null

  return (
    <View style={[a.justify_center, a.align_center]}>
      <Image source={{uri: imageUrl}} style={[{width: 80, height: 80}]} />
    </View>
  )
}

const PoolId = ({poolId}: {poolId: string | undefined}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  if (isEmptyString(poolId)) return null

  return (
    <Row>
      <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
        {strings.poolId}
      </Text>

      <Space.Width.lg />

      <View style={[a.flex_1, a.align_center]}>
        <Copiable text={poolId}>
          <Text
            style={[
              a.flex_1,
              a.text_right,
              a.body_2_md_regular,
              {color: p.text_gray_max},
            ]}
          >
            {poolId}
          </Text>
        </Copiable>
      </View>
    </Row>
  )
}
const PoolHash = ({poolHash}: {poolHash?: string}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  if (isEmptyString(poolHash)) return null

  return (
    <Row>
      <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
        {strings.poolHash}
      </Text>

      <Space.Width.lg />

      <View style={[a.flex_1, a.align_center]}>
        <Copiable text={poolHash}>
          <Text
            style={[
              a.flex_1,
              a.text_right,
              a.body_2_md_regular,
              {color: p.text_gray_max},
            ]}
          >
            {poolHash}
          </Text>
        </Copiable>
      </View>
    </Row>
  )
}

const Info = ({label, value}: {label: string; value?: string}) => {
  const {palette: p} = useTheme()

  if (isEmptyString(value)) return null

  return (
    <Row>
      <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
        {label}
      </Text>

      <Text
        style={[
          a.flex_1,
          a.text_right,
          a.body_2_md_regular,
          {color: p.text_gray_max},
        ]}
      >
        {value}
      </Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.flex_row, a.justify_center]}>{children}</View>
}
