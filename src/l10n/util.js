export const pluralize = (number, variants) => {
  return variants[number] || variants.default
}

// english has simple pluralization
export const pluralizeEn = (number, one, other) =>
  // eslint-disable-next-line
  pluralize(number, {'1': one, default: other})
