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
                        // Publish JUnit test results
                        junit '**/target/surefire-reports/*.xml'
                        // Archive the raw XML & any other artifacts
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
                        // Publish any unit test XML results here
                        junit '**/test-results/*.xml'
                    }
                }
            }
        }

        stage('Build & Push Images') {
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
        }

        stage('E2E Smoke Tests') {
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
            }
        }

        stage('Deploy to Docker Host') {
            when { branch 'main' }
            steps {
                sh '''
                  docker-compose pull
                  docker-compose up -d --remove-orphans
                '''
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
