# PCIC Climate Explorer

[![Build Status](https://travis-ci.org/pacificclimate/climate-explorer-frontend.svg?branch=master)](https://travis-ci.org/pacificclimate/climate-explorer-frontend)
[![Code Climate](https://codeclimate.com/github/pacificclimate/climate-explorer-frontend/badges/gpa.svg)](https://codeclimate.com/github/pacificclimate/climate-explorer-frontend)

Front end interface for the PCIC Climate Explorer. Node, React.js, Webpack, Babel, ES6+.

## Requirements

Node.js >= 9.2.0 (**important**)

All other package requirements are specified in `package.json`.

We **strongly** recommend using [`nvm`](https://github.com/creationix/nvm) to manage your `node`/`npm` install.
In particular, you will have trouble finding later versions of Node.js in standard Linux installs;
`nvm` however is up to date with all recent releases.

Note: Avoid `snap` packages. Experience to date suggests it does not result in stable, reliable installations.

## Configuration

### Environment variables

Main configuration of the Climate Explorer frontend is done via environment variables.

In a Create React App app, [environment variables are managed carefully](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).
Therefore, most of the environment variables below begin with `REACT_APP_`, as required by CRA.

CRA also provides a convenient system for setting default values of environment variables
in various contexts (development, production, etc.). 

Brief summary:
 
* `.env`: Global default settings
* `.env.development`: Development-specific settings (`npm start`)
* `.env.production`: Production-specific settings (`npm run build`)

For more details, see the 
[CRA documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables)).

Environment variables for configuring the app are:


`NODE_ENV`
* [automatically set; cannot be overridden manually](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables)

`REACT_APP_CE_CURRENT_VERSION`
* Current version of the app.
* Usually set externally (not via `.env` file) as: `REACT_APP_CE_CURRENT_VERSION=$(./generate-commitish.sh)`
* Unfortunately, cannot be set to a dynamic value via `.env` file.

`REACT_APP_CE_BACKEND_URL`
* Publicly accessible URL for backend climate data

`REACT_APP_TILECACHE_URL`
* Tilecache URL for basemap layers

`REACT_APP_NCWMS_URL`
* ncWMS URL for climate layers

`REACT_APP_CE_ENSEMBLE_NAME`
* ensemble name to use for backend requests

`REACT_APP_CE_BASE_PATH`
* Base **path** of the URL for the CE frontend app; 
    set this to the path component of the URL for CE configured in 
    our proxy server

`REACT_APP_VARIABLE_OPTIONS`
* Path within the `public` folder of the variable options file.

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

You **must** use a version of `npm` >= 5.5.1. This version of `npm` comes with `node` 9.2.0.
If you are using nvm, then run `nvm use 9.2.0` (or higher; ver 11.13 works fine too).

(`npm` 5.5.1 / `node` 9.2.0 is known to work; `npm` 3.5.2 / `node` 8.10.0 is known to fail to install certain required dependencies. 
Intermediate versions may or may not work.)

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

### Linting

Linting is configured with ESLint and largely follows the AirBnb preset.

You can lint all files `npm run lint`, or a specific file `npm run lint:glob <file_name_or_glob>`.

Use the `git/hooks/pre-commit-eslint` (and install into your .git/hooks directory) to abort a commit if any staged `*.js` files fail linting (warnings OK).

If you *really* want to skip the linting during a commit, you can always run `git commit --no-verify`. However, this is not recommended.


## Production

### Notes

According to [CRA documentation](https://facebook.github.io/create-react-app/docs/deployment#serving-the-same-build-from-different-paths), 
if we want to serve the same build from different paths, we should set `"homepage": "."` in `package.json`.
But this comes with the caveat "if you are not using the HTML5 pushState history API or not using client-side 
routing at all". We are using React Router v4 (react-router-dom). It seems we _are_ using the pushState API, based on the
not entirely clear but suggestive documentation for the [`history`](https://github.com/ReactTraining/history) package,
[which is a dependency of React Router](https://reacttraining.com/react-router/web/api/history).

So basically, we can't set `package.json` `homepage` to `"."`. And we don't want to set it
to a fixed relative path because we want to be able to change the path at which CE is deployed without
rebuilding the app. 

What we have done instead is to set the `<Router>` `basename` prop to the value of the environment
variable `REACT_APP_CE_BASE_PATH`, followed by `/#`.

CRA introduces the environment variable `PUBLIC_URL`. 
It is [discussed briefly](https://facebook.github.io/create-react-app/docs/using-the-public-folder) 
as the URL for the `public` folder, of which we make use for dynamic configuration assets such as
external text and variable configuration files.

`PUBLIC_URL` is also discussed more interestingly in [Advanced Configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration):

> Create React App assumes your application is hosted at the serving web server's root or a subpath as 
specified in package.json (homepage). Normally, Create React App ignores the 
hostname. You may use this variable to force assets to be referenced verbatim 
to the url you provide (hostname included). This may be particularly useful 
when using a CDN to host your application.

In many ways `PUBLIC_URL` does the same thing as our custom env variable `REACT_APP_CE_BASE_PATH`.
It will be worth reviewing whether `REACT_APP_CE_BASE_PATH` can be eliminated in favour
of `PUBLIC_URL`. For now we will use both.


CRA provides an environment variable 

### Setup using Docker

We use Docker for production deployment.
 
It can also be useful in development; for example, to test a proposed volume mounting for the container.

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

As described above, environment variables configure the app.
All are given standard development and production values in the files
`.env`, `.env.development`, and `.env.production`.

The only environment variable that must be set outside of the `.env` files is:

* `REACT_APP_CE_CURRENT_VERSION=$(./generate-commitish.sh)` 
  * (If no value is set for this variable, the app still works, but the version
    cannot be displayed in the Help.)

In addition, we mount the configuration files as volumes in the container.
This enables us to update these files without rebuilding or redeploying the app. 
See the section below for details.

Typical production run:

```bash
docker run --restart=unless-stopped -d 
  -e REACT_APP_CE_CURRENT_VERSION=$(./generate-commitish.sh)
  -p <external port>:8080 
  --name climate-explorer-frontend
  - v /path/to/external/variable-options.yaml:/app/build/variable-options.yaml
  - v /path/to/external/external-texts/default.yaml:/app/build/external-texts/default.yaml
  climate-explorer-frontend:<tag>
```

## Updating configuration files

Certain parts of Climate Explorer are configured in external configuration files.
These configuration files are stored in [the `public` folder](https://facebook.github.io/create-react-app/docs/using-the-public-folder).
The path to each configuration file inside this folder specified by an environment variable.
Specifically:

| Configuration     | Env variable                  | Default value                 |
| ----------------- | ----------------------------- | ------------------------------|
| External texts    | `REACT_APP_EXTERNAL_TEXT`     |  external-text/default.yaml   |
| Variable options  | `REACT_APP_VARIABLE_OPTIONS`  | variable-options.yaml         |

During a build (`npm run build`), 
files in the `public` folder are copied directly, without bundling, to the build directory (normally, `./build`).
Files in the `build` folder can be updated on the fly, so that changes to them can be made without creating
a new release of Climate Explorer.

When running the app in a production environment, we mount an external configuration file as a volume 
in the docker container. (See section above.) 
This external file can be modified, and the container restarted, to provide an updated version of the
variable options file without needing to modify source code, create a new release, or rebuild the image.

To change the configuration file without creating a new release of the app:

* Update the configuration file in the external file system.
* Restart the container (`docker restart climate-explorer-frontend`)

Alternatives:

* Stop the app and start it again with a different value for the associated environment variable,
  and a corresponding volume mount for this new file. 


To prevent tears, hair loss, and the cursing of your name by future developers (or even yourself), 
we **strongly recommend also updating** the source configuration files in the repo (in the `public` folder)
with any changes made, so that they are in fact propagated to later versions. "Hot updates" should not be stored
outside of the version control system.

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