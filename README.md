# mblog1

## DEMO

https://mblog4tiyogo.firebaseapp.com

## Prerequisites

### Polymer CLI

Install [polymer-cli](https://github.com/Polymer/polymer-cli):
(Need at least npm v0.3.0)

    npm install -g polymer-cli

Firebase Tools
    npm install -g firebase-tools

## Build

    polymer build

## About Unpublished Files
The files under `src/unpublished` folder are tend to be hidden. Since they are non-disclosure data like API keys. However, users are freely to provide their own ones. Here is the interfaces that users need to implement in order to make the app run:

### Firebase App
The `firebase-app` is the core for using Firebase services. In order to implement it, users need to:

 1. Create `src/unpublished/firebase-app-wrapper.html`
 2. In that file, create an element `firebase-app-wrapper` which encloses you own `firebase-app` element alone with its configuration like API key and storage URL.

Example:
```
<dom-module id="firebase-app-wrapper">
  <template>
    <firebase-app api-key="0123456789abcdefg"
                  auth-domain="sameple.firebaseapp.com"
                  database-url="https://sample.firebaseio.com"
                  storage-bucket="sample.appspot.com"
                  messaging-sender-id="abcdef123456">
    </firebase-app>
  </template>
  <script>
    Polymer({
      is: 'firebase-app-wrapper'
    });
  </script>
</dom-module>
```

### Key Storage
There are other scenario which users only need to provide API key string. They are all integrated into the `key-storage` element. Here is the implementation steps:
 
 1. Create `src/unpublished/key-storage.html`
 2. Create an element `key-storage`, which exposes API keys as `String` properties. 

Required API key(s) so far:
 - `googleApi`. Google API key for various of google apps

Example:
```
<script>
  Polymer({
    is: 'key-storage',
    
    properties: {
      googleApi: {
        type: String,
        readOnly: true,
        notify: true,
        value: '012345abcde7890'
      }
    }
  });
</script>
```
