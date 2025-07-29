import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
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

interface State {
  error?: Error | LocalizableError
  details: string
}

// NOTE: Unrecoverable error boundary
export class CrashBoundary extends React.Component<Props, State> {
  public state: State = {
    error: undefined,
    details: '',
  }

  public componentDidCatch(
    error: Error | LocalizableError,
    details: React.ErrorInfo,
  ) {
    logger.error(error, {details})

    this.setState({
      error,
      details: JSON.stringify(details),
    })
  }

  public static getDerivedStateFromError(
    error: Error | LocalizableError,
    details: React.ErrorInfo,
  ): State {
    return {
      error: error,
      details: JSON.stringify(details),
    }
  }

  render() {
    if (this.state.error) {
      if (this.props.renderError) {
        return this.props.renderError(this.state.error)
      }
      return <ErrorView state={this.state} debug={this.props.debug} />
    }
    return this.props.children
  }
}

const ErrorView = ({state, debug}: {state: State; debug?: boolean}) => {
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
              <MaybeTranslatedError error={state.error} />

              <Copiable text={`${state.error}:${state.details}`} />
            </View>

            <ExpandableItem label="Show error">
              <Text style={[a.body_2_md_regular, ta.text_error]}>
                {state.details}
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
