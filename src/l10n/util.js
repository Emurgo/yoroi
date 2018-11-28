// @flow

export const pluralize = (number: number, variants: Object) => {
  return variants[number] || variants.default
}

// english has simple pluralization
export const pluralizeEn = (number: number, one: string, other: string) =>
  // eslint-disable-next-line
  pluralize(number, {'1': one, default: other})

export const TEXT_TYPE = {
  HEADING: 'HEADING',
  PARAGRAPH: 'PARAGRAPH',
  LIST_ITEM: 'LIST_ITEM',
  BOLD: 'BOLD',
  NORMAL: 'NORMAL',
  INLINE: 'INLINE',
}

export type TextType = $Values<TextType>
export type FormattedText = {
  type: TextType,
  text?: string,
  heading?: string,
  block?: Array<FormattedText>,
}

export const heading = (text: string): FormattedText => ({
  type: TEXT_TYPE.HEADING,
  text,
})
export const paragraph = (text: string): FormattedText => ({
  type: TEXT_TYPE.PARAGRAPH,
  text,
})
export const listItem = (heading: string, text: string): FormattedText => ({
  type: TEXT_TYPE.LIST_ITEM,
  heading,
  text,
})
export const bold = (text: string): FormattedText => ({
  type: TEXT_TYPE.BOLD,
  text,
})
export const normal = (text: string): FormattedText => ({
  type: TEXT_TYPE.NORMAL,
  text,
})
export const inline = (block: Array<TextType>): FormattedText => ({
  type: TEXT_TYPE.INLINE,
  block,
})
