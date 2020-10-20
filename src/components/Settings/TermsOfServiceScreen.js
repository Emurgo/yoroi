// @flow

import React from 'react'
import {compose} from 'redux'
import {SafeAreaView} from 'react-navigation'
import {ScrollView} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'

import {StatusBar} from '../UiKit'
import TermsOfService from '../Common/TermsOfService'
import {withNavigationTitle} from '../../utils/renderUtils'

import styles from './styles/TermsOfServiceScreen.styles'

const messages = defineMessages({
  title: {
    id: 'components.settings.termsofservicescreen.title',
    defaultMessage: '!!!Terms of Service Agreement',
    description: 'some desc',
  },
})

const TermsOfServiceScreen = () => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <ScrollView>
      <TermsOfService />
    </ScrollView>
  </SafeAreaView>
)

export default injectIntl(
  compose(withNavigationTitle(({intl}) => intl.formatMessage(messages.title)))(
    TermsOfServiceScreen,
  ),
)
