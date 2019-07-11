# We build the app as part of the container startup so that the build process
# can consume the runtime environment variables. (CRA apps can only access
# environment variables at build time, not at run time.) This makes starting a
# container a lot heavier, but we don't spin up many instances, or often,
# so it doesn't matter.

npm run build
serve -s build -l 8080