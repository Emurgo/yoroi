// This is properly Flow-typed Object.values()
// Note(ppershing): we need to cast through any because
// flow stubbornly thinks the result might be mixed
export const ObjectValues = <T>(obj: Record<string, T>): Array<T> => Object.values(obj) as unknown as Array<T>
