pipeline {
    agent any

    environment {
        SERVER_IP = "65.0.104.110"  // Replace with your EC2 public IP
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

        stage('Install Node.js (System-wide)') {
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

                ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
                GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
                EOF
                '''
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

        stage('Configure Backend ENV') {
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

        stage('Backend: Install & Run') {
            steps {
                sh '''
                sudo pkill -f "node server.js" || true
                sudo -u ubuntu bash -c '
                cd /opt/app/backend
                npm install
                nohup node server.js > backend.log 2>&1 &
                '
                sleep 5
                echo "Backend should be running on port ${BACKEND_PORT}:"
                ss -tulpn | grep ${BACKEND_PORT} || true
                '''
            }
        }

        stage('Wait Backend Ready') {
            steps {
                sh '''
                echo "Waiting for backend to respond..."
                for i in {1..15}; do
                  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${BACKEND_PORT}/api/signup || true)
                  if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "405" ]; then
                    echo "Backend is ready!"
                    break
                  fi
                  echo "Backend not ready yet, retrying..."
                  sleep 2
                done
                '''
            }
        }

        stage('Frontend: Install & Run') {
    steps {
        sh '''
        # Stop any existing React apps
        sudo pkill -f react-scripts || true

        # Start frontend as ubuntu user
        sudo -u ubuntu bash -c '
        cd /opt/app/frontend
        npm install
        export HOST=0.0.0.0
        export PORT=${FRONTEND_PORT}
        export REACT_APP_API_URL=http://${SERVER_IP}:${BACKEND_PORT}
        nohup npm start > frontend.log 2>&1 &
        '

        # Wait a few seconds and check
        sleep 5
        echo "Frontend should be running on port ${FRONTEND_PORT}:"
        ss -tulpn | grep ${FRONTEND_PORT} || true
        '''
    }
}


    }
}
