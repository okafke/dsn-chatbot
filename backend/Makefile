.PHONY: install dev lint format typecheck test lock run

## Install production dependencies
install:
	pip install -r requirements.txt

## Install in editable mode with dev dependencies
dev:
	pip install -e ".[dev]"

## Regenerate pinned requirements.txt from pyproject.toml
lock:
	pip-compile --strip-extras --output-file=requirements.txt pyproject.toml

## Upgrade all dependencies to latest allowed versions and re-pin
upgrade:
	pip-compile --upgrade --strip-extras --output-file=requirements.txt pyproject.toml

## Run linter
lint:
	ruff check app/ tests/

## Auto-format code
format:
	ruff format app/ tests/
	ruff check --fix app/ tests/

## Run type checker
typecheck:
	mypy app/

## Run tests
test:
	pytest

## Run tests with coverage
coverage:
	coverage run -m pytest
	coverage report
	coverage html

## Start dev server
run:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
