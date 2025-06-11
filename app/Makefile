## Default target
default: help

install:
	@go mod tidy
all: install

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
	@rm -rf build

## Help text
help:
	@printf "The fmannotator Makefile.\n\n"
	@printf "Usage: make <target>\n"

# No targets are files, so they are all PHONY.
.PHONY: *
