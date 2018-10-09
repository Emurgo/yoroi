export const pluralize = (number, variants) => {
  return variants[number] || variants.default
}

// english has simple pluralization
// eslint-disable-next-line
export const pluralizeEn = (number, one, other) => pluralize(number, {'1': one, default: other})
