export const convertSearchParamsToObject = (
  params: URLSearchParams,
): Record<string, any> => {
  const obj: Record<string, any> = {}

  params.forEach((value, key) => {
    const decodedValue = decodeURIComponent(value)
    // drop the index from the key if it exists e.g "targets[0]" -> "targets"
    const isArray = key.match(/\[\d+\]$/)
    const normalizedKey = key.replace(/\[\d+\]$/, '')

    try {
      const parsedValue = JSON.parse(decodedValue)
      // check if the key (without index) already exists
      if (obj.hasOwnProperty(normalizedKey)) {
        obj[normalizedKey].push(parsedValue)
      } else {
        obj[normalizedKey] = isArray ? [parsedValue] : parsedValue
      }
    } catch (e) {
      // it means it's not a JSON string
      if (obj.hasOwnProperty(normalizedKey)) {
        obj[normalizedKey].push(decodedValue)
      } else {
        obj[normalizedKey] = isArray ? [decodedValue] : decodedValue
      }
    }
  })

  return obj
}

export const convertObjectToSearchParams = (
  obj: Record<string, unknown>,
): URLSearchParams => {
  const queryParams = new URLSearchParams()
  const appendParam = (key: string, value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        // for objects in an array, we'll stringify each object
        // use a modified key to reflect the structure e.g. targets[0]
        if (typeof item === 'object' && item !== null) {
          appendParam(`${key}[${index}]`, JSON.stringify(item))
        } else {
          appendParam(`${key}[${index}]`, item)
        }
      })
    } else if (typeof value === 'object' && value !== null) {
      queryParams.append(key, JSON.stringify(value))
    } else {
      queryParams.append(key, String(value))
    }
  }
  Object.entries(obj).forEach(([key, value]) => {
    appendParam(key, value)
  })
  return queryParams
}
