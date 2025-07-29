import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {PrivacyPolicy} from '~/features/Legal/PrivacyPolicy/PrivacyPolicy'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'

export const PrivacyPolicyScreen = () => {
  const {atoms: ta} = useTheme()
  const {languageCode} = useLanguage()

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[ta.bg_color_max, a.flex_1]}
    >
      <ScrollView contentContainerStyle={[a.p_lg]}>
        <PrivacyPolicy languageCode={languageCode} />
      </ScrollView>
    </SafeAreaView>
  )
}
