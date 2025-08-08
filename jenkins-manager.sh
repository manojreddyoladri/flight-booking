#!/bin/bash

# Jenkins Manager Script
# This script helps manage the Jenkins container

set -e

JENKINS_SERVICE="jenkins-server"
COMPOSE_FILE="docker-compose.yml"

echo "=== Jenkins Manager ==="

case "$1" in
    "start")
        echo "Starting Jenkins..."
        docker-compose -f $COMPOSE_FILE up -d $JENKINS_SERVICE
        echo "Jenkins started! Access at http://localhost:8085"
        echo "Initial admin password:"
        docker-compose -f $COMPOSE_FILE logs $JENKINS_SERVICE | grep -A 1 "Jenkins initial admin password" | tail -1
        ;;
    "stop")
        echo "Stopping Jenkins..."
        docker-compose -f $COMPOSE_FILE stop $JENKINS_SERVICE
        echo "Jenkins stopped!"
        ;;
    "restart")
        echo "Restarting Jenkins..."
        docker-compose -f $COMPOSE_FILE restart $JENKINS_SERVICE
        echo "Jenkins restarted! Access at http://localhost:8085"
        ;;
    "logs")
        echo "Showing Jenkins logs..."
        docker-compose -f $COMPOSE_FILE logs -f $JENKINS_SERVICE
        ;;
    "status")
        echo "Checking Jenkins status..."
        if docker-compose -f $COMPOSE_FILE ps $JENKINS_SERVICE | grep -q "Up"; then
            echo "✅ Jenkins is running"
            echo "Access at http://localhost:8085"
        else
            echo "❌ Jenkins is not running"
            echo "Run './jenkins-manager.sh start' to start it"
        fi
        ;;
    "clean")
        echo "Cleaning Jenkins (this will remove all data)..."
        read -p "Are you sure? This will delete all Jenkins data! (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose -f $COMPOSE_FILE down $JENKINS_SERVICE
            docker volume rm flight-booking_jenkins_home
            echo "Jenkins data cleaned!"
        else
            echo "Operation cancelled"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  start   - Start Jenkins container"
        echo "  stop    - Stop Jenkins container"
        echo "  restart - Restart Jenkins container"
        echo "  logs    - Show Jenkins logs"
        echo "  status  - Check Jenkins status"
        echo "  clean   - Remove Jenkins data (WARNING: deletes all data)"
        exit 1
        ;;
esac 