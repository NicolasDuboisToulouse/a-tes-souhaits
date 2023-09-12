#
# To configure you build run something like:
# make ARCH=arm64 APP_GID=1001 APP_UID=1005 PORT=2080 [ <target> ]
#
VERSION := $(shell git describe --tags --always --dirty)
ARCH := $(shell docker info --format '{{.Architecture}}' 2>/dev/null)
TAG := ${ARCH}.${VERSION}
NAME=a-tes-souhaits
docker_datbase_dir=${PWD}/database/data_docker
APP_GID=1001
APP_UID=1001
PORT=3000
LOCAL_PORT=${PORT}

dockertar: dockerimage
	docker save --output ${NAME}.${TAG}.tar "${NAME}:${TAG}"

dockerimage: .env.production
	docker build --platform linux/${ARCH} -t "${NAME}:${TAG}" --build-arg APP_GID=${APP_GID} --build-arg APP_UID=${APP_UID} --build-arg PORT=${PORT} .

# Note: re-generating this file will invalidate all sessions
.env.production:
	rm -f $@
	echo -n JWT_SECRET=                                                    >> $@
	cat /dev/urandom | tr -dc '[:alnum:]' | fold -w $${1:-30} | head -n 1  >> $@

# Docker targets (for debug purpose)
dockerrun: dockerclean dockerimage
	docker run --mount type=bind,src=${docker_datbase_dir},target=//a-tes-souhaits/database/data --name ${NAME} -p ${LOCAL_PORT}:${PORT} "${NAME}:${TAG}"

dockerclean:
	if docker container ls -a --filter "Name=${NAME}" | grep ${NAME} >/dev/null; then docker container rm --force ${NAME}; fi
	if docker image ls -a ${NAME} | grep ${NAME} >/dev/null; then docker image rm --force $$(docker images -q ${NAME}); fi

dockercacheclean: dockerclean
	docker builder prune

# Generation/run target (for debug purpose)
updatedb:
	npx ts-node database/update_database.ts

dev: updatedb
	npm run dev | npx pino-pretty

next: updatedb
	npm run build
	rm -rf .next/standalone/.next/static
	cp -r .next/static .next/standalone/.next
	rm -rf .next/standalone/public
	cp -r public .next/standalone/public
	rm -rf .next/standalone/database/data
	mkdir -p .next/standalone/database
	cp -r database/data .next/standalone/database/data

run: next
	HOSTNAME=localhost node .next/standalone/server.js | npx pino-pretty


clean: dockerclean
	rm -f  ${NAME}.*.tar
	rm -fr .next
	rm -f  .env.production
	rm -rf database/data
	rm -rf ${docker_datbase_dir}
