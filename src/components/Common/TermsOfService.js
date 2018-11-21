// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'

import {Text} from '../UiKit'

import styles from './styles/TermsOfService.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.TermsOfServiceScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
}

const Heading = ({text}) => <Text style={styles.heading}>{text}</Text>

const Paragraph = ({text}) => <Text style={styles.paragraph}>{text}</Text>

const ListItem = ({heading, text}) => (
  <>
    <Heading text={heading} />
    <Paragraph text={text} />
  </>
)

const mapping = {
  heading: Heading,
  paragraph: Paragraph,
  listItem: ListItem,
}

const TermsOfService = ({translations}: Props) => (
  <>
    {translations.content.map((item, i) => {
      const Element = mapping[item.type]
      return <Element key={i} {...item} />
    })}
  </>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
)(TermsOfService)
