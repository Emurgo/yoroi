// @flow
import {writeAppSettings, APP_SETTINGS_KEYS, loadTOS} from '../helpers/appSettings'

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

export const changeTOSLanguage = (tos: string) => (dispatch: Dispatch<any>) => {
  dispatch({
    path: ['tos'],
    payload: tos,
    reducer: (state, tos) => tos,
    type: 'CHANGE_TOS_LANGUAGE',
  })
}

export const changeAndSaveLanguage = (languageCode: string) => async (dispatch: Dispatch<any>) => {
  await writeAppSettings(APP_SETTINGS_KEYS.LANG, languageCode)
  const tos = await loadTOS(languageCode)

  dispatch(changeTOSLanguage(tos))
  dispatch(changeLanguage(languageCode))
}

export default {
  changeAndSaveLanguage,
  changeLanguage,
}
