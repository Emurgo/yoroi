import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ErrorBoundary, FallbackProps} from 'react-error-boundary'
import {BackHandler, Platform, ScrollView, Text, View} from 'react-native'

import {useTranslatedError} from '~/hooks/useTranslatedError'
import {LocalizableError} from '~/kernel/i18n/LocalizableError'
import {logger} from '~/kernel/logger/logger'
import {Button} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'

import {ExpandableItem} from './ExpandableItem'

// TODO: Add error image
// TODO: Add translations
interface Props {
  children: React.ReactNode
  debug?: boolean
  renderError?(error: Error | LocalizableError): React.ReactNode
}

// NOTE: Unrecoverable error boundary
export function CrashBoundary({
  children,
  debug,
  renderError,
}: Props): React.ReactElement {
  const FallbackComponent = React.useCallback(
    ({error}: FallbackProps) => {
      if (renderError) {
        return <>{renderError(error as Error | LocalizableError)}</>
      }
      return (
        <ErrorView error={error as Error | LocalizableError} debug={debug} />
      )
    },
    [debug, renderError],
  )

  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={(error, info) => {
        logger.error(error, {details: info})
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

const ErrorView = ({
  error,
  debug,
}: {
  error: Error | LocalizableError
  debug?: boolean
}) => {
  const {atoms: ta} = useTheme()

  return (
    <View
      style={[
        a.px_lg,
        a.pb_lg,
        a.flex_1,
        a.justify_center,
        a.align_center,
        ta.bg_color_max,
        debug && {borderWidth: 2, borderColor: 'red'},
      ]}
    >
      <Space.Height.xl />

      <ScrollView style={[a.w_full]}>
        <View style={[a.gap_lg]}>
          <View style={[a.align_center]}>
            <Text style={[a.heading_4_regular, ta.text_gray_max]}>
              Oops!!! Something went wrong.
            </Text>

            {/* <Image source={errorImage} /> */}
          </View>

          <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
            Please consider sending this error to Yoroi mobile support.
            Unfortunately, we can not recover from this error. You need to
            relaunch the app.
          </Text>

          <View>
            <View style={[a.flex_row, a.justify_between]}>
              <MaybeTranslatedError error={error} />

              <Copiable text={`${error}:${JSON.stringify(error)}`} />
            </View>

            <ExpandableItem label="Show error">
              <Text style={[a.body_2_md_regular, ta.text_error]}>
                {error.stack || error.message || String(error)}
              </Text>
            </ExpandableItem>
          </View>
        </View>
      </ScrollView>

      {Platform.OS === 'android' && (
        <View style={[a.w_full]}>
          <Button onPress={() => BackHandler.exitApp()} title="OK" />
        </View>
      )}
    </View>
  )
}

export const MaybeTranslatedError = ({
  error,
}: {
  error?: Error | LocalizableError
}) => {
  const {atoms: ta} = useTheme()
  const translatedError = useTranslatedError(error)

  return (
    <Text style={[a.body_2_md_regular, ta.text_gray_max, a.flex_shrink]}>
      {translatedError}
    </Text>
  )
}
