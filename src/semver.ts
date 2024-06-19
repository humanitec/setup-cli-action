import semver from 'semver'

export const isSpecificRange = (range: string): boolean => {
  const rangeObj = new semver.Range(range)

  // Any with more than one comparator is not a specific range
  if (rangeObj.set.length !== 1 || rangeObj.set[0].length !== 1) {
    return false
  }

  // The comparator must be an exact version
  const comparator = rangeObj.set[0][0]

  return comparator.operator === '' && comparator.value !== ''
}
