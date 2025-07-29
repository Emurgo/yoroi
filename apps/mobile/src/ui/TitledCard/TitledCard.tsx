import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {View} from 'react-native'

import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

type ExternalProps = {
  title?: string
  children: React.ReactNode
  variant?: string
  testID?: string
}

export const TitledCard = ({title, children, testID}: ExternalProps) => {
  const {palette: p} = useTheme()
  return (
    <View>
      {title !== undefined && (
        <Text
          style={[
            a.body_1_lg_regular,
            a.justify_center,
            {color: p.text_gray_low},
          ]}
        >
          {title}
        </Text>
      )}

      <Space.Height.sm />

      <View
        style={[
          a.p_lg,
          {borderWidth: 1, borderRadius: 8, borderColor: p.gray_200},
        ]}
        testID={testID}
      >
        {children}
      </View>
    </View>
  )
}
