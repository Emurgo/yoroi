import {createTypeGuardFromSchema} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'

import * as React from 'react'
import {Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {z} from 'zod'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useParams} from '~/kernel/navigation/hooks/useParams'
import {SettingsStackRoutes} from '~/kernel/navigation/types'

import {useLaunchRouteAfterSyncing} from '../../../../hooks/useLaunchRouteAfterSyncing'

export const PreparingNetworkScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const {selectedNetwork} = useParams<Params>(isParams)

  useLaunchRouteAfterSyncing({selectedNetwork})

  return (
    <SafeAreaView
      style={[a.flex_1, a.px_lg, a.pt_lg, a.align_center, a.justify_center]}
    >
      <Text style={[ta.text_primary_max, a.text_center, a.heading_2_medium]}>
        {strings.settings.changeNetwork.preparingNetwork}
      </Text>
    </SafeAreaView>
  )
}

type Params = SettingsStackRoutes['preparing-network']
const ScanStartParamsSchema = z.object({
  selectedNetwork: z.custom<Chain.SupportedNetworks>(),
})

const isPreparingNetworkParams = createTypeGuardFromSchema<Params>(
  ScanStartParamsSchema,
)
const isParams = (params?: unknown): params is Params =>
  isPreparingNetworkParams(params)
