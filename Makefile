#
# To build for another architecture run:
# make ARCH=arm64 [ <target> ]
#
VERSION := $(shell git describe --tags --always --dirty)
ARCH := $(shell docker info --format '{{.Architecture}}')
TAG := ${ARCH}.${VERSION}

dockertar: dockerimage
	docker save --output a-tes-souhaits.${TAG}.tar "a-tes-souhaits:${TAG}"

dockerimage:
	docker build --platform linux/${ARCH} -t "a-tes-souhaits:${TAG}" .

# Note won't works for another ARCH
dockerrun:
	docker run -p 3000:3000 "a-tes-souhaits:${TAG}"

