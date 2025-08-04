import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {TermsOfService} from '~/features/Legal/ui/TermsOfService/TermsOfService'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'

export const ReadTermsOfServiceScreen = () => {
  const {atoms: ta} = useTheme()
  const {languageCode} = useLanguage()

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <ScrollView contentContainerStyle={a.px_lg}>
        <TermsOfService languageCode={languageCode} />
      </ScrollView>
    </SafeAreaView>
  )
}
