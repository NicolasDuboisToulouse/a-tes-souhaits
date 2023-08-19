#
# To build for another architecture run:
# make ARCH=arm64 [ <target> ]
#
VERSION := $(shell git describe --tags --always --dirty)
ARCH := $(shell docker info --format '{{.Architecture}}')
TAG := ${ARCH}.${VERSION}
NAME=a-tes-souhaits

dockertar: dockerimage
	docker save --output ${NAME}.${TAG}.tar "${NAME}:${TAG}"

dockerimage: .env.production
	docker build --platform linux/${ARCH} -t "${NAME}:${TAG}" .

# Note: re-generating this file will invalidate all sessions
.env.production: Makefile
	rm -f $@
	echo -n JWT_SECRET=                                                    >> $@
	cat /dev/urandom | tr -dc '[:alnum:]' | fold -w $${1:-30} | head -n 1  >> $@

dockerrun: dockerclean dockerimage
	docker run  --name ${NAME} -p 3000:3000 "${NAME}:${TAG}"

dockerclean:
	if docker container ls -a --filter "Name=${NAME}" | grep ${NAME} >/dev/null; then docker container rm --force ${NAME}; fi
	if docker image ls -a ${NAME} | grep ${NAME} >/dev/null; then docker image rm --force $$(docker images -q ${NAME}); fi

dockercacheclean: dockerclean
	docker builder prune

clean: dockerclean
	rm -f  ${NAME}.*.tar
	rm -fr .next
	rm -f  .env.production
