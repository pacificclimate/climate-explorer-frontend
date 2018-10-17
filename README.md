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


#### Build docker image

Clone repo:

```bash
git clone https://github.com/pacificclimate/climate-explorer-frontend
cd climate-explorer-frontend
```

Build a docker image:

```bash
docker build -t pcic/climate-explorer-frontend-image .
```

#### Run docker image

The following environment variables must be set:

- `NODE_ENV` 
  (set to `'production'` for production environment; 
  anything other value, including undefined, defaults to dev)
- `CE_BACKEND_URL` (base URL of backend API)
- `CE_ENSEMBLE_NAME` 
   (final last-ditch fallback in case invalid ensemble name is used in URLs; 
   in all normal use cases is ignored; could reasonably omit)
- `NCWMS_URL` (base URL of ncWMS server)
- `TILECACHE_URL` (base URL of TileCache server)
- `CE_BASE_PATH` 
  (base **path** of the URL for the Marmot frontend app; 
  set this to the path component of the URL for Marmot configured in 
  our proxy server;
  e.g., `/marmot/app`)

Typical production run:

```bash
docker run --restart=unless-stopped -d 
  -p <external port>:8080 
  -e NODE_ENV=production 
  -e CE_BACKEND_URL=https://services.pacificclimate.org/marmot/api 
  -e CE_ENSEMBLE_NAME=ce 
  -e NCWMS_URL=https://services.pacificclimate.org/marmot/ncwms 
  -e TILECACHE_URL=https://tiles.pacificclimate.org/tilecache/tilecache.py 
  -e CE_BASE_PATH=/marmot/app 
  --name climate-explorer-frontend
  pcic/climate-explorer-frontend:latest
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
