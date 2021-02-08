import ExpoMixpanel from '../src/expo-mixpanel'
import Constants from 'expo-constants'

describe('Mixpanel', () => {
  let mixpanelTracker

  beforeEach(async () => {
    mixpanelTracker = new ExpoMixpanel('random-token-string')
    await mixpanelTracker.init()
  })

  describe('after .init', () => {
    it('defaults the userId to Constants.deviceId', () => {
      expect(mixpanelTracker.userId).toBe(Constants.deviceId)
    })

    describe('.track', () => {
      it('logs error message to the console if an invalid operation is used', async () => {
        const error =
          '\'nonexistent-operation\' is not a valid Mixpanel operation for the track endpoint. This operation will not be tracked.'
        console.log = jest.fn()
        mixpanelTracker.track('Event Name', 'nonexistent-operation')
        expect(console.log).toHaveBeenCalledWith(error)
      })

      it('calls _flush', () => {
        mixpanelTracker._flush = jest.fn()
        mixpanelTracker.track('Event Name', 'live-event')
        expect(mixpanelTracker._flush).toHaveBeenCalledWith('live-event')
      })
    })

    describe('.identify', () => {
      it('calls _push with correct arguments', () => {
        mixpanelTracker._push = jest.fn()
        mixpanelTracker.identify(3)
        expect(mixpanelTracker._push).toHaveBeenCalledWith(
          {
            event: '$identify',
            properties: {
              app_id: 'manifest-name',
              app_name: 'manifest name',
              app_version: 1,
              client_id: 123,
              device_name: undefined,
              distinct_id: 123,
              model: 'XS',
              os_version: 'who-cares',
              platform: 'ios',
              screen_size: '750x1334',
              token: 'random-token-string',
              user_agent: undefined
            }
          },
          'create-identity',
          'track'
        )
      })

      it('correctly sets userId', () => {
        const newId = 456
        expect(mixpanelTracker.userId).toBe(Constants.deviceId)
        mixpanelTracker.identify(newId)
        expect(mixpanelTracker.userId).toBe(newId)
      })
    })

    describe('.reset', () => {
      it('calls identify with clientId', () => {
        mixpanelTracker.identify = jest.fn()
        mixpanelTracker.reset()
        expect(mixpanelTracker.identify).toHaveBeenCalledWith(Constants.deviceId)
      })

      it('correctly resets userId with Constants.deviceId', () => {
        const newId = 789
        mixpanelTracker.identify(newId)
        expect(mixpanelTracker.userId).toBe(newId)
        mixpanelTracker.reset()
        expect(mixpanelTracker.userId).toBe(Constants.deviceId)
      })
    })

    describe('.people', () => {
      it('console logs if userId is not defined', () => {
        const error = 'userId not found. profile-set will not be tracked in Mixpanel.'
        console.log = jest.fn()
        mixpanelTracker.identify(null)
        mixpanelTracker.people('profile-set', {})
        expect(console.log).toHaveBeenCalledWith(error)
      })

      it('console logs if operation is invalid', () => {
        const error = '\'invalid-operation\' is not a valid Mixpanel operation for the engage endpoint. This operation will not be tracked.'
        console.log = jest.fn()
        mixpanelTracker.people('invalid-operation', {})
        expect(console.log).toHaveBeenCalledWith(error)
      })

      it('calls _push with correct arguments', () => {
        mixpanelTracker._push = jest.fn()
        mixpanelTracker.people('profile-set', {})
        expect(mixpanelTracker._push).toHaveBeenCalledWith(
          {
            '$distinct_id': 123,
            '$token': 'random-token-string'
          },
          'profile-set',
          'engage'
        )
      })
    })

    describe('.group', () => {
      it('console logs if userId is not defined', () => {
        const error = 'userId not found. group-set will not be tracked in Mixpanel.'
        console.log = jest.fn()
        mixpanelTracker.identify(null)
        mixpanelTracker.group('group-set', {})
        expect(console.log).toHaveBeenCalledWith(error)
      })

      it('console logs if operation is invalid', () => {
        const error = '\'invalid-operation\' is not a valid Mixpanel operation for the groups endpoint. This operation will not be tracked.'
        console.log = jest.fn()
        mixpanelTracker.group('invalid-operation', {})
        expect(console.log).toHaveBeenCalledWith(error)
      })

      it('calls _push with correct arguments', () => {
        mixpanelTracker._push = jest.fn()
        mixpanelTracker.group('group-set', {})
        expect(mixpanelTracker._push).toHaveBeenCalledWith(
          {
            '$distinct_id': 123,
            '$token': 'random-token-string'
          },
          'group-set',
          'groups'
        )
      })
    })
  })

  describe('before .init and with a token', () => {
    let mixpanelTracker

    beforeEach(() => {
      mixpanelTracker = new ExpoMixpanel('random-token-string')
      mixpanelTracker._fakeMixpanel = jest.fn()
    })

    describe('.track', () => {
      it('calls ._fakeMixpanel', () => {
        mixpanelTracker.track('Event Name', 'live-event')
        expect(mixpanelTracker._fakeMixpanel).toHaveBeenCalled()
      })
    })

    describe('.identify', () => {
      it('calls ._fakeMixpanel', () => {
        mixpanelTracker.identify(3)
        expect(mixpanelTracker._fakeMixpanel).toHaveBeenCalled()
      })
    })

    describe('.reset', () => {
      it('calls ._fakeMixpanel', () => {
        mixpanelTracker.reset()
        expect(mixpanelTracker._fakeMixpanel).toHaveBeenCalled()
      })
    })

    describe('.people', () => {
      it('calls ._fakeMixpanel', () => {
        mixpanelTracker.people('profile-set', {})
        expect(mixpanelTracker._fakeMixpanel).toHaveBeenCalled()
      })
    })

    describe('.group', () => {
      it('calls ._fakeMixpanel', () => {
        mixpanelTracker.group('group-set', {})
        expect(mixpanelTracker._fakeMixpanel).toHaveBeenCalled()
      })
    })
  })

  describe('before .init and without a token', () => {
    let mixpanelTracker

    beforeEach(() => {
      mixpanelTracker = new ExpoMixpanel()
      mixpanelTracker._fakeMixpanel = jest.fn()
    })

    describe('.track', () => {
      it('calls ._fakeMixpanel', () => {
        mixpanelTracker.track('Event Name', 'live-event')
        expect(mixpanelTracker._fakeMixpanel).toHaveBeenCalled()
      })
    })

    describe('.identify', () => {
      it('calls ._fakeMixpanel', () => {
        mixpanelTracker.identify(3)
        expect(mixpanelTracker._fakeMixpanel).toHaveBeenCalled()
      })
    })

    describe('.reset', () => {
      it('calls ._fakeMixpanel', () => {
        mixpanelTracker.reset()
        expect(mixpanelTracker._fakeMixpanel).toHaveBeenCalled()
      })
    })

    describe('.people', () => {
      it('calls ._fakeMixpanel', () => {
        mixpanelTracker.people('profile-set', {})
        expect(mixpanelTracker._fakeMixpanel).toHaveBeenCalled()
      })
    })

    describe('.group', () => {
      it('calls ._fakeMixpanel', () => {
        mixpanelTracker.group('group-set', {})
        expect(mixpanelTracker._fakeMixpanel).toHaveBeenCalled()
      })
    })
  })

  describe('._fakeMixpanel', () => {
    let mixpanelTracker
    beforeAll(() => {
      mixpanelTracker = new ExpoMixpanel('random-token-string')
    })

    it('does not console.log in the test environment', () => {
      console.log = jest.fn()
      mixpanelTracker._fakeMixpanel()
      expect(console.log).not.toHaveBeenCalled()
    })

    it('does console.log outside of the test environment', () => {
      process.env.NODE_ENV = 'development'
      console.log = jest.fn()
      mixpanelTracker._fakeMixpanel()
      expect(console.log).toHaveBeenCalled()
      process.env.NODE_ENV = 'test'
    })

    it('properly console.logs objects and strings', () => {
      process.env.NODE_ENV = 'development'
      console.log = jest.fn()
      mixpanelTracker._fakeMixpanel('fake-operation', 'cool', { thing: 'yes' })
      expect(console.log).toHaveBeenCalledWith(
        'Not sent to Mixpanel: ',
        'fake-operation',
        'cool',
        { thing: 'yes' }
      )
      process.env.NODE_ENV = 'test'
    })
  })

  describe('.init', () => {
    describe('ios', () => {
      it('correctly sets the platform to ios', async () => {
        await mixpanelTracker.init()
        expect(mixpanelTracker.platform).toBe('ios')
      })
    })

    describe('android', () => {
      it('correctly sets the platform to android', async () => {
        jest.mock('react-native/Libraries/Utilities/Platform', () => {
          return {
            OS: 'Google'
          }
        })

        await mixpanelTracker.init()
        expect(mixpanelTracker.platform).toBe('android')
      })
    })
  })
})
