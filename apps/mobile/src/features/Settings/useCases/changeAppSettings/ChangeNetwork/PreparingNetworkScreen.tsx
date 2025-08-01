import {createTypeGuardFromSchema} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {z} from 'zod'

import {
  SettingsStackRoutes,
  useParams,
} from '../../../../../kernel/navigation/navigation'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useLaunchRouteAfterSyncing} from './useLaunchRouteAfterSyncing'

export const PreparingNetworkScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {selectedNetwork} = useParams<Params>(isParams)

  useLaunchRouteAfterSyncing({selectedNetwork})

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom', 'top']}
      style={[a.flex_1, a.align_center, a.justify_center, ta.bg_color_max]}
    >
      <Text
        style={[
          {
            color: p.primary_500,
          },
          a.text_center,
          a.heading_2_medium,
        ]}
      >
        {strings.settings.preparingNetwork}
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
