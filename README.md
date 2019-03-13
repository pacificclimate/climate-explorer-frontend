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


#### Build docker image manually

Until recently (roughly, Jan 2019), we were using Dockerhub automated builds
to build our images. Dockerhub recently changed their UI and in doing so broke
all the automated builds. For the moment we need to do manual builds.

Dockerhub images all had the name `pcic/climate-explorer-frontend`.

To distinguish our manually built images, we are omitting the `pcic/` portion
of the name and just using `climate-explorer-frontend`.

Build a docker image:

```bash
docker build -t climate-explorer-frontend .
```

#### Tag docker image

Dockerhub automatically assigned the tag `latest` to the latest build.
That was convenient, but ...

For manual build procedures, 
[tagging with `latest` is not considered a good idea](https://medium.com/@mccode/the-misunderstood-docker-tag-latest-af3babfd6375).
It is better (and easy and immediately obvious) to tag with version/release
numbers. In this example, we will tag with version 1.2.3.

1. Determine the recently built image's ID:

   ```bash
   $ docker images
   REPOSITORY                                                         TAG                 IMAGE ID            CREATED             SIZE
   climate-explorer-frontend                                          latest              14cb66d3d145        22 seconds ago      867MB

   ```
   
1. Tag the image:

   ```bash
   Tag the image
   $ docker tag 1040e7f07e5d docker-registry01.pcic.uvic.ca:5000/climate-explorer-frontend:1.2.3
   ```
   
#### Push docker image to PCIC docker registry

[PCIC maintains its own docker registry](https://pcic.uvic.ca/confluence/pages/viewpage.action?pageId=3506599). We place manual builds in this registry:

```bash
docker push docker-registry01.pcic.uvic.ca:5000/climate-explorer-frontend:1.2.3
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
  climate-explorer-frontend:<tag>
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

## Code style standard compliance

We have nominally 
[adopted](https://github.com/pacificclimate/climate-explorer-frontend/issues/138) 
the default ESLint code style.
We aren't enforcing it right now, unfortunately.

Enforcement aside, we continue to commit code that is in violation of these
standards, which is undesirable for at least two reasons: 

- Following a coding standard makes the code _much_ easier to read.
- For those of us with an IDE plugin that flags standards violations, 
  they appear _all over the place_, which is distracting to say the least.

The coding standard we adopted has a lot of rules, but the following are the
ones we are violating most. A small effort could radically reduce the number 
of new violations we introduce. In approximate order of frequency of violation:

1. Limit line length to 80 characters.
1. Use single quotes for strings. (Double quotes are visually noisier.)
1. Place a space after a begin comment delimiter. (`// comment...`, not `//comment...`.)
1. Place a space between `if` and `for` and the opening parenthesis. (`if (cond)`, not `if(cond)`)
1. Declare variables with `const` or `let`, in that order of preference; avoid `var`. (`const` and `let` are scoped.)
   - Use `for (const prop in obj)` and `for (const val of iterable)`, but `for (let i = 1; i < n; i++)`