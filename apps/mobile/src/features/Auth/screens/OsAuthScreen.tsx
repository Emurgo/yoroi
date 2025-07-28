import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Text, TouchableOpacity, View} from 'react-native'
import {Icon} from '~/ui/Icon'

type Props = {
  headings: Array<string>
  subHeadings?: Array<string>

  buttons: Array<any>
  onGoBack?: () => void
  addWelcomeMessage?: boolean
}

export const OsAuthScreen = ({
  headings,
  subHeadings,
  buttons,
  onGoBack,
  addWelcomeMessage,
}: Props) => {
  const intl = useIntl()
  const {atoms: ta, palette: p} = useTheme()

  return (
    <View style={[a.flex_1, a.p_lg, ta.bg_color_max]}>
      <View style={[a.flex_1]}>
        <View style={[a.flex_1, onGoBack ? null : a.pt_lg]}>
          {onGoBack && (
            <TouchableOpacity onPress={onGoBack}>
              <Icon.Chevron direction="left" size={28} color={p.el_gray_max} />
            </TouchableOpacity>
          )}

          {headings.map((txt) => (
            <Text key={txt} style={[a.text_center, a.heading_3_medium]}>
              {txt}
            </Text>
          ))}

          {subHeadings && subHeadings.length > 0 ? (
            <View style={[a.pt_md]}>
              {subHeadings.map((txt) => (
                <Text key={txt} style={[a.text_center, ta.text_gray_medium]}>
                  {txt}
                </Text>
              ))}
            </View>
          ) : null}

          {addWelcomeMessage && (
            <View style={[a.flex_1, a.justify_center, a.align_center]}>
              <Text style={[a.text_center, {fontSize: 50, lineHeight: 60}]}>
                {intl.formatMessage(messages.welcomeMessage)}
              </Text>
            </View>
          )}
        </View>

        {buttons.length > 1 ? (
          <Actions>{buttons}</Actions>
        ) : (
          <Action>{buttons}</Action>
        )}
      </View>
    </View>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.flex_row, a.justify_between]}>{children}</View>
}

const Action = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.flex_row, a.align_stretch]}>{children}</View>
}

const messages = defineMessages({
  welcomeMessage: {
    id: 'components.common.fingerprintscreenbase.welcomeMessage',
    defaultMessage: '!!!Welcome Back',
  },
})
