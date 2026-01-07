pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                echo "Cloning GitHub repository"
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Start Backend on Port 5001') {
            steps {
                dir('backend') {
                    sh 'pkill node || true'
                    sh 'nohup node server.js > backend.log 2>&1 &'
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

        stage('Start Frontend on Port 3001') {
            steps {
                dir('frontend') {
                    sh 'PORT=3001 nohup npm start > frontend.log 2>&1 &'
                }
            }
        }
    }
}
