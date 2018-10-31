// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import {withNavigationTitle} from '../../utils/renderUtils'
import {Text} from '../UiKit'
import Screen from '../Screen'

import styles from './styles/TermsOfServiceScreen.styles'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.TermsOfServiceScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
}

const Heading = ({text}) => (
  <View style={styles.textContainer}>
    <Text style={styles.textHeading}>{text}</Text>
  </View>
)

const Paragraph = ({text}) => (
  <View style={styles.textContainer}>
    <Text style={styles.textParagraph}>{text}</Text>
  </View>
)

const ListItem = ({heading, text}) => (
  <View style={styles.textContainer}>
    <Text style={styles.textListItem}>{heading}</Text>
    <Text style={styles.textParagraph}>{text}</Text>
  </View>
)

const mapping = {
  heading: Heading,
  paragraph: Paragraph,
  listItem: ListItem,
}

const TermsOfServiceScreen = ({translations}: Props) => (
  <Screen scroll>
    <View style={styles.root}>
      {translations.content.map((item, i) => {
        const Element = mapping[item.type]
        return <Element key={i} {...item} />
      })}
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withNavigationTitle(({translations}) => translations.title),
)(TermsOfServiceScreen)
