#! /bin/env sh
swag init --parseDependency --parseInternal -g cmd/server/main.go
swag f
