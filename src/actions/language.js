import {Alert} from 'react-native'
import l10n from '../l10n'
import storage from '../utils/storage'
import {Logger} from '../utils/logging'

import {type Dispatch} from 'redux'

const LOCAL_STORAGE_KEY_LANG = '/settings/language'

const changeLanguage = (languageCode) => (dispatch, getState) => {
  l10n.setLanguage(languageCode)
  dispatch({
    path: ['languageCode'],
    payload: languageCode,
    reducer: (state, languageCode) => languageCode,
    type: 'CHANGE_LANGUAGE',
  })
}

export const changeAndSaveLanguage = (languageCode: string) => async (
  dispatch: Dispatch<any>,
) => {
  try {
    await storage.write(LOCAL_STORAGE_KEY_LANG, languageCode)
    dispatch(changeLanguage(languageCode))
  } catch (e) {
    Logger.error(
      'Saving language to AsyncStorage failed. UI language left intact',
      e,
    )
    // TODO add missing localization
    Alert.alert('Error', 'Could not set selected language.')
  }
}

export const loadLanguage = () => async (dispatch: Dispatch<any>) => {
  try {
    const languageCode = await storage.read(LOCAL_STORAGE_KEY_LANG)
    if (languageCode) {
      dispatch(changeLanguage(languageCode))
    }
    return languageCode
  } catch (e) {
    Logger.error(
      'Loading language from AsyncStorage failed. UI language left intact.',
      e,
    )
    throw e
  }
}

export default {
  changeAndSaveLanguage,
  changeLanguage,
}
