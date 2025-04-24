#!make

.PHONY: build

DOCKER_COMPOSE?="docker-compose"
DOCKER_IMAGE?=krm3-fe
DOCKER_REGISTRY?=docker.k-tech.it
VERSION=$(shell npm pkg get version | xargs)
DOCKER_IMAGE_FULLNAME=${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${VERSION}
BUILD_OPTIONS?=--squash

help:
	@echo "build: build docker image"
	@echo "release: release to configured docker registry (${DOCKER_REGISTRY})"

build:
	cd .. && docker build \
			${BUILD_OPTIONS} \
			--platform linux/amd64 \
			-t ${DOCKER_IMAGE_FULLNAME} \
			-f docker/Dockerfile \
			--target prod .
	docker image ls | grep ${DOCKER_IMAGE_FULLNAME}

registrylogin:  ## Log in to docker
	@echo "${DOCKER_PWD}" | docker login ${DOCKER_REGISTRY} -u ${DOCKER_USR} --password-stdin

save:
	@mkdir -p ../dist
	@echo "Saving image ../dist/image-${CONTAINER_NAME}-${VERSION}.tgz"
	@docker save ${DOCKER_IMAGE_FULLNAME} | gzip > ../dist/image-${CONTAINER_NAME}-${VERSION}.tgz

release:  registrylogin
	@docker push ${DOCKER_IMAGE_FULLNAME}