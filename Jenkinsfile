pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                echo "Code cloned automatically by Jenkins"
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Deploy to /opt/app') {
            steps {
                sh '''
                rm -rf /opt/app/*
                cp -r backend frontend /opt/app/
                '''
            }
        }

        stage('Start Backend on Port 5001') {
            steps {
                dir('/home/ubuntu/app/backend') {
                    sh 'pkill node || true'
                    sh 'nohup node server.js > backend.log 2>&1 &'
                }
            }
        }

        stage('Start Frontend on Port 3000') {
            steps {
                dir('/home/ubuntu/app/frontend') {
                    sh 'PORT=3000 nohup npm start > frontend.log 2>&1 &'
                }
            }
        }
    }
}

