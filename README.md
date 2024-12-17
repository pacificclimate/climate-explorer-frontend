# PCIC Climate Explorer

![Node CI](https://github.com/pacificclimate/climate-explorer-frontend/workflows/Node%20CI/badge.svg)
![Docker Publishing](https://github.com/pacificclimate/climate-explorer-frontend/workflows/Docker%20Publishing/badge.svg)
[![Code Climate](https://codeclimate.com/github/pacificclimate/climate-explorer-frontend/badges/gpa.svg)](https://codeclimate.com/github/pacificclimate/climate-explorer-frontend)

Front end interface for the PCIC Climate Explorer. Node, React.js, Webpack, Babel, ES6+.

## Requirements

Node.js = 22.x.x (**important**)

All other package requirements are specified in `package.json`. And their specific versions in the package-lock.json.

We **strongly** recommend using [`nvm`](https://github.com/creationix/nvm) to manage your `node`/`npm` install.
In particular, you will have trouble finding later versions of Node.js in standard Linux installs;
`nvm` however is up to date with all recent releases.

Devcontainer files are provided in .devcontainer to facilitate these requirements using that development environment.

Note: Avoid `snap` packages. Experience to date suggests it does not result in stable, reliable installations.

## Configuration

### Configuration variables

Configuration values are managed via a `config.js` file loaded into the app at runtime. Defaults (used for local
development) can be found in [public/config.js](./public/config.js). Adjust these as needed for your local environment
but the defaults _should_ work.

Configuration variables for configuring the app are:

`PUBLIC_URL`

- Base **URL** for CE frontend app.
- For production, set this to the URL for CE configured in our proxy server.
- **WARNING**: The path component of this value **MUST** match `REACT_APP_CE_BASE_PATH` (see below).

`REACT_APP_APP_VERSION`

- Current version of the app.
- This value should be set using `generate-commitish.sh` when the Docker image is built (see below).
- It is not recommended to manually override the automatically generated value when the image is run.
- No default value for this variable is provided in any `.env` file.

`REACT_APP_CE_BACKEND_URL`

- Publicly accessible URL for backend climate data.

`REACT_APP_TILECACHE_URL`

- Tilecache URL for basemap layers.

`REACT_APP_NCWMS_URL`

- ncWMS URL for climate layers.

`REACT_APP_CE_ENSEMBLE_NAME`

- Ensemble name to use for backend requests.

`REACT_APP_MAP_LAYER_ID_TYPE`

- Type of identifier used by the app in requests for map climate layers.
  - Value `dynamic` selects the dynamic dataset identifier type.
    A dynamic dataset identifier is formed by prefixing the value of
    `REACT_APP_MAP_LAYER_ID_PREFIX` to the filepath of the dataset
    (obtained from the metadata).
  - Any other values selects static (preconfigured) dataset identifier type.
    A simple dataset identifier is the unqiue_id of the dataset
    (obtained from the metadata).

`REACT_APP_MAP_LAYER_ID_PREFIX`

- Prefix used to form a dynamic dataset identifier, if requested.
  (See item above.)

`REACT_APP_VARIABLE_OPTIONS`

- Path within the `public` folder of the variable options file.

`REACT_APP_EXTERNAL_TEXT`

- Path within the `public` folder of the external text file.

### Environment Variables:

Build configuration can still be managed via Environment variables however once built these will be unchangable
at runtime. Currently the following are defined:

`PUBLIC_URL`: Defined as the local url when in development mode. Set to `%REPLACE_PUBLIC_URL%` during production
builds to allow for environmental configuration. See [entrypoint.sh](./docker/entrypoint.sh) for this mechanism.

`APP_VERSION`: set via the `generate-commitish.sh` script, used to bake the current version into the javascript files.

`NODE_ENV` [(unchangable)](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables): Set automatically to `production` when running `npm run build`, `development` otherwise. Allows for some
optimisation when executing production builds.

### Variable options

A certain amount of configuration of the app is accomplished through the variable options file,
which is a YAML file stored at a location specified by the environment variable `REACT_APP_VARIABLE_OPTIONS`.
The source for the default version of this file is at `./public/variable-options.yaml`.

For documentation on the contents of this file, see the comments at the head
of the file.

See Production section below for information on "live updating" this file.

## Development

This project is now based on [Create React App](https://github.com/facebook/create-react-app).
Originally it was a manually managed Webpack/Babel project,
but, for a variety of reasons you can read about in [issue 297](https://github.com/pacificclimate/climate-explorer-frontend/issues/297),
we "rebased" it on CRA.

### Installation

This app has been tested against node 22, with its accompanying npm 10.9. These can be set up manually (we reccomend
the use of nvm or the `.devcontainer` specification can set up a container based development environment for you, including
executing an initial npm install for you.

With the appropriate versions of `node`/`npm` in use:

```bash
npm install
```

If you need to start fresh after much messing about, the `reinstall` script
deletes `./node_modules/` and then installs:

```bash
npm run reinstall
```

### Running (dev environment)

```bash
npm start
```

For building a production app, see below.

### Testing

```bash
npm test
```

### Linting / code style

Linting is handled by [Prettier](https://prettier.io/). Prettier can be run directly from the command
line or using the two aliased commands from the [package.json](package.json); `npm run lint` and `npm run format`.
`lint` will check code for errors, format will automatically fix those errors.

Prettier is also installed as a pre-commit hook as per instructions [here](https://prettier.io/docs/en/precommit.html)
using "Option 1. lint-staged".

## Production

### Notes

#### Github Actions

The workflows setup in actions will automatically build, tag and publish to our [docker hub](https://hub.docker.com/r/pcic/climate-explorer-frontend).

#### Configuration, environment variables, and Docker

Run-time configuration options are managed via a `config.js` file loaded into `index.html` when the app is loaded.
Defaults for these configuration options are kept in [public/config.js](./public/config.js), it should have
sensible defaults that allow local development. After deployment, this file can be replaced to adjust configuration
options to match the deployed environment. Within the container it is stored at `/app/config.js`.

We no longer use environment variables for runtime configuration in order to avoid the build time associated with it.
They can be used to configure specific builds.

#### Routing and base path

A key requirement is to be able to configure at run time the the URL at which the app is deployed.

Because we are using React Router v4 (react-router-dom), and therefore the HTML5 `pushState` history API via
its [dependency](https://reacttraining.com/react-router/web/api/history)
[`history`](https://github.com/ReactTraining/history),
we [cannot use](https://facebook.github.io/create-react-app/docs/deployment#serving-the-same-build-from-different-paths) t
he relatively simple `package.json` `homepage` property.

Instead we must use CRA-provided build-time environment variable `PUBLIC_URL`.

- It is [discussed briefly](https://facebook.github.io/create-react-app/docs/using-the-public-folder)
  as the URL for the `public` folder, of which we make use for dynamic configuration assets such as
  external text and variable configuration files.

- `PUBLIC_URL` is also discussed more interestingly in
  [Advanced Configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration):

      > Create React App assumes your application is hosted at the serving web server's root or a subpath as

  specified in package.json (homepage). Normally, Create React App ignores the
  hostname. You may use this variable to force assets to be referenced verbatim
  to the url you provide (hostname included). This may be particularly useful
  when using a CDN to host your application.

### Setup using Docker

We use Docker for production deployment.

It can also be useful in development; for example, to test a proposed volume mounting for the container.

#### Build docker image manually

A Makefile has been included for helping execute the creation of a docker image. This can be executed
via the command `make image`. It will build the javascript code into `build/` and create a docker image.

#### Run docker image

The generated docker image can be tested via the `make up` command. This will start the container based
on the specification defined in the [docker/docker-compose.yaml](./docker/docker-compose.yaml) file.
Configuration options for its execution can be found in its accompanying [config.js](./docker/config.js),
these can be adjusted to suit your preferred configuration (such as adjusting the API source).

## Updating configuration files

Certain parts of Climate Explorer are configured in external configuration files.
These configuration files are stored in [the `public` folder](https://facebook.github.io/create-react-app/docs/using-the-public-folder).
The path to each configuration file inside this folder specified by a value in the `config.js`.
Specifically:

| Configuration    | Env variable                 | Default value              |
| ---------------- | ---------------------------- | -------------------------- |
| External texts   | `REACT_APP_EXTERNAL_TEXT`    | external-text/default.yaml |
| Variable options | `REACT_APP_VARIABLE_OPTIONS` | variable-options.yaml      |

During a build (`npm run build`),
files in the `public` folder are copied directly, without bundling, to the build directory (normally, `./build`).
Files in the `build` folder can be updated on the fly, so that changes to them can be made without creating
a new release of Climate Explorer.

When running the app in a production environment, we mount an external configuration file as a volume
in the docker container. (See section above.)
This external file can be modified, and the container restarted, to provide an updated version of the
variable options file without needing to modify source code, create a new release, or rebuild the image.

To prevent tears, hair loss, and the cursing of your name by future developers (including yourself),
we **strongly recommend also updating** the source configuration files in the repo (in the `public` folder)
with any changes made, so that they are in fact propagated to later versions. "Hot updates" should not be stored
outside of the version control system.

## Releasing

Creating a versioned release involves:

1. Increment `version` in `package.json`
2. Summarize the changes from the last version in `NEWS.md`
3. Commit these changes, then tag the release:

```bash
git add package.json NEWS.md
git commit -m"Bump to version x.x.x"
git tag -a -m"x.x.x" x.x.x
git push --follow-tags
```
