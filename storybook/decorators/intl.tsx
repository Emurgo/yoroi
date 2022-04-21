import React from 'react'

import {LanguageProvider} from '../../src/i18n'

export const withIntl = (storyFn) => <LanguageProvider>{storyFn()}</LanguageProvider>