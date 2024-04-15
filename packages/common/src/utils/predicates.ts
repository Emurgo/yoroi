export const hasValue = <V>(value: V | null | undefined): value is V =>
  value != null

export const hasEntryValue = <K, V>(
  entry: [K, V | null | undefined],
): entry is [K, V] => hasValue(entry[1])
