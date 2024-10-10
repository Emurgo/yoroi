import {parseFundInfo, isFundInfo} from './validators'

describe('Validators', () => {
  describe('parseFundInfo', () => {
    it('should return undefined for invalid data', () => {
      const invalidData = {
        id: '1',
        fundName: 'Fund 1',
        fundStartTime: '2022-01-01',
      }
      expect(parseFundInfo(invalidData)).toBeUndefined()
    })

    it('should return the parsed fund info for valid data', () => {
      const validData = {
        id: 1,
        fundName: 'Fund 1',
        fundStartTime: new Date('2022-01-01'),
        fundEndTime: new Date('2022-02-01'),
        registrationSnapshotTime: new Date('2022-01-15'),
        challenges: [
          {
            id: 1,
            challengeType: 'Type 1',
            title: 'Challenge 1',
            description: 'Description 1',
            rewardsTotal: 100,
            proposersRewards: 10,
            challengeUrl: 'https://challenge1.com',
          },
          {
            id: 2,
            challengeType: 'Type 2',
            title: 'Challenge 2',
            description: 'Description 2',
            rewardsTotal: 200,
            proposersRewards: 20,
            challengeUrl: 'https://challenge2.com',
          },
        ],
        snapshotStart: new Date('2022-01-10'),
        votingStart: new Date('2022-01-20'),
        votingEnd: new Date('2022-01-25'),
        tallyingEnd: new Date('2022-01-30'),
        resultsUrl: 'https://results.com',
        surveyUrl: 'https://survey.com',
      }

      expect(parseFundInfo(validData)).toEqual(validData)
    })
  })

  describe('isFundInfo', () => {
    it('should return true for valid fund info', () => {
      const validData = {
        id: 1,
        fundName: 'Fund 1',
        fundStartTime: new Date('2022-01-01'),
        fundEndTime: new Date('2022-02-01'),
        registrationSnapshotTime: new Date('2022-01-15'),
        challenges: [
          {
            id: 1,
            challengeType: 'Type 1',
            title: 'Challenge 1',
            description: 'Description 1',
            rewardsTotal: 100,
            proposersRewards: 10,
            challengeUrl: 'https://challenge1.com',
          },
          {
            id: 2,
            challengeType: 'Type 2',
            title: 'Challenge 2',
            description: 'Description 2',
            rewardsTotal: 200,
            proposersRewards: 20,
            challengeUrl: 'https://challenge2.com',
          },
        ],
        snapshotStart: new Date('2022-01-10'),
        votingStart: new Date('2022-01-20'),
        votingEnd: new Date('2022-01-25'),
        tallyingEnd: new Date('2022-01-30'),
        resultsUrl: 'https://results.com',
        surveyUrl: 'https://survey.com',
      }

      expect(isFundInfo(validData)).toBe(true)
    })

    it('should return false for invalid fund info', () => {
      const invalidData = {
        id: '1',
        fundName: 'Fund 1',
        fundStartTime: '2022-01-01',
      }
      expect(isFundInfo(invalidData)).toBe(false)
    })
  })
})
