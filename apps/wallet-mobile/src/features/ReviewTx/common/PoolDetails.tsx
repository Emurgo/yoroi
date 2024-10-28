import {ExplorerPoolInfo} from '@emurgo/yoroi-lib'
import {useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../components/Space/Space'
import {isEmptyString} from '../../../kernel/utils'
import {formatTokenWithText} from '../../../yoroi-wallets/utils/format'
import {asQuantity} from '../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {CopiableText} from './CopiableText'
import {useStrings} from './hooks/useStrings'

export const PoolDetails = ({poolInfo}: {poolInfo: ExplorerPoolInfo | null}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  console.log('poolInfo', JSON.stringify(poolInfo, null, 2))
  return (
    <View style={styles.root}>
      <PoolIcon imageUrl={poolInfo?.pic} />

      <Space height="sm" />

      <PoolId poolId={poolInfo?.id} />

      <Space width="lg" />

      <PoolHash poolHash={poolInfo?.hash} />

      <Space width="lg" />

      <Info
        label={strings.poolSize}
        value={formatTokenWithText(asQuantity(poolInfo?.stake ?? '-'), wallet.portfolioPrimaryTokenInfo)}
      />

      <Info label={strings.poolRoa} value={`${poolInfo?.roa ?? '-'}%`} />

      <Info label={strings.poolShare} value={`${poolInfo?.share ?? '-'}%`} />

      <Info label={strings.poolSaturation} value={`${poolInfo?.saturation ?? '-'}%`} />
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
      ...atoms.justify_between,
    },
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
