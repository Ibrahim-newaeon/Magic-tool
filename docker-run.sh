#!/bin/bash
# Docker Run Script for New Aeon Magic Apps
# Usage: ./docker-run.sh [command]
# Commands: start, stop, rebuild, logs, shell

set -e

APP_NAME="new-aeon-magic"
IMAGE_NAME="magic-tool"
PORT=8080

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════╗"
    echo "║     New Aeon Magic Apps - Docker       ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Load environment variables from .env.local if exists
load_env() {
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | xargs)
        print_status "Loaded environment from .env.local"
    elif [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
        print_status "Loaded environment from .env"
    else
        print_warning "No .env.local or .env file found"
        print_warning "Create .env.local with: VITE_GEMINI_API_KEY=your_api_key"
    fi
}

# Start the container
start() {
    print_header
    check_docker
    load_env

    echo -e "${BLUE}Starting Magic Tool...${NC}"

    if docker ps -a --format '{{.Names}}' | grep -q "^${APP_NAME}$"; then
        # Container exists, start it
        docker start ${APP_NAME}
        print_status "Container started"
    else
        # Build and run new container
        print_status "Building Docker image..."
        docker build -t ${IMAGE_NAME} .

        print_status "Creating and starting container..."
        docker run -d \
            --name ${APP_NAME} \
            -p ${PORT}:${PORT} \
            -e VITE_GEMINI_API_KEY="${VITE_GEMINI_API_KEY}" \
            -v "$(pwd):/app" \
            -v "/app/node_modules" \
            ${IMAGE_NAME}
    fi

    echo ""
    print_status "Magic Tool is running!"
    echo -e "${GREEN}→ Open http://localhost:${PORT} in your browser${NC}"
    echo ""
}

# Stop the container
stop() {
    print_header
    echo -e "${BLUE}Stopping Magic Tool...${NC}"

    if docker ps --format '{{.Names}}' | grep -q "^${APP_NAME}$"; then
        docker stop ${APP_NAME}
        print_status "Container stopped"
    else
        print_warning "Container is not running"
    fi
}

# Rebuild the container
rebuild() {
    print_header
    check_docker
    load_env

    echo -e "${BLUE}Rebuilding Magic Tool...${NC}"

    # Stop and remove existing container
    if docker ps -a --format '{{.Names}}' | grep -q "^${APP_NAME}$"; then
        print_status "Removing existing container..."
        docker rm -f ${APP_NAME}
    fi

    # Remove existing image
    if docker images --format '{{.Repository}}' | grep -q "^${IMAGE_NAME}$"; then
        print_status "Removing existing image..."
        docker rmi ${IMAGE_NAME}
    fi

    # Build and start
    start
}

# Show logs
logs() {
    print_header
    echo -e "${BLUE}Showing logs (Ctrl+C to exit)...${NC}"
    echo ""
    docker logs -f ${APP_NAME}
}

# Open shell in container
shell() {
    print_header
    echo -e "${BLUE}Opening shell in container...${NC}"
    docker exec -it ${APP_NAME} /bin/sh
}

# Show status
status() {
    print_header
    if docker ps --format '{{.Names}}' | grep -q "^${APP_NAME}$"; then
        print_status "Magic Tool is RUNNING"
        echo ""
        docker ps --filter "name=${APP_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        print_warning "Magic Tool is NOT running"
    fi
}

# Show help
show_help() {
    print_header
    echo "Usage: ./docker-run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start the application (default)"
    echo "  stop      Stop the application"
    echo "  rebuild   Rebuild and restart the container"
    echo "  logs      Show container logs"
    echo "  shell     Open a shell in the container"
    echo "  status    Show container status"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-run.sh              # Start the app"
    echo "  ./docker-run.sh rebuild      # Rebuild from scratch"
    echo "  ./docker-run.sh logs         # View logs"
    echo ""
}

# Main
case "${1:-start}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    rebuild)
        rebuild
        ;;
    logs)
        logs
        ;;
    shell)
        shell
        ;;
    status)
        status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
