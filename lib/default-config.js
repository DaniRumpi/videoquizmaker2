// This is the default configuration for the Popcorn Maker server
// You shouldn't edit this file. Instead, look at the README for
// various configuration options

module.exports = {
  // hostname must match the address in your browser's URL bar
  // If it does not, then Persona sign-in will not work
  // Don't add any trailing slashes, just protocol://hostname[:port]
  "hostname": "http://videoquizmaker.herokuapp.com",

  // PORT is the port that the server will bind to
  // PORT is all caps because all the PaaS providers do it this way
  "PORT": 80,
  
  // API Keys for Media Sync
  "SYNC_SOUNDCLOUD": "d2idm12domodo12mdo12mdo2d12d",
  "SYNC_FLICKR": "b939e5bd8aa696db965888a31b2f1964",
  // Public API Key
  "SYNC_GIPHY": "dc6zaTOxFJmzC",
  "SYNC_LIMIT": 20,

  // NODE_ENV is the environment you're running the server in
  // It determines whether to apply optimizations or not
  // Any string is an acceptable value, but most node modules care
  // whether it's set to "development" or "production"
  "NODE_ENV": "production",

  "logger" : {
    "format" : "dev"
  },
  "session" : {
    "secret": "thisisareallyreallylongsecrettoencryptcookies",
    "cookie": {
      "maxAge": 2419200000,
      "httpOnly": true,
    },
    "proxy": true
  },
  "staticMiddleware": {
    "maxAge": "0"
  },
  "dirs": {
    "wwwRoot": "public",
    "templates": "public/templates"
  },
  "publishStore": {
    "type": "local",
    "options": {
      "root": "./user_published",
      "namePrefix": "v",
      "nameSuffix": ".html"
    }
  },
  "feedbackStore": {
    "type": "local",
    "options": {
      "root": "./user_published",
      "namePrefix": "feedback",
      "nameSuffix": ".json"
    }
  },
  "crashStore": {
    "type": "local",
    "options": {
      "root": "./user_published",
      "namePrefix": "crash",
      "nameSuffix": ".json"
    }
  },
  "imageStore": {
    "type": "local",
    "options": {
      "root": "./user_published",
      "namePrefix": "images"
    }
  },
  "templates": {
    "basic": "{{templateBase}}basic/config.json",
    "test": "{{templateBase}}basic/config.json"
  },
  "database": {
    "database": "popcorn",
    "username": null,
    "password": null,
    "options": {
      "logging": false,
      "dialect": "sqlite",
      "storage": "popcorn.sqlite",
      "define": {
        "charset": "utf8",
        "collate": "utf8_general_ci"
      }
    }
  }
};
