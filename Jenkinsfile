pipeline {
    agent any

    environment {
        REGISTRY       = 'docker.io/wanderer1217'
        DOCKER_CRED_ID = 'docker-registry-creds'
    }

    options {
        skipDefaultCheckout(false)
        timeout(time: 1, unit: 'HOURS')
        disableConcurrentBuilds()
    }

    triggers {
        pollSCM('* * * * *')
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
            options { timeout(time: 20, unit: 'MINUTES') }
            steps {
                dir('backend') {
                    // Clean and compile first
                    sh """
                    echo "=== Starting Backend Build & Test ==="
                    echo "Cleaning and compiling..."
                    ./mvnw clean compile -B -DskipTests=true
                    """
                    
                    // Run tests with optimized settings
                    sh """
                    echo "Running tests..."
                    ./mvnw test -B -Dspring.profiles.active=test -Dtest="!*SmokeTest,!*ApplicationTests" -DskipITs=true -Dmaven.test.failure.ignore=true -Dmaven.test.timeout=300
                    """                
                }
            }
            post {
                always {
                    dir('backend') {
                        // Publish JUnit results (allow empty so it won't error)
                        junit testResults: 'target/surefire-reports/*.xml',
                              allowEmptyResults: true
                        archiveArtifacts artifacts: 'target/surefire-reports/**/*',
                                         allowEmptyArchive: true
                    }
                }
                success {
                    echo "✅ Backend Build & Test completed successfully!"
                }
                failure {
                    echo "❌ Backend Build & Test failed!"
                }
            }
        }

        stage('Frontend Build & Test') {
            options { timeout(time: 10, unit: 'MINUTES') }
            steps {
                dir('frontend1') {
                    sh 'npm ci --cache ~/.npm --prefer-offline'
                    sh 'npm test -- --watch=false --browsers=ChromeHeadless'
                    sh 'npm run build'
                }
            }
            post {
                always {
                    dir('frontend1') {
                        archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
                        // Adjust to where your test runner writes XML (if any)
                        junit testResults: 'test-results/*.xml',
                              allowEmptyResults: true
                    }
                }
                success {
                    echo "✅ Frontend Build & Test completed successfully!"
                }
                failure {
                    echo "❌ Frontend Build & Test failed!"
                }
            }
        }

        stage('Build & Push Images') {
            options { timeout(time: 10, unit: 'MINUTES') }
            steps {
                script {
                    docker.withRegistry("https://${env.REGISTRY}", env.DOCKER_CRED_ID) {
                        sh """
                          docker build -t ${env.REGISTRY}/backend:latest -f backend/Dockerfile backend
                          docker push ${env.REGISTRY}/backend:latest
                        """
                        sh """
                          docker build -t ${env.REGISTRY}/frontend:latest -f frontend1/Dockerfile frontend1
                          docker push ${env.REGISTRY}/frontend:latest
                        """
                    }
                }
            }
            post {
                success {
                    echo "✅ Build & Push Images completed successfully!"
                }
                failure {
                    echo "❌ Build & Push Images failed!"
                }
            }
        }

        stage('E2E Smoke Tests') {
            options { timeout(time: 15, unit: 'MINUTES') }
            agent any
            steps {
                script {
                    docker.image('mcr.microsoft.com/playwright:bionic')
                          .inside('--network=host') {
                        dir('frontend1') {
                            sh 'npm ci'
                            sh 'npm run build'
                            sh 'npx http-server dist/frontend1/browser -p 4200 -a 0.0.0.0 &'
                            sh 'npx wait-on http://localhost:4200'
                            sh 'npx playwright test e2e/tests/smoke.spec.ts --reporter=list --timeout=30000 --workers=4'
                        }
                    }
                }
            }
            post {
                always {
                    dir('frontend1') {
                        archiveArtifacts artifacts: 'playwright-report/**/*,test-results/**/*', allowEmptyArchive: true
                        publishHTML([
                            allowMissing:          true,
                            alwaysLinkToLastBuild: true,
                            keepAll:               true,
                            reportDir:             'playwright-report',
                            reportFiles:           'index.html',
                            reportName:            'E2E Test Report'
                        ])
                    }
                }
                success {
                    echo "✅ E2E Smoke Tests completed successfully!"
                }
                failure {
                    echo "❌ E2E Smoke Tests failed!"
                }
            }
        }

        stage('Deploy to Docker Host') {
            when { branch 'main' }
            options { timeout(time: 5, unit: 'MINUTES') }
            steps {
                sh '''
                  docker-compose pull
                  docker-compose up -d --remove-orphans
                '''
            }
            post {
                success {
                    echo "✅ Deploy to Docker Host completed successfully!"
                }
                failure {
                    echo "❌ Deploy to Docker Host failed!"
                }
            }
        }
    }

    post {
        always { cleanWs() }
        success { echo "✅ Pipeline completed successfully!" }
        failure { echo "❌ Pipeline failed." }
        unstable { echo "⚠️ Pipeline is unstable." }
    }
}
