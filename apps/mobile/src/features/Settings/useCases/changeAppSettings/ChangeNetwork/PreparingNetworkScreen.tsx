import {createTypeGuardFromSchema} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {z} from 'zod'

import {SettingsStackRoutes, useParams} from '../../../../../kernel/navigation'
import {useStrings} from './strings'
import {useLaunchRouteAfterSyncing} from './useLaunchRouteAfterSyncing'

export const PreparingNetworkScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {selectedNetwork} = useParams<Params>(isParams)

  useLaunchRouteAfterSyncing({selectedNetwork})

  return (
    <SafeAreaView edges={['left', 'right', 'bottom', 'top']} style={styles.root}>
      <Text style={styles.title}>{strings.preparingNetwork}</Text>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
      backgroundColor: color.bg_color_max,
    },
    title: {
      color: color.primary_500,
      ...atoms.text_center,
      ...atoms.heading_2_medium,
    },
  })
  return {styles} as const
}

type Params = SettingsStackRoutes['preparing-network']
const ScanStartParamsSchema = z.object({
  selectedNetwork: z.custom<Chain.SupportedNetworks>(),
})

const isPreparingNetworkParams = createTypeGuardFromSchema<Params>(ScanStartParamsSchema)
const isParams = (params?: unknown): params is Params => isPreparingNetworkParams(params)
