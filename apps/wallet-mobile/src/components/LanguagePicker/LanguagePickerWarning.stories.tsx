import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {LanguagePickerWarning} from './LanguagePickerWarning'

storiesOf('LanguagePickerWarning', module).add('Enabled', () => <LanguagePickerWarning enabled />)
