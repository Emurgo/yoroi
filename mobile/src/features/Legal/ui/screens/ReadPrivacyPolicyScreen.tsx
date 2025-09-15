import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLanguage} from '~/kernel/i18n/LanguageProvider'

import {PrivacyPolicy} from '../shared/PrivacyPolicy/PrivacyPolicy'

export const ReadPrivacyPolicyScreen = () => {
  const {languageCode} = useLanguage()
  const {atoms: ta} = useTheme()

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.px_lg, ta.bg_color_max]}
    >
      <PrivacyPolicy languageCode={languageCode} />
    </SafeAreaView>
  )
}
