import {App} from '@yoroi/types'
import {freeze} from 'immer'

import {ThemeName, ThemeStorage} from '../../types'

const themeNameKey = 'theme-name'

export const themeStorageMaker = ({
  storage,
}: {
  storage: App.ObservableStorage<false>
}): ThemeStorage => {
  const save = (name: ThemeName) =>
    storage.setItem<ThemeName>(themeNameKey, name)

  const read = () => storage.getItem<ThemeName>(themeNameKey)

  return freeze({
    save,
    read,
    key: themeNameKey,
  })
}
