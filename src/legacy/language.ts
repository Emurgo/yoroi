/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Dispatch} from 'redux'

import {setLanguage} from '../../legacy/i18n'
import {APP_SETTINGS_KEYS, writeAppSettings} from './appSettings'

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
