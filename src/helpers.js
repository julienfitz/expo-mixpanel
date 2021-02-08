/**
 * The most recent URL to be used with the Mixpanel HTTP API.
 *
 * @constant MIXPANEL_API_URL
 * @type {String}
 */
export const MIXPANEL_API_URL = 'https://api.mixpanel.com'

/**
 * The message used in console.logs when a user does not provide a token.
 *
 * @constant NO_TOKEN_MESSAGE
 * @type {String}
 */
export const NO_TOKEN_MESSAGE = 'No token was provided. Please provide a valid Mixpanel token when initializing a new instance of ExpoMixpanel.'

/**
 * Valid operations for user profile interactions.
 * https://developer.mixpanel.com/reference/user-profiles
 *
 * @constant VALID_PROFILE_OPERATIONS
 * @type {Set}
 */
const VALID_PROFILE_OPERATIONS = new Set([
  'profile-set',
  'profile-set-once',
  'profile-numerical-add',
  'profile-list-append',
  'profile-list-remove',
  'profile-unset',
  'profile-batch-update',
  'profile-delete'
])

/**
 * Valid operations for group interactions.
 * https://developer.mixpanel.com/reference/group-profiles
 *
 * @constant VALID_GROUP_OPERATIONS
 * @type {Set}
 */
const VALID_GROUP_OPERATIONS = new Set([
  'group-set',
  'group-set-once',
  'group-unset',
  'group-remove-from-list',
  'group-union',
  'group-delete'
])

/**
 * Valid operations for event tracking interactions.
 * https://developer.mixpanel.com/reference/events
 *
 * @constant VALID_TRACK_OPERATIONS
 * @type {Set}
 */
const VALID_TRACK_OPERATIONS = new Set([
  'create-identity',
  'live-event',
  'live-event-deduplicate',
  'past-events-batch',
  'past-events'
])

/**
 * Valid operations for all Mixpanel event types currently
 * supported by this library.
 *
 * @constant VALID_OPERATIONS
 * @type {Object}
 */
export const VALID_OPERATIONS = {
  groups: VALID_GROUP_OPERATIONS,
  engage: VALID_PROFILE_OPERATIONS,
  track: VALID_TRACK_OPERATIONS
}
