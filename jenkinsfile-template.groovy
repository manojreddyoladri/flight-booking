// Jenkinsfile Template for Other Projects
// Copy this to your new project and customize as needed

pipeline {
    agent any
    
    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }
    
    environment {
        MAVEN_OPTS = '-Xmx1g -XX:+UseG1GC -XX:+DisableExplicitGC -XX:+ExitOnOutOfMemoryError'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Building commit: ${env.GIT_COMMIT}"
                echo "Branch: ${env.GIT_BRANCH}"
            }
        }
        
        stage('Build & Test') {
            options { timeout(time: 10, unit: 'MINUTES') }
            steps {
                sh """
                echo "=== Starting Build & Test ==="
                
                # Add your project-specific build commands here
                # Examples:
                
                # For Node.js projects:
                # npm ci
                # npm run build
                # npm test
                
                # For Python projects:
                # pip install -r requirements.txt
                # python -m pytest
                
                # For Java/Maven projects:
                # ./mvnw clean compile test
                
                # For Go projects:
                # go mod download
                # go test ./...
                
                echo "✅ Build completed!"
                """
            }
        }
        
        stage('Deploy') {
            options { timeout(time: 5, unit: 'MINUTES') }
            steps {
                sh """
                echo "=== Deploying ==="
                # Add your deployment commands here
                echo "✅ Deployment completed!"
                """
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo "🎉 Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
} 