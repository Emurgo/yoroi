import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View, ViewProps} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {formatTimeSpan} from '~/wallets/utils/timeUtils'

export const PoolTransitionNotice = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {poolTransition, navigateToUpdate} = usePoolTransition()
  if (poolTransition === null) return null

  const timeSpan = poolTransition.deadlineMilliseconds - Date.now()
  const isActive = timeSpan > 0

  return (
    <View
      style={[
        a.flex_1,
        a.p_lg,
        {gap: 12, backgroundColor: p.sys_magenta_100, borderRadius: 8},
      ]}
    >
      <Row>
        <Icon.Warning size={20} color={p.sys_magenta_500} />
      </Row>

      <Text style={[a.body_2_md_regular, {color: p.gray_max}]}>
        <Text>
          {isActive
            ? strings.staking.poolWillStopRewards
            : strings.staking.poolNoRewards}
        </Text>

        {isActive && (
          <Text style={a.body_2_md_medium}>
            {'\n'}

            {formatTimeSpan(timeSpan)}
          </Text>
        )}
      </Text>

      <View style={a.flex_row}>
        <Button
          style={[{flexGrow: 0, backgroundColor: p.sys_magenta_500}]}
          onPress={navigateToUpdate}
          title={strings.staking.update}
        />
      </View>
    </View>
  )
}

const Actions = (props: ViewProps) => {
  return <View {...props} style={{flexDirection: 'row'}} />
}

const Row = (props: ViewProps) => {
  return <View {...props} style={{flexDirection: 'row', gap: 4}} />
}
