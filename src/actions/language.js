// @flow

import {writeAppSettings, APP_SETTINGS_KEYS} from '../helpers/appSettings'

import {type Dispatch} from 'redux'

import {setLanguage} from '../i18n'

export const changeLanguage = (languageCode: string) => (dispatch: Dispatch<any>) => {
  setLanguage(languageCode)
  dispatch({
    path: ['appSettings', 'languageCode'],
    payload: languageCode,
    reducer: (state, languageCode) => languageCode,
    type: 'CHANGE_LANGUAGE',
  })
}

export const changeAndSaveLanguage = (languageCode: string) => async (dispatch: Dispatch<any>) => {
  await writeAppSettings(APP_SETTINGS_KEYS.LANG, languageCode)

  dispatch(changeLanguage(languageCode))
}

export default {
  changeAndSaveLanguage,
  changeLanguage,
}
