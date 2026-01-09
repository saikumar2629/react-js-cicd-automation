pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                echo "Code cloned automatically by Jenkins"
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

        stage('Ensure postgreSQL is running') {
            steps {
                sh '''
                echo "Installing postgreSQL if missing..."
                if ! command -v psql >/dev/null 2>&1;then
                    sudo apt-get update
                    sudo apt-get install -y postgresql postgresql-contrib
                fi

                echo "starting postgreSQL service..."
                sudo systemctl start postgresql
                sudo systemctl enable postgresql

                sudo systemctl status postgresql --no-pager
                '''
            }
        }

        stage('Setup PostgreSQL Database') {
    steps {
        sh '''
        sudo -u postgres psql << EOF
        DO
        $$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'saidb') THEN
                CREATE DATABASE saidb;
            END IF;
        END
        $$;

        DO
        $$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'saikumar') THEN
                CREATE USER saikumar WITH PASSWORD 'saikumar123';
            END IF;
        END
        $$;

        GRANT ALL PRIVILEGES ON DATABASE saidb TO saikumar;
        EOF
        '''
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
                set -e
                
                echo "stopping backend server ...(as root)"
                sudo pkill -f "node server.js" || true

                echo "starting backend (as ubuntu)..."
                sudo -u ubuntu bash -c '
                cd /opt/app/backend 
                
                npm install 
                
                nohup node server.js > backend.log 2>&1 &
                '
                '''
            }
        }

        stage('Frontend: Install & Run') {
            steps {
                sh '''
                set -e
                
                echo "stopping existing React app (as root)..."
                sudo pkill -f react-scripts || true 
                
                echo "Starting React app (as ubuntu)..."
                sudo -u ubuntu bash -c "
                cd /opt/app/frontend
                
                npm install
                
                export HOST=0.0.0.0 
                export PORT=3000
                
                nohup npm start > frontend.log 2>&1 &
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
