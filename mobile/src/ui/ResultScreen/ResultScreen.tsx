import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useBlockGoBack} from '~/kernel/navigation/hooks/useBlockGoBack'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {Button, ButtonType} from '~/ui/Button/Button'
import {FailedTxIcon} from '~/ui/FailedTxIcon/FailedTxIcon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {SuccessfulTxIcon} from '~/ui/SuccessfulTxIcon/SuccessfulTxIcon'

import {useResultScreenDefaults} from './ResultScreenContext'
import {ResultScreenParams} from './types'

export const ResultScreen = (props?: ResultScreenParams) => {
  useBlockGoBack()
  const {palette: p, atoms: ta} = useTheme()
  const navParams = useUnsafeParams<ResultScreenParams>()

  // Use props if provided, otherwise use navigation params
  const params = props ?? navParams

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
      {type === 'success' && <View style={{height: 144}} />}

      {type === 'error' && <Space.Height._2xl />}

      {defaultIcon}

      {type === 'success' && <Space.Height.lg />}
      {type === 'error' && <Space.Height._2xl />}
      {type === 'error' && <Space.Height.lg />}

      <Text
        style={[
          {
            color: p.gray_max,
            fontSize: type === 'error' ? 24 : undefined,
            fontWeight: type === 'error' ? '600' : undefined,
            paddingHorizontal: type === 'error' ? 8 : undefined,
            textAlign: 'center',
          },
          type === 'success' ? a.heading_3_medium : undefined,
          type === 'success' ? a.px_sm : undefined,
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          {
            color: p.gray_600,
            maxWidth: type === 'success' ? 330 : undefined,
            fontSize: type === 'error' ? 16 : undefined,
            lineHeight: type === 'error' ? 24 : undefined,
            fontWeight: type === 'error' ? '400' : undefined,
            textAlign: 'center',
          },
          type === 'success' ? a.body_1_lg_regular : undefined,
        ]}
      >
        {message}
      </Text>

      {params.customContent}

      {type === 'success' && <Space.Height._2xs fill />}
      {type === 'error' && <View style={{flex: 1}} />}

      <Actions type={type}>
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
            style={type === 'error' ? [{paddingHorizontal: 16}] : a.px_lg}
          />
        )}
      </Actions>
    </SafeArea>
  )
}

const Actions = ({
  children,
  type,
}: {
  children: React.ReactNode
  type: ResultScreenParams['type']
}) => {
  const {palette: p} = useTheme()

  if (type === 'success') {
    return (
      <View style={[a.self_stretch, a.border_t, {borderTopColor: p.gray_200}]}>
        {children}
      </View>
    )
  }

  return <View style={{alignSelf: 'stretch'}}>{children}</View>
}
