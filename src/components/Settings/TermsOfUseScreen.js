// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import {withNavigationTitle} from '../../utils/renderUtils'
import {Text} from '../UiKit'
import Screen from '../../components/Screen'

import styles from './styles/TermsOfUseScreen.styles'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.termsOfUseScreen

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

const ListItem = ({item, text}) => (
  <View style={styles.textContainer}>
    <Text style={styles.textListItem}>{item}</Text>
    <Text style={styles.textParagraph}>{text}</Text>
  </View>
)

const TermsOfUseScreen = ({translations}: Props) => (
  <Screen scroll>
    <View style={styles.root}>
      <Paragraph text={translations.paragraph} />

      <Heading text={translations.heading1} />
      <ListItem item={translations.item1a} text={translations.paragraph1a} />
      <ListItem item={translations.item1b} text={translations.paragraph1b} />
      <ListItem item={translations.item1c} text={translations.paragraph1c} />
      <ListItem item={translations.item1d} text={translations.paragraph1d} />
      <ListItem item={translations.item1e} text={translations.paragraph1e} />

      <Heading text={translations.heading2} />
      <Paragraph text={translations.paragraph2} />

      <Heading text={translations.heading3} />
      <Paragraph text={translations.paragraph3} />

      <Heading text={translations.heading4} />
      <Paragraph text={translations.paragraph4} />

      <Heading text={translations.heading5} />
      <Paragraph text={translations.paragraph5} />

      <Heading text={translations.heading6} />
      <Paragraph text={translations.paragraph6} />

      <Heading text={translations.heading7} />
      <Paragraph text={translations.paragraph7} />

      <Heading text={translations.heading8} />
      <Paragraph text={translations.paragraph8} />

      <Heading text={translations.heading9} />
      <Paragraph text={translations.paragraph9} />

      <Heading text={translations.heading10} />
      <Paragraph text={translations.paragraph10a} />
      <Paragraph text={translations.paragraph10b} />
      <Paragraph text={translations.paragraph10c} />
      <Paragraph text={translations.paragraph10d} />

      <Heading text={translations.heading11} />
      <ListItem item={translations.item11a} text={translations.paragraph11a} />
      <ListItem item={translations.item11b} text={translations.paragraph11b} />
      <ListItem item={translations.item11c} text={translations.paragraph11c} />
      <ListItem item={translations.item11d} text={translations.paragraph11d} />
      <ListItem item={translations.item11e} text={translations.paragraph11e} />
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withNavigationTitle(({translations}) => translations.title),
)(TermsOfUseScreen)
