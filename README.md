[![<CircleCI>](https://circleci.com/gh/julienfitz/expo-mixpanel.svg?style=shield)](https://app.circleci.com/pipelines/github/julienfitz/expo-mixpanel)
![](https://img.shields.io/badge/dynamic/json?color=blue&label=version&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2Fjulienfitz%2Fexpo-mixpanel%2Fmain%2Fpackage.json)

# expo-mixpanel-http

A library for interacting with the [Mixpanel HTTP API](https://developer.mixpanel.com/reference/overview) in Expo projects. Mixpanel provides [many great SDKs](https://developer.mixpanel.com/docs/implement-mixpanel), but currently not one that can be easily integrated with Expo projects. This library is currently limited in scope to the [Mixpanel Ingestion API](https://developer.mixpanel.com/reference/ingestion-api) (except for the [Lookup Tables API](https://developer.mixpanel.com/reference/lookup-tables), which is not currently supported) but other APIs can be added. [File an issue](https://github.com/julienfitz/expo-mixpanel/issues/new) if you'd like to see more Mixpanel APIs supported!

To install:

`npm install expo-mixpanel-http`

or

`yarn add expo-mixpanel-http`

## Get Started

```
import ExpoMixpanel from 'expo-mixpanel-http';

// initialize a new instance of the ExpoMixpanel class and pass in
// the API token you got from your Mixpanel account. You should probably
// do this in the constructor, componentDidMount, or a similar
// early lifecycle method.
const mixpanel = new ExpoMixpanel('token-you-got-from-mixpanel');

// call .init() before you call any other ExpoMixpanel methods
// this collects device and other data 
await mixpanel.init()
```

## Available Methods

### `.init()`

This method collects a number of different data points, mostly about the device, using the `expo-constants` library and sets them as the value for various properties. These properties are then passed on to Mixpanel. You need to call this method first before any others, otherwise no data will be sent.

### `.track(eventName, operation, props)`

This is the method through which events are tracked in Mixpanel. More information is available for each of the available tracking operations in the Mixpanel documentation [here](https://developer.mixpanel.com/reference/events#track-event).

`eventName`: the name of the event as you'd like it to appear in Mixpanel

`operation`: which event tracking operation you want to use. Find details for each in the [Mixpanel documentation](https://developer.mixpanel.com/reference/events#track-event). Options include:

`create-identity`  
`live-event`  
`live-event-deduplicate`  
`past-events-batch`  
`past-events`  

`props`: (optional) any additional properties you want to pass along to Mixpanel. This should be a plain JavaScript object.

Example:
```
mixpanel.track('page views', 'live-event', { account_number: 1234 })
```

### `.identify(userId)`

Identifies a user with a unique ID to track user activity across devices, tie a user to their events, and create a user profile. Learn more in the [Mixpanel documentation](https://developer.mixpanel.com/reference/identities#create-identity).

`userId`: any ID you'd like to use to identify the user. By default, the user ID is `Constants.deviceId`.

### `.reset()`

Resets the user's unique ID to the default device ID.

### `.people(operation, props)`

The interface for all user profile operations, as documented by Mixpanel [here](https://developer.mixpanel.com/reference/user-profiles).

`operation`: one of the following valid user profile operations (more information on each is available [here](https://developer.mixpanel.com/reference/user-profiles)):

`profile-set`  
`profile-set-once`  
`profile-numerical-add`  
`profile-list-append`  
`profile-list-remove`  
`profile-unset`  
`profile-batch-update`  
`profile-delete`  

`props`: (optional) any additional properties you want to pass along to Mixpanel. Should be a plain JavaScript object.

Example:
```
mixpanel.people('profile-set', { account_number: 1234 })
```

### `.group(operation, props)`

Interface for all group operations, as documented by Mixpanel [here](https://developer.mixpanel.com/reference/group-profiles)

`operation`: one of the following valid group profile operations (more information on each is available [here](https://developer.mixpanel.com/reference/group-profiles)):

`group-set`  
`group-set-once`  
`group-unset`  
`group-remove-from-list`  
`group-union`  
`group-delete`  

`props`: (optional) any additional properties you want to pass along to Mixpanel. Should be a plain JavaScript object.

Example:
```
mixpanel.group('group-set', { account_number: 1234 })
```


TODO:
- address more types of Mixpanel events than those currently addressed.
- possibly extract interactions with Mixpanel HTTP API to be separate from Expo-specific interactions so the library can be used more generically.