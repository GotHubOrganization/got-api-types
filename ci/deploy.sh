docker tag $DOCKER_IMAGE_NAME:latest $DOCKER_IMAGE_URL:latest
docker tag $DOCKER_IMAGE_NAME:latest $DOCKER_IMAGE_URL:$GIT_HEAD
docker push $DOCKER_IMAGE_URL:latest
docker push $DOCKER_IMAGE_URL:$GIT_HEAD
eval ${UPDATE_SERVICE}