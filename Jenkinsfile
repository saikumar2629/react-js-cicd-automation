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
                sudo rm -rf /opt/app/*
                sudo mkdir -p /opt/app
                sudo cp -r backend frontend /opt/app/
                sudo chown -R ubuntu:ubuntu /opt/app
                '''
            }
        }

        stage('Backend: Install & Run') {
            steps {
                sh '''
                sudo -u ubuntu bash -c " 
                cd /opt/app/backend &&
                npm install &&
                pkill node || true &&
                nohup node server.js > backend.log 2>&1 &
                "
                '''
            }
        }

        stage('Frontend: Install & Run') {
            steps {
                sh '''
                sudo -u ubuntu bash -c "
                cd /opt/app/frontend
                npm install 
                pkill npm || true
                HOST=0.0.0.0 PORT=3000 nohup npm start > frontend.log 2>&1 &
                "
                '''
            }
        }
        
        stage('Verify Ports') {
            steps {
                sh '''
                echo 'Checking backend port...'
                sleep 5
                ss -tulpn | grep 5001 || true

                echo 'Checking frontend port...'
                ss -tulpn | grep 3000 || true
                '''
            }
        }
    }
}
