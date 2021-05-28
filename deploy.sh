#!/usr/bin/env bash

# Deploy the backend to a docker container
# First copy the shared files, as this is not done, during the build process when running in docker
cp -a ./shared/src/. ./backend/src/shared/

# Now build the container as spec'ed by the backend dockerfile
docker build -t kmap.backend ./backend