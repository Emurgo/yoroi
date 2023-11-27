import {Either} from '@yoroi/types'

export function isLeft<E, T>(
  either: Either<E, T>,
): either is {tag: 'left'; error: E} {
  return either.tag === 'left'
}

export function isRight<E, T>(
  either: Either<E, T>,
): either is {tag: 'right'; value: T} {
  return either.tag === 'right'
}
