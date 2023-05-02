import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ActionsBanner} from '../ActionsBanner'

storiesOf('V2/TxHistoryList/ActionsBanner', module).add('Transactions', () => (
  <ActionsBanner onSearch={action('Search')} onExport={action('Export')} />
))
