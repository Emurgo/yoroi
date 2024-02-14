import {isFileKey} from './is-file-key'

export const isFolderKey = ({key, path}: {key: string; path: string}) =>
  !isFileKey({key, path})
