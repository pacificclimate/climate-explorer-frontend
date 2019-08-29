# We build the app as part of the container startup so that the build process
# can consume the runtime environment variables. (CRA apps can only access
# environment variables at build time, not at run time.) This makes starting a
# container a lot heavier, but we don't spin up many instances, or often,
# so it doesn't matter.

# This is a problem because it requres git to be installed in the image
# Better to feed it in earlier in the build process; i.e., during image build
#export REACT_APP_CE_CURRENT_VERSION=$(./generate-commitish.sh)
echo REACT_APP_CE_CURRENT_VERSION "$REACT_APP_CE_CURRENT_VERSION"
echo PUBLIC_URL "$PUBLIC_URL"
echo REACT_APP_CE_BASE_PATH "$REACT_APP_CE_BASE_PATH"
npm run build
serve -s build -l 8080