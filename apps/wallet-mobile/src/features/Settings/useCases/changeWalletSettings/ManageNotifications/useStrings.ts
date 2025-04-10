import {useIntl} from 'react-intl'

import {messages as manageNotificationDisplayDurationMessages} from './ManageNotificationDisplayDuration/strings'

export const useStrings = () => {
  const intl = useIntl()
  return {
    manageDisplayDurationScreenTitle: intl.formatMessage(manageNotificationDisplayDurationMessages.displayDuration),
  }
}
