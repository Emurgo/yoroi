import {isNonNullable} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {LinearGradient} from 'expo-linear-gradient'
import React, {ReactNode} from 'react'
import {ActivityIndicator, Pressable, View} from 'react-native'

import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

type Props = {
  title: string
  description: string
  onPress?(): void
  pending?: boolean
  children?: ReactNode
  showRightArrow?: boolean
  showGradient?: boolean
}

export const Action = ({
  title,
  description,
  onPress,
  pending,
  children,
  showRightArrow,
  showGradient,
}: Props) => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <Pressable onPress={onPress} disabled={pending}>
      {({pressed}) => (
        <LinearGradient
          start={{x: 1, y: 1}}
          end={{x: 0, y: 0}}
          colors={
            pending
              ? [p.bg_color_min, p.bg_color_min]
              : pressed
                ? p.bg_gradient_2
                : showGradient
                  ? p.bg_gradient_1
                  : ['transparent', 'transparent']
          }
          style={[
            a.relative,
            a.rounded_sm,
            !showGradient && [a.border, {borderColor: p.gray_200}],
          ]}
        >
          {pending && (
            <View
              style={[
                a.absolute,
                {right: a.px_lg.paddingRight},
                {top: a.py_lg.paddingTop},
              ]}
            >
              <ActivityIndicator color={p.gray_max} size="small" />
            </View>
          )}

          {showRightArrow && (
            <View
              style={[
                a.absolute,
                {right: a.px_lg.paddingRight},
                {top: a.py_lg.paddingTop},
              ]}
            >
              <Icon.ArrowRight size={24} color={p.gray_max} />
            </View>
          )}

          <View style={[a.py_lg, a.px_lg, {minHeight: 134}]}>
            <Text
              style={[a.font_semibold, a.heading_4_medium, {color: p.gray_max}]}
            >
              {title}
            </Text>

            <Text
              style={[a.font_normal, a.body_1_lg_regular, {color: p.gray_max}]}
            >
              {description}
            </Text>

            {isNonNullable(children) && (
              <>
                <Space.Height.md />

                {children}
              </>
            )}
          </View>
        </LinearGradient>
      )}
    </Pressable>
  )
}
