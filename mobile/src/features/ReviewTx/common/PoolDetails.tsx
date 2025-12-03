import {formatTokenWithText} from '@yoroi/cardano-wallet/utils/format'
import {isEmptyString} from '@yoroi/cardano-wallet/utils/string'
import {Quantities, asQuantity} from '@yoroi/cardano-wallet/utils/utils'
import {FullPoolInfo} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import {Image} from 'expo-image'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'
import {ExplorerInfoLinks} from '~/ui/ExplorerInfoLinks/ExplorerInfoLinks'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

import {generatePoolName} from './poolUtils'

export const PoolDetails = ({poolInfo}: {poolInfo: FullPoolInfo}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {atoms: ta} = useTheme()

  const {chain, explorer} = poolInfo

  const lastChainPoolInfo = chain?.history.at(-1) ?? null
  const poolName = generatePoolName(poolInfo)

  return (
    <Modal.Content>
      <PoolIcon imageUrl={explorer?.pic} />

      <Space.Height.sm />

      <Row>
        <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
          {poolName}
        </Text>
      </Row>

      <Space.Height.xl />

      <PoolId poolId={explorer?.id} />

      <Space.Height.lg />

      <PoolHash poolHash={explorer?.hash} />

      <Space.Height.lg />

      <Info
        label={strings.txReview.poolDetails.poolSize}
        value={formatTokenWithText(
          asQuantity(explorer?.stake ?? Quantities.zero),
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Space.Height.sm />

      <Info
        label={strings.txReview.poolDetails.poolRoa}
        value={`${explorer?.roa ?? '-'}%`}
      />

      <Space.Height.sm />

      <Info
        label={strings.txReview.poolDetails.poolShare}
        value={`${explorer?.share ?? '-'}%`}
      />

      <Space.Height.sm />

      <Info
        label={strings.txReview.poolDetails.poolSaturation}
        value={
          explorer?.saturation != null
            ? `${(Number(explorer.saturation) * 100).toFixed(2)}%`
            : '-'
        }
      />

      <Space.Height.sm />

      <Info
        label={strings.txReview.poolDetails.taxFix}
        value={formatTokenWithText(
          asQuantity(explorer?.taxFix ?? Quantities.zero),
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Space.Width.sm />

      <Info
        label={strings.txReview.poolDetails.taxRatio}
        value={`${explorer?.taxRatio ?? '-'}%`}
      />

      <Space.Width.sm />

      <Info
        label={strings.txReview.poolDetails.pledge}
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
    </Modal.Content>
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
  const {atoms: ta} = useTheme()

  if (isEmptyString(poolId) || poolId == null) return null

  return (
    <Row>
      <Text style={[a.body_2_md_regular, ta.text_gray_low]}>
        {strings.txReview.poolDetails.poolId}
      </Text>

      <Space.Width.lg />

      <View style={[a.flex_1, a.align_center]}>
        <Copiable text={poolId}>
          <Text
            style={[
              a.flex_1,
              a.text_right,
              a.body_2_md_regular,
              ta.text_gray_max,
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
  const {atoms: ta} = useTheme()

  if (isEmptyString(poolHash) || poolHash == null) return null

  return (
    <Row>
      <Text style={[a.body_2_md_regular, ta.text_gray_low]}>
        {strings.txReview.poolDetails.poolHash}
      </Text>

      <Space.Width.lg />

      <View style={[a.flex_1, a.align_center]}>
        <Copiable text={poolHash}>
          <Text
            style={[
              a.flex_1,
              a.text_right,
              a.body_2_md_regular,
              ta.text_gray_max,
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
  const {atoms: ta} = useTheme()

  if (isEmptyString(value)) return null

  return (
    <Row>
      <Text style={[a.body_2_md_regular, ta.text_gray_low]}>{label}</Text>

      <Text
        style={[a.flex_1, a.text_right, a.body_2_md_regular, ta.text_gray_max]}
      >
        {value}
      </Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.flex_row, a.justify_center]}>{children}</View>
}
