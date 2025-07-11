import {FullPoolInfo} from '@emurgo/yoroi-lib'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Copiable} from '../../../ui/Copiable'
import {Space} from '../../../ui/Space/Space'
import {isEmptyString} from '../../../kernel/utils'
import {formatTokenWithText} from '../../../wallets/utils/format'
import {asQuantity, Quantities} from '../../../wallets/utils/utils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {ExplorerInfoLinks} from '../../../ui/ExplorerInfoLinks/ExplorerInfoLinks'
import {useStrings} from './hooks/useStrings'
import {generatePoolName} from './operations'

export const PoolDetails = ({poolInfo}: {poolInfo: FullPoolInfo}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {color} = useTheme()

  const {chain, explorer} = poolInfo

  const lastChainPoolInfo = chain?.history.at(-1) ?? null
  const poolName = generatePoolName(poolInfo)

  return (
    <View style={styles.root}>
      <PoolIcon imageUrl={explorer?.pic} />

      <Space height="sm" />

      <Row>
        <Text style={[styles.title, {color: color.text_gray_medium}]}>{poolName}</Text>
      </Row>

      <Space height="xl" />

      <PoolId poolId={explorer?.id} />

      <Space height="lg" />

      <PoolHash poolHash={explorer?.hash} />

      <Space height="lg" />

      <Info
        label={strings.poolSize}
        value={formatTokenWithText(
          asQuantity(explorer?.stake ?? Quantities.zero),
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Space height="sm" />

      <Info label={strings.poolRoa} value={`${explorer?.roa ?? '-'}%`} />

      <Space height="sm" />

      <Info label={strings.poolShare} value={`${explorer?.share ?? '-'}%`} />

      <Space height="sm" />

      <Info
        label={strings.poolSaturation}
        value={`${explorer?.saturation ?? '-'}%`}
      />

      <Space height="sm" />

      <Info
        label={strings.poolTaxFix}
        value={formatTokenWithText(
          asQuantity(explorer?.taxFix ?? Quantities.zero),
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Space width="sm" />

      <Info
        label={strings.poolTaxRatio}
        value={`${explorer?.taxRatio ?? '-'}%`}
      />

      <Space width="sm" />

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

      <Space height="lg" />

      {poolInfo.explorer && !isEmptyString(poolInfo.explorer.id) && (
        <ExplorerInfoLinks value={poolInfo.explorer.id} type="pool" />
      )}
    </View>
  )
}

const PoolIcon = ({imageUrl}: {imageUrl: string | null | undefined}) => {
  if (imageUrl == null) return null

  return (
    <View style={styles.imageContainer}>
      <Image source={{uri: imageUrl}} style={styles.image} />
    </View>
  )
}

const PoolId = ({poolId}: {poolId: string | undefined}) => {
  const strings = useStrings()
  const {color} = useTheme()

  if (isEmptyString(poolId)) return null

  return (
    <Row>
      <Text style={[styles.label, {color: color.text_gray_low}]}>{strings.poolId}</Text>

      <Space width="lg" />

      <View style={styles.copiableText}>
        <Copiable text={poolId}>
          <Text style={[styles.value, {color: color.text_gray_max}]}>{poolId}</Text>
        </Copiable>
      </View>
    </Row>
  )
}
const PoolHash = ({poolHash}: {poolHash?: string}) => {
  const strings = useStrings()
  const {color} = useTheme()

  if (isEmptyString(poolHash)) return null

  return (
    <Row>
      <Text style={[styles.label, {color: color.text_gray_low}]}>{strings.poolHash}</Text>

      <Space width="lg" />

      <View style={styles.copiableText}>
        <Copiable text={poolHash}>
          <Text style={[styles.value, {color: color.text_gray_max}]}>{poolHash}</Text>
        </Copiable>
      </View>
    </Row>
  )
}

const Info = ({label, value}: {label: string; value?: string}) => {
  const {color} = useTheme()

  if (isEmptyString(value)) return null

  return (
    <Row>
      <Text style={[styles.label, {color: color.text_gray_low}]}>{label}</Text>

      <Text style={[styles.value, {color: color.text_gray_max}]}>{value}</Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  return <View style={styles.row}>{children}</View>
}

const styles = StyleSheet.create({
  root: {
    ...a.flex_1,
    ...a.px_lg,
  },
  imageContainer: {
    ...a.justify_center,
    ...a.align_center,
  },
  image: {
    width: 80,
    height: 80,
  },
  label: {
    ...a.body_2_md_regular,
  },
  value: {
    ...a.flex_1,
    ...a.text_right,
    ...a.body_2_md_regular,
  },
  copiableText: {
    ...a.flex_1,
    ...a.align_center,
  },
  row: {
    ...a.flex_row,
    ...a.justify_center,
  },
  title: {
    ...a.body_1_lg_medium,
  },
})