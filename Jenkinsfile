pipeline {
    agent any

    environment {
        SERVER_IP = "65.0.104.110"        // Replace with your EC2 public IP
        BACKEND_PORT = "5001"
        FRONTEND_PORT = "3000"
        DB_NAME = "saidb"
        DB_USER = "saikumar"
        DB_PASSWORD = "saikumar123"
        DB_HOST = "127.0.0.1"
        DB_PORT = "5432"
        GIT_REPO = "https://github.com/saikumar2629/react-js-cicd-automation.git"
        GIT_BRANCH = "main"
    }

    stages {

        stage('Clone Repo') {
            steps {
                git branch: "${GIT_BRANCH}", url: "${GIT_REPO}"
            }
        }

        stage('Install Node.js') {
            steps {
                sh '''
                if ! command -v node >/dev/null 2>&1; then
                  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                  sudo apt-get install -y nodejs
                fi
                node -v
                npm -v
                '''
            }
        }

        stage('Install & Start PostgreSQL') {
            steps {
                sh '''
                if ! command -v psql >/dev/null 2>&1; then
                    sudo apt-get update
                    sudo apt-get install -y postgresql postgresql-contrib
                fi

                sudo systemctl enable postgresql
                sudo systemctl restart postgresql

                # Wait until PostgreSQL is ready
                for i in {1..15}; do
                    pg_isready -h ${DB_HOST} -p ${DB_PORT} && break
                    echo "Waiting for PostgreSQL..."
                    sleep 2
                done
                '''
            }
        }

        stage('Setup PostgreSQL Database & User') {
            steps {
                sh '''
                sudo -u postgres psql << EOF
                DO \$\$
                BEGIN
                  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
                    CREATE DATABASE ${DB_NAME};
                  END IF;
                END
                \$\$;

                DO \$\$
                BEGIN
                  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
                    CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
                  END IF;
                END
                \$\$;

                GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
                EOF
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                sudo rm -rf /opt/app
                sudo mkdir -p /opt/app
                sudo cp -r backend frontend /opt/app/
                sudo chown -R ubuntu:ubuntu /opt/app
                '''
            }
        }

        stage('Configure Backend Environment') {
            steps {
                sh '''
                sudo -u ubuntu bash -c '
                cat > /opt/app/backend/.env << EOF
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
PORT=${BACKEND_PORT}
EOF
                '
                '''
            }
        }

        stage('Start Backend') {
            steps {
                sh '''
                sudo pkill -f "node server.js" || true
                sudo -u ubuntu bash -c '
                cd /opt/app/backend
                npm install
                nohup node server.js > backend.log 2>&1 &
                '
                sleep 5
                echo "Backend running on port ${BACKEND_PORT}:"
                ss -tulpn | grep ${BACKEND_PORT} || true
                '''
            }
        }

        stage('Wait Backend Ready') {
  steps {
    sh '''
    echo "Waiting for backend health..."
    for i in {1..20}; do
      if curl -s http://127.0.0.1:${BACKEND_PORT}/health | grep OK; then
        echo "Backend is healthy"
        exit 0
      fi
      echo "Waiting..."
      sleep 2
    done
    echo "Backend failed to start"
    exit 1
    '''
  }
}


        stage('Start Frontend') {
            steps {
                sh '''
                sudo pkill -f react-scripts || true
                sudo -u ubuntu bash -c "
                cd /opt/app/frontend
                npm install
                export HOST=0.0.0.0
                export PORT=${FRONTEND_PORT}
                export REACT_APP_API_URL=http://${SERVER_IP}:${BACKEND_PORT}
                nohup npm start > frontend.log 2>&1 &
                "
                sleep 5
                echo "Frontend running on port ${FRONTEND_PORT}:"
                ss -tulpn | grep ${FRONTEND_PORT} || true
                '''
            }
        }
    }
}
