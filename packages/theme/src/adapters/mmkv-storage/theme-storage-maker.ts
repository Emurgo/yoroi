import {App} from '@yoroi/types'
import {freeze} from 'immer'

import {SupportedThemes, ThemeStorage} from '../../types'

const themeNameKey = 'theme-name'

export const themeStorageMaker = ({
  storage,
}: {
  storage: App.ObservableStorage<false>
}): ThemeStorage => {
  const save = (name: SupportedThemes) =>
    storage.setItem<SupportedThemes>(themeNameKey, name)

  const read = () => storage.getItem<SupportedThemes>(themeNameKey)

  return freeze({
    save,
    read,
    key: themeNameKey,
  })
}
