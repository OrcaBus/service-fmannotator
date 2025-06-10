## Default target
default: help

install: build
all: build

## Build related commands
build:
	@go build -o build
test:
	@go test
lint:
	@go fmt
golangci-lint:
	@golangci-lint run
check: lint golangci-lint
fix: lint
	@golangci-lint run --fix

## Clean
clean:
	@go mod tidy

## Help text
help:
	@printf "The fmannotator Makefile.\n\n"
	@printf "Usage: make <target>\n"

# No targets are files, so they are all PHONY.
.PHONY: *
