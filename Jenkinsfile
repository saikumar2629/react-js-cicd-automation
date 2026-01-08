pipeline {
    agent any

    tools {
        nodejs 'node18'
    }

    stages {

        stage('Clone Repo') {
            steps {
                echo "Code cloned automatically by Jenkins"
            }
        }

        stage('Deploy to /opt/app') {
            steps {
                sh '''
                sudo rm -rf /opt/app
                sudo mkdir -p /opt/app
                sudo cp -r backend frontend /opt/app/
                sudo chown -R ubuntu:ubuntu /opt/app
                '''
            }
        }

        stage('Backend: Install & Run') {
            steps {
                sh '''
                sudo -u ubuntu bash << EOF
                cd /opt/app/backend
                npm install
                pkill node || true
                nohup node server.js > backend.log 2>&1 &
                EOF
                '''
            }
        }

        stage('Frontend: Install & Run') {
            steps {
                sh '''
                sudo -u ubuntu bash << EOF
                cd /opt/app/frontend
                npm install
                pkill npm || true
                PORT=3000 nohup npm start > frontend.log 2>&1 &
                EOF
                '''
            }
        }
    }
}
