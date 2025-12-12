import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {Button, ButtonType} from '~/ui/Button/Button'
import {FailedTxIcon} from '~/ui/FailedTxIcon/FailedTxIcon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {SuccessfulTxIcon} from '~/ui/SuccessfulTxIcon/SuccessfulTxIcon'

import {useResultScreenDefaults} from './ResultScreenContext'
import {ResultScreenParams} from './types'

export const ResultScreen = (props?: ResultScreenParams) => {
  const {palette: p, atoms: ta} = useTheme()
  const navParamsRaw = useUnsafeParams<
    ResultScreenParams | {route?: {params?: ResultScreenParams}}
  >()

  // Extract actual params - handle both direct params and nested route.params structure
  let navParams: ResultScreenParams | undefined
  if (navParamsRaw) {
    if ('route' in navParamsRaw && navParamsRaw.route?.params) {
      // React Navigation sometimes wraps params in route object
      navParams = navParamsRaw.route.params as ResultScreenParams
    } else if ('type' in navParamsRaw) {
      // Direct params object
      navParams = navParamsRaw as ResultScreenParams
    }
  }

  // Use props if provided, otherwise use navigation params
  // But if props looks like a route object (has 'route' property), ignore it and use navParams
  const params =
    props && 'type' in props && !('route' in props) && !('navigation' in props)
      ? props
      : navParams

  if (!params) {
    throw new Error('ResultScreen: params are required')
  }

  const {type, context = 'default'} = params

  // Get defaults from context
  const defaultsForType = useResultScreenDefaults(context, type)
  const title = params.title ?? defaultsForType.defaultTitle
  const message = params.message ?? defaultsForType.defaultMessage
  const icon = params.icon ?? defaultsForType.defaultIcon
  const primaryAction =
    params.primaryAction ?? defaultsForType.defaultPrimaryAction
  const secondaryAction =
    params.secondaryAction ?? defaultsForType.defaultSecondaryAction

  // Default icons if none provided
  const defaultIcon =
    icon ?? (type === 'success' ? <SuccessfulTxIcon /> : <FailedTxIcon />)

  return (
    <SafeArea
      style={[
        ta.bg_color_max,
        a.p_lg,
        a.flex_1,
        a.align_center,
        a.justify_center,
      ]}
    >
      {defaultIcon}

      <Space.Height.lg />

      <Text
        style={[
          a.heading_3_medium,
          a.px_sm,
          {
            color: p.gray_max,
            textAlign: 'center',
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          a.body_1_lg_regular,
          {
            color: p.gray_600,
            maxWidth: 330,
            textAlign: 'center',
          },
        ]}
      >
        {message}
      </Text>

      {params.customContent}

      <Space.Height._2xs fill />

      <Actions>
        {secondaryAction && (
          <>
            <Button
              size="S"
              type={ButtonType.Secondary}
              onPress={secondaryAction.onPress}
              title={secondaryAction.title}
            />
            <Space.Width.lg />
          </>
        )}

        {primaryAction && (
          <Button
            onPress={primaryAction.onPress}
            title={primaryAction.title}
            style={a.px_lg}
          />
        )}
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()

  return (
    <View style={[a.self_stretch, a.border_t, {borderTopColor: p.gray_200}]}>
      {children}
    </View>
  )
}
