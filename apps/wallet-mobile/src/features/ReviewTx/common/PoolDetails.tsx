import {FullPoolInfo} from '@emurgo/yoroi-lib'
import {useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../components/Space/Space'
import {isEmptyString} from '../../../kernel/utils'
import {formatTokenWithText} from '../../../yoroi-wallets/utils/format'
import {asQuantity, Quantities} from '../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {CopiableText} from './CopiableText'
import {ExplorerInfoLinks} from './ExplorerInfoLinks'
import {useStrings} from './hooks/useStrings'
import {generatePoolName} from './operations'

export const PoolDetails = ({poolInfo}: {poolInfo: FullPoolInfo}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  const {chain, explorer} = poolInfo

  const lastChainPoolInfo = chain?.history.at(-1) ?? null
  const poolName = generatePoolName(poolInfo)

  return (
    <View style={styles.root}>
      <PoolIcon imageUrl={explorer?.pic} />

      <Space height="sm" />

      <Row>
        <Text style={styles.title}>{poolName}</Text>
      </Row>

      <Space height="xl" />

      <PoolId poolId={explorer?.id} />

      <Space height="lg" />

      <PoolHash poolHash={explorer?.hash} />

      <Space height="lg" />

      <Info
        label={strings.poolSize}
        value={formatTokenWithText(asQuantity(explorer?.stake ?? Quantities.zero), wallet.portfolioPrimaryTokenInfo)}
      />

      <Space height="sm" />

      <Info label={strings.poolRoa} value={`${explorer?.roa ?? '-'}%`} />

      <Space height="sm" />

      <Info label={strings.poolShare} value={`${explorer?.share ?? '-'}%`} />

      <Space height="sm" />

      <Info label={strings.poolSaturation} value={`${explorer?.saturation ?? '-'}%`} />

      <Space height="sm" />

      <Info
        label={strings.poolTaxFix}
        value={formatTokenWithText(asQuantity(explorer?.taxFix ?? Quantities.zero), wallet.portfolioPrimaryTokenInfo)}
      />

      <Space width="sm" />

      <Info label={strings.poolTaxRatio} value={`${explorer?.taxRatio ?? '-'}%`} />

      <Space width="sm" />

      <Info
        label={strings.poolPledge}
        value={formatTokenWithText(
          asQuantity(
            (lastChainPoolInfo?.payload as {poolParams: {pledge: string}})?.['poolParams']?.['pledge'] ??
              Quantities.zero,
          ),
          wallet.portfolioPrimaryTokenInfo,
        )}
      />

      <Space height="lg" />

      {poolInfo.explorer && !isEmptyString(poolInfo.explorer.id) && (
        <ExplorerInfoLinks id={poolInfo.explorer.id} type="pool" />
      )}
    </View>
  )
}

const PoolIcon = ({imageUrl}: {imageUrl: string | null | undefined}) => {
  const {styles} = useStyles()

  if (imageUrl == null) return null

  return (
    <View style={styles.imageContainer}>
      <Image source={{uri: imageUrl}} style={styles.image} />
    </View>
  )
}

const PoolId = ({poolId}: {poolId: string | undefined}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  if (isEmptyString(poolId)) return null

  return (
    <Row>
      <Text style={styles.label}>{strings.poolId}</Text>

      <Space width="lg" />

      <View style={styles.copiableText}>
        <CopiableText textToCopy={poolId}>
          <Text style={styles.value}>{poolId}</Text>
        </CopiableText>
      </View>
    </Row>
  )
}
const PoolHash = ({poolHash}: {poolHash?: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  if (isEmptyString(poolHash)) return null

  return (
    <Row>
      <Text style={styles.label}>{strings.poolHash}</Text>

      <Space width="lg" />

      <View style={styles.copiableText}>
        <CopiableText textToCopy={poolHash}>
          <Text style={styles.value}>{poolHash}</Text>
        </CopiableText>
      </View>
    </Row>
  )
}

const Info = ({label, value}: {label: string; value?: string}) => {
  const {styles} = useStyles()

  if (isEmptyString(value)) return null

  return (
    <Row>
      <Text style={styles.label}>{label}</Text>

      <Text style={styles.value}>{value}</Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.row}>{children}</View>
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    imageContainer: {
      ...atoms.justify_center,
      ...atoms.align_center,
    },
    image: {
      width: 80,
      height: 80,
    },
    label: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
    },
    value: {
      ...atoms.flex_1,
      ...atoms.text_right,
      ...atoms.body_2_md_regular,
      color: color.text_gray_max,
    },
    copiableText: {
      ...atoms.flex_1,
      ...atoms.align_center,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_center,
    },
    title: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_medium,
    },
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
