// @flow
import fs from 'fs'
import path from 'path'
import process from 'process'
import _ from 'lodash'

import l10n from './index'
import {Logger} from '../utils/logging'

const IOS_LANGUAGE_CODE = {
  [l10n.LANGUAGES.ENGLISH]: 'en',
  // TODO: Add when chinese is available
  // [l10n.LANGUAGES.CHINESE_SIMPLIFIED]: 'zh-Hans',
  // [l10n.LANGUAGES.CHINESE_TRADITIONAL]: 'zh-Hant',
  [l10n.LANGUAGES.KOREAN]: 'ko',
  [l10n.LANGUAGES.JAPANESE]: 'ja',
  [l10n.LANGUAGES.RUSSIAN]: 'ru',
}

const SYSTEM_TRANSLATION_FILE = 'InfoPlist.strings'

const getTranslationDir = (language) => {
  const iosLanguageCode = IOS_LANGUAGE_CODE[language]
  return `ios/${iosLanguageCode}.lproj/`
}

const getSystemTranslations = (language) => {
  l10n.translations.setLanguage(language)
  return l10n.translations.global.ios
}

const createTranslationDirectoryIfNeeded = (language) => {
  const translationsDir = getTranslationDir(language)
  if (!fs.existsSync(translationsDir)) {
    try {
      fs.mkdirSync(translationsDir)
    } catch (error) {
      Logger.error(
        `Error while creating translation directory ${translationsDir}.`,
        error,
      )
      process.exit(1)
    }
  }

  return translationsDir
}

const saveTranslations = (translations, dir) => {
  const filepath = path.join(dir, SYSTEM_TRANSLATION_FILE)

  try {
    const data = translations.join('\n')
    fs.writeFileSync(filepath, data)
  } catch (err) {
    Logger.error('Error while saving translations', err)
    process.exit(1)
  }
}

const generateTranslations = (language) => {
  Logger.info(`Generating [${language}] translations`)

  const systemTranslations = _.toPairs(getSystemTranslations(language)).map(
    ([key, value]) => `"${key}" = "${value}";`,
  )

  if (!systemTranslations) {
    Logger.info(`Translation for language [${language}] wasn't not found.`)
    return
  }

  const translationsDir = createTranslationDirectoryIfNeeded(language)

  saveTranslations(systemTranslations, translationsDir)
}

Object.keys(IOS_LANGUAGE_CODE).forEach(generateTranslations)
