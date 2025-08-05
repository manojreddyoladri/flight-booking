pipeline {
    agent any
    
    environment {
        JAVA_VERSION = '17'
        NODE_VERSION = '18'
        // Railway tokens will be added when available
        // RAILWAY_TOKEN = credentials('railway-token')
        // DOCKER_USERNAME = credentials('docker-username')
        // DOCKER_PASSWORD = credentials('docker-password')
    }
    
    options {
        // Prevent multiple builds of the same commit
        skipDefaultCheckout(false)
        // Timeout to prevent runaway builds
        timeout(time: 1, unit: 'HOURS')
        // Build only on main branch
        disableConcurrentBuilds()
    }
    
    triggers {
        // Poll SCM every 5 minutes for main branch changes
        pollSCM('*/5 * * * *')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Building commit: ${env.GIT_COMMIT}"
                echo "Branch: ${env.GIT_BRANCH}"
            }
        }
        
        stage('Backend Build & Test') {
            steps {
                dir('backend') {
                    // Clean and install dependencies
                    sh './mvnw clean install -DskipTests'
                    
                    // Run unit tests
                    sh './mvnw test'
                    
                    // Run integration tests
                    sh './mvnw verify -Dspring.profiles.active=test'
                }
            }
            post {
                always {
                    dir('backend') {
                        // Publish test results
                        publishTestResults testResultsPattern: '**/surefire-reports/*.xml'
                        
                        // Archive test reports
                        archiveArtifacts artifacts: 'target/surefire-reports/**/*', allowEmptyArchive: true
                    }
                }
            }
        }
        
        stage('Frontend Build & Test') {
            steps {
                dir('frontend1') {
                    // Install dependencies
                    sh 'npm ci --cache ~/.npm --prefer-offline'
                    
                    // Run unit tests
                    sh 'npm test -- --watch=false --browsers=ChromeHeadless'
                    
                    // Build production bundle
                    sh 'npm run build'
                }
            }
            post {
                always {
                    dir('frontend1') {
                        // Archive build artifacts
                        archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
                        
                        // Publish test results
                        publishTestResults testResultsPattern: '**/test-results/*.xml'
                    }
                }
            }
        }
        
        stage('E2E Smoke Tests') {
            steps {
                dir('frontend1') {
                    // Install Playwright browsers
                    sh 'npx playwright install --with-deps'
                    
                    // Build frontend for testing
                    sh 'npm run build'
                    
                    // Start frontend server
                    sh 'npx serve -l 4200 dist/frontend1/browser &'
                    sh 'sleep 10'
                    
                    // Wait for server to be ready
                    sh 'npx wait-on http://localhost:4200 || echo "Server not ready, continuing..."'
                    
                    // Run only smoke tests (critical path)
                    sh 'npx playwright test e2e/tests/smoke.spec.ts --reporter=list --timeout=30000 --workers=4'
                }
            }
            post {
                always {
                    dir('frontend1') {
                        // Archive E2E test results
                        archiveArtifacts artifacts: 'playwright-report/**/*,test-results/**/*', allowEmptyArchive: true
                        
                        // Publish HTML report
                        publishHTML([
                            allowMissing: true,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'playwright-report',
                            reportFiles: 'index.html',
                            reportName: 'E2E Test Report'
                        ])
                    }
                }
            }
        }
        
        stage('Deploy Backend (Railway)') {
            when {
                branch 'main'
                // Uncomment when Railway token is available
                // expression { env.RAILWAY_TOKEN != null }
            }
            steps {
                script {
                    // Commented out until Railway token is available
                    echo "Railway deployment skipped - token not configured"
                    /*
                    sh '''
                        if [ -n "$RAILWAY_TOKEN" ]; then
                            echo "Deploying backend to Railway..."
                            curl -X POST \
                                -H "Authorization: Bearer $RAILWAY_TOKEN" \
                                -H "Content-Type: application/json" \
                                https://api.railway.app/v2/service/flight-booking-backend/deploy
                        else
                            echo "Skipping Railway deployment - no token configured"
                        fi
                    '''
                    */
                }
            }
        }
        
        stage('Deploy Frontend (Railway)') {
            when {
                branch 'main'
                // Uncomment when Railway token is available
                // expression { env.RAILWAY_TOKEN != null }
            }
            steps {
                dir('frontend1') {
                    script {
                        // Commented out until Railway token is available
                        echo "Railway deployment skipped - token not configured"
                        /*
                        sh '''
                            if [ -n "$RAILWAY_TOKEN" ]; then
                                echo "Deploying frontend to Railway..."
                                curl -X POST \
                                    -H "Authorization: Bearer $RAILWAY_TOKEN" \
                                    -H "Content-Type: application/json" \
                                    https://api.railway.app/v2/service/flight-booking-frontend/deploy
                            else
                                echo "Skipping Railway deployment - no token configured"
                            fi
                        '''
                        */
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            echo "Pipeline completed successfully! 🎉"
        }
        failure {
            echo "Pipeline failed! ❌"
        }
        unstable {
            echo "Pipeline is unstable! ⚠️"
        }
    }
} 