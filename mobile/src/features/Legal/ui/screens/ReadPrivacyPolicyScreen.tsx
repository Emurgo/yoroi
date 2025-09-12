import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {PrivacyPolicy} from '~/features/Legal/ui/shared/PrivacyPolicy/PrivacyPolicy'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'

export const ReadPrivacyPolicyScreen = () => {
  const {languageCode} = useLanguage()

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.px_lg]}
    >
      <PrivacyPolicy languageCode={languageCode} />
    </SafeAreaView>
  )
}
