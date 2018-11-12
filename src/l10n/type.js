// @flow
import en from './en'

const extended = {
  ...en,
  setLanguage: (code: string) => null,
}

export type Translation = typeof extended
