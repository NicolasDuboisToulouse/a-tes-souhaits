#
# To configure you build run something like:
# make ARCH=arm64 APP_GID=1001 APP_UID=1005 PORT=2080 [ <target> ]
#
VERSION := $(shell git describe --tags --always --dirty)
ARCH := $(shell docker info --format '{{.Architecture}}' 2>/dev/null)
TAG := ${ARCH}.${VERSION}
NAME=a-tes-souhaits
docker_database_dir=${PWD}/database
APP_GID=1001
APP_UID=1001
PORT=3000
LOCAL_PORT=${PORT}

dockertar: dockerimage
	docker save --output ${NAME}.${TAG}.tar "${NAME}:${TAG}"

dockerimage: .env.production
	docker build --platform linux/${ARCH} -t "${NAME}:${TAG}" --build-arg APP_GID=${APP_GID} --build-arg APP_UID=${APP_UID} --build-arg PORT=${PORT} .

# Note: re-generating this file will invalidate all sessions
.jwt.production.secret:
	rm -f $@
	echo -n JWT_SECRET=                                                    >> $@
	cat /dev/urandom | tr -dc '[:alnum:]' | fold -w $${1:-30} | head -n 1  >> $@

.env.production: .jwt.production.secret
	rm -f $@
	cp -f $< $@
	echo NEXT_TELEMETRY_DISABLED=1      >> $@
	echo NEXT_PUBLIC_VERSION=${VERSION} >> $@
.PHONY: .env.production

# Docker targets (for debug purpose)
dockerrun: dockerclean dockerimage
	docker run --mount type=bind,src=${docker_database_dir},target=//a-tes-souhaits/database --name ${NAME} -p ${LOCAL_PORT}:${PORT} "${NAME}:${TAG}"

dockerclean:
	if docker container ls -a --filter "Name=${NAME}" | grep ${NAME} >/dev/null; then docker container rm --force ${NAME}; fi
	if docker image ls -a ${NAME} | grep ${NAME} >/dev/null; then docker image rm --force $$(docker images -q ${NAME}); fi

dockercacheclean: dockerclean
	docker builder prune

# Generation/run target (for debug purpose)
.env.development:
	rm -f $@
	echo NEXT_TELEMETRY_DISABLED=1       >> $@
	echo JWT_SECRET=This is not a secret >> $@
	echo LOG_LEVEL=trace                 >> $@
	echo NEXT_PUBLIC_VERSION=${VERSION}  >> $@
.PHONY: .env.development

dev: .env.development
	mkdir -p database
	npx next dev | npx pino-pretty

next: .env.production
	npx next build
	rm -rf .next/standalone/.next/static
	cp -r .next/static .next/standalone/.next
	rm -rf .next/standalone/public
	cp -r public .next/standalone/public
	if [ -d database ]; then cp -r database .next/standalone; else mkdir .next/standalone/database; fi

prod: next
	HOSTNAME=localhost node .next/standalone/server.js | npx pino-pretty


clean: dockerclean
	rm -f  ${NAME}.*.tar
	rm -fr .next
	rm -f  .env.production
	rm -rf database
	rm -rf ${docker_database_dir}
