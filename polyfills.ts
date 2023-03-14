Object.fromEntries = Object.fromEntries || ((arr) => arr.reduce((acc, [k, v]) => ((acc[k] = v), acc), {}))

export {}