# PCIC Climate Explorer

[![Build Status](https://travis-ci.org/pacificclimate/climate-explorer-frontend.svg?branch=master)](https://travis-ci.org/pacificclimate/climate-explorer-frontend)
[![Code Climate](https://codeclimate.com/github/pacificclimate/climate-explorer-frontend/badges/gpa.svg)](https://codeclimate.com/github/pacificclimate/climate-explorer-frontend)

Front end interface for the PCIC Climate Explorer. Node, React.js, Webpack, Babel, ES6+.

## Requirements

Node.js >= 4.0

We reccomend using [nvm](https://github.com/creationix/nvm) to manage your node/npm install.

## Deployment

In progress

## Development

Uses webpack-dev-server with hot module replacement.

### Config

Front end configuration uses environment variables.

* NODE_ENV
  * set to "production" to enable production build optimization
  * default: "development"
* CE_BACKEND_URL
  * Publicly accessible URL for backend climate data
  * Development default: http://localhost:8000/api
  * Production default: http://tools.pacificclimate.org/climate-data
* TILECACHE_URL
  * Tilecache URL for basemap layers
  * default: http://tiles.pacificclimate.org/tilecache/tilecache.py
* NCWMS_URL
  * ncWMS URL for climate layers
  * default: http://tools.pacificclimate.org/ncWMS-PCIC/wms
* CE_ENSEMBLE_NAME
  * ensemble name to use for backend requests
  * default: ce

```bash
npm install
npm start
```

### Testing

```bash
npm test
```

### Linting

Linting is configured with ESLint and largely follows the AirBnb preset.

You can lint all files `npm run lint`, or a specific file `npm run lint:glob <file_name_or_glob>`.

Use the `git/hooks/pre-commit-eslint` (and install into your .git/hooks directory) to abort a commit if any staged `*.js` files fail linting (warnings OK).

If you *really* want to skip the linting during a commit, you can always run `git commit --no-verify`. However, this is not recommended.

### Setup using Docker

```bash
git clone https://github.com/pacificclimate/climate-explorer-frontend
cd climate-explorer-frontend
```

Due to security concerns about DNS rebinding attacks, webpack validates the Host header of requests made to it. If the request's Host doesn't match what webpack thinks its own host is, webpack returns an Invalid Host Header error. While run in docker, webpack's internal IP is 0.0.0.0, so any requests it receives made to any other address, such as the docker node's public address, will fail. [Here's a good article about it.](https://medium.com/webpack/webpack-dev-server-middleware-security-issues-1489d950874a)

The solution is to add a "public" argument with the docker node's public domain or ip address to the startup command for webpack in the `scripts` attribute of climate-explorer-frontend's `package.json`. 

```json
"scripts": {
    "start": "webpack-dev-server --host 0.0.0.0 --public docker.node.address.here",
    "build": "webpack --progress --colors",
    "test": "jest --verbose",
    "lint": "eslint .",
    "lint:glob": "eslint"
  },
```

Only addresses are validated, not ports, so it doesn't matter what port you assign the docker container when it is running.

Then build a docker image:

```bash
docker build -t pcic/climate-explorer-frontend-image .
```

You can set the environmental configuration variables each time you run the image using docker's -e flag. You probably only need to set `CE_BACKEND_URL` to point to wherever you've set up the data server, and maybe `CE_ENSEMBLE_NAME`. 


```bash
docker run -it -e "CE_BACKEND_URL=http://location.of.dataserver:dataserverport/api"
               -e "CE_ENSEMBLE_NAME=ce" 
               -p whateverexternalport:8080 
               --name climate-explorer-frontend
               climate-explorer-frontend-image
```

## Releasing

Creating a versioned release involves:

1. Incrementing `version` in `package.json`
2. Summarize the changes from the last version in `NEWS.md`
3. Commit these changes, then tag the release:

  ```bash
git add package.json NEWS.md
git commit -m"Bump to version x.x.x"
git tag -a -m"x.x.x" x.x.x
git push --follow-tags
  ```
