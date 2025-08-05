import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'

export const WarningSingleAddress = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {navigateToUtxoConsolidation} = useWalletNavigation()

  return (
    <View
      style={[
        a.p_lg,
        a.gap_md,
        a.rounded_sm,
        {backgroundColor: p.sys_magenta_100},
      ]}
    >
      <Icon.Warning size={20} color={p.sys_magenta_500} />

      <Text style={[{color: p.gray_900}, a.body_2_md_regular]}>
        {strings.transactions.organizeWalletDescription}
      </Text>

      <Button
        type={ButtonType.Critical}
        title={strings.transactions.organizeWalletButton}
        size="S"
        onPress={navigateToUtxoConsolidation}
      />
    </View>
  )
}
