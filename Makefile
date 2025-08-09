.PHONY: all check_composer install_composer check_env update_env serve install_client_deps check_client_deps serve_client

all: check_composer install_composer_packages check_env update_env serve install_client_deps check_client_deps serve_client

# Check if composer is installed
check_composer:
	@command -v composer >/dev/null 2>&1 || { echo "Composer is not installed."; exit 1; }

# Run composer install
install_composer_packages:
	cd ./server && composer install

# Check if .env exists
check_env:
	@if [ ! -f ./server/.env ]; then \
		cp ./server/.env.example ./server/.env; \
	fi

# Update .env with current path
update_env:
	@path=$$(pwd) && sed -i '' "s|DB_DATABASE=.*|DB_DATABASE=$$path\/server\/database\/database.sqlite|" ./server/.env

# Run php artisan serve
serve:
	cd ./server && php artisan serve --port 3000 &

# Check if npm is installed
check_npm:
	@command -v npm >/dev/null 2>&1 || { echo "npm is not installed."; exit 1; }

# Check if client dependencies are installed
check_client_deps:
	@if [ ! -d ./client/node_modules ]; then \
		echo "Client dependencies not installed."; \
		exit 1; \
	fi

# Install client dependencies
install_client_deps: check_npm
	cd ./client && npm install

# Serve client (npm run dev)
serve_client: check_client_deps
	cd ./client && npm run dev