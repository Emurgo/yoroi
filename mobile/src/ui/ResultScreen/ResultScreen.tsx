import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {Button, ButtonType} from '~/ui/Button/Button'
import {FailedTxIcon} from '~/ui/FailedTxIcon/FailedTxIcon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {SuccessfulTxIcon} from '~/ui/SuccessfulTxIcon/SuccessfulTxIcon'

import {useResultScreenDefaults} from './ResultScreenContext'
import {ResultScreenParams} from './types'

type ResultScreenProps =
  | ResultScreenParams
  | {route?: {params?: ResultScreenParams}; navigation?: unknown}
  | {}

export const ResultScreen = (props?: ResultScreenProps) => {
  const {palette: p, atoms: ta} = useTheme()
  const strings = useStrings()
  const navigation = useNavigation()
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

  // Extract params from props if it's a React Navigation route prop
  let propsParams: ResultScreenParams | undefined
  if (props) {
    if ('route' in props && props.route?.params) {
      // React Navigation route props
      propsParams = props.route.params
    } else if (
      'type' in props &&
      !('route' in props) &&
      !('navigation' in props)
    ) {
      // Direct ResultScreenParams props
      propsParams = props as ResultScreenParams
    }
  }

  // Use props params if provided, otherwise use navigation params
  const params = propsParams ?? navParams

  if (!params) {
    throw new Error('ResultScreen: params are required')
  }

  const {type, context = 'default'} = params

  // Get defaults from context
  const defaultsForType = useResultScreenDefaults(context, type)
  const title = params.title ?? defaultsForType.defaultTitle
  const message = params.message ?? defaultsForType.defaultMessage

  // Set navigation header title - use concise title for navigation, detailed message stays in content
  // For error screens, use a short generic title; for success, use context-appropriate title
  React.useEffect(() => {
    const navigationTitle =
      type === 'error'
        ? strings.txReview.failedTxTitle // Concise title for navigation header
        : title // Use full title for success screens
    navigation.setOptions({
      title: navigationTitle,
    })
  }, [navigation, type, title, strings.txReview.failedTxTitle])
  const icon = params.icon ?? defaultsForType.defaultIcon
  const primaryAction =
    params.primaryAction ?? defaultsForType.defaultPrimaryAction
  const secondaryAction =
    params.secondaryAction ?? defaultsForType.defaultSecondaryAction

  // Default icons if none provided
  const defaultIcon =
    icon ?? (type === 'success' ? <SuccessfulTxIcon /> : <FailedTxIcon />)

  return (
    <SafeArea style={[ta.bg_color_max, a.p_lg, a.flex_1]}>
      <View style={[a.flex_1, a.align_center, a.justify_center]}>
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
      </View>

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
    <View
      style={[
        a.self_stretch,
        a.border_t,
        a.flex_row,
        a.justify_center,
        a.align_center,
        {borderTopColor: p.gray_200},
      ]}
    >
      {children}
    </View>
  )
}
