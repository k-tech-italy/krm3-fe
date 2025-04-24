#!make

.PHONY: build

DOCKER_COMPOSE?="docker-compose"
DOCKER_IMAGE?=krm3-fe
DOCKER_REGISTRY?=docker.k-tech.it
VERSION=$(shell npm pkg get version | xargs)
DOCKER_IMAGE_FULLNAME=${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${VERSION}
BUILD_OPTIONS?=--squash
PLATFORM?=linux/amd64
KRM3_HTTP_PORT?=8888
KRM3_FE_PORT?=3000

help:
	@echo "build: build docker image"
	@echo "release: release to configured docker registry (${DOCKER_REGISTRY})"

build:
	cd .. && docker build \
			${BUILD_OPTIONS} \
			--platform ${PLATFORM} \
			-t ${DOCKER_IMAGE_FULLNAME} \
			-f docker/Dockerfile \
			.

run:
	@echo "Running ${DOCKER_IMAGE_FULLNAME}"
	docker run --rm \
	--platform  ${PLATFORM} \
	-d \
	-p 3000:3000 \
	-e KRM3_FE_API_BASE_URL=http://192.168.1.210:8000/api/v1/ \
	${DOCKER_IMAGE_FULLNAME}
	


registrylogin:  ## Log in to docker
	@echo "${DOCKER_PWD}" | docker login ${DOCKER_REGISTRY} -u ${DOCKER_USR} --password-stdin

save:
	@mkdir -p ../dist
	@echo "Saving image ../dist/image-${CONTAINER_NAME}-${VERSION}.tgz"
	@docker save ${DOCKER_IMAGE_FULLNAME} | gzip > ../dist/image-${CONTAINER_NAME}-${VERSION}.tgz

release:  registrylogin
	@docker push ${DOCKER_IMAGE_FULLNAME}

stack:
	KRM3_HTTP_PORT=${KRM3_HTTP_PORT} KRM3_FE_PORT=${KRM3_FE_PORT} DOCKER_IMAGE_FULLNAME=${DOCKER_IMAGE_FULLNAME} ${DOCKER_COMPOSE} up
