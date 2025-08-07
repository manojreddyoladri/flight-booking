pipeline {
    agent any

    environment {
        // Docker registry hostname/namespace
        REGISTRY       = 'docker.io/wanderer1217'
        // Credentials ID for your Docker registry in Jenkins
        DOCKER_CRED_ID = 'docker-registry-creds'
    }

    options {
        // Prevent multiple builds of the same commit
        skipDefaultCheckout(false)
        // Timeout to prevent runaway builds
        timeout(time: 1, unit: 'HOURS')
        // Only one build at a time
        disableConcurrentBuilds()
    }

    triggers {
        // Poll SCM every minute for changes on main
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
            steps {
                dir('backend') {
                    sh './mvnw clean install -DskipTests'
                    sh './mvnw test'
                    sh './mvnw verify -Dspring.profiles.active=test'
                }
            }
            post {
                always {
                    dir('backend') {
                        publishTestResults testResultsPattern: '**/surefire-reports/*.xml'
                        archiveArtifacts artifacts: 'target/surefire-reports/**/*', allowEmptyArchive: true
                    }
                }
            }
        }

        stage('Frontend Build & Test') {
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
                        publishTestResults testResultsPattern: '**/test-results/*.xml'
                    }
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    docker.withRegistry("https://${env.REGISTRY}", env.DOCKER_CRED_ID) {
                        // Build & push backend image
                        sh """
                          docker build -t ${env.REGISTRY}/backend:latest -f backend/Dockerfile backend
                          docker push ${env.REGISTRY}/backend:latest
                        """
                        // Build & push frontend image
                        sh """
                          docker build -t ${env.REGISTRY}/frontend:latest -f frontend1/Dockerfile frontend1
                          docker push ${env.REGISTRY}/frontend:latest
                        """
                    }
                }
            }
        }

        stage('E2E Smoke Tests') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:bionic'
                    args  '--network=host'
                }
            }
            steps {
                dir('frontend1') {
                    // ensure dependencies
                    sh 'npm ci'
                    // serve production build
                    sh 'npm run build'
                    sh 'npx http-server dist/frontend1/browser -p 4200 -a 0.0.0.0 &'
                    sh 'npx wait-on http://localhost:4200'
                    // run smoke tests
                    sh 'npx playwright test e2e/tests/smoke.spec.ts --reporter=list --timeout=30000 --workers=4'
                }
            }
            post {
                always {
                    dir('frontend1') {
                        archiveArtifacts artifacts: 'playwright-report/**/*,test-results/**/*', allowEmptyArchive: true
                        publishHTML([
                            allowMissing:        true,
                            alwaysLinkToLastBuild: true,
                            keepAll:             true,
                            reportDir:           'playwright-report',
                            reportFiles:         'index.html',
                            reportName:          'E2E Test Report'
                        ])
                    }
                }
            }
        }

        stage('Deploy to Docker Host') {
            when {
                branch 'main'
            }
            steps {
                // deploy updated images via docker-compose
                sh '''
                  docker-compose pull
                  docker-compose up -d --remove-orphans
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed."
        }
        unstable {
            echo "⚠️ Pipeline is unstable."
        }
    }
}
