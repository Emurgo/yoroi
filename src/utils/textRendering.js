// @flow

import React from 'react'
import {Text} from 'react-native'

import {TEXT_TYPE} from '../l10n/util'

import styles from './styles/textRendering.style'

import type {FormattedText} from '../l10n/util'

const Heading = ({text}) => (
  <Text style={[styles.common, styles.heading]}>{text}</Text>
)
const Paragraph = ({text}) => (
  <Text style={[styles.common, styles.paragraph]}>{text}</Text>
)
const Normal = ({text}) => <Text style={styles.common}>{text}</Text>
const Bold = ({text}) => (
  <Text style={[styles.common, styles.bold]}>{text}</Text>
)
const ListItem = ({heading, text}) => (
  <>
    <Heading text={heading} />
    <Paragraph text={text} />
  </>
)

const Inline = ({block}) => <Text>{renderFormattedText(block)}</Text> // eslint-disable-line

const mapping = {
  [TEXT_TYPE.HEADING]: Heading,
  [TEXT_TYPE.PARAGRAPH]: Paragraph,
  [TEXT_TYPE.LIST_ITEM]: ListItem,
  [TEXT_TYPE.BOLD]: Bold,
  [TEXT_TYPE.NORMAL]: Normal,
  [TEXT_TYPE.INLINE]: Inline,
}

export const renderFormattedText = (text: Array<FormattedText>) => (
  <>
    {text.map((item, i) => {
      const Element = mapping[item.type]

      return <Element key={i} {...item} />
    })}
  </>
)
