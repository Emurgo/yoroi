export const isFileKey = ({key, path}: {key: string; path: string}) =>
  !key.slice(path.length).includes('/')
