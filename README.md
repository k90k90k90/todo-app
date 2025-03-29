# Todo Application

A tab-based todo application with separate work and personal categories using React, Express, and PostgreSQL.

## Features

- Create, edit, and delete todo items
- Separate tabs for work and personal todos
- Mark todos as complete/incomplete
- Sort todos by different criteria
- Responsive design for mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI components
- **Backend**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **API**: REST API
- **Authentication**: Not implemented yet

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a PostgreSQL database
4. Set up environment variables: `DATABASE_URL=your-postgres-connection-string`
5. Start the server: `npm run dev`
6. Access the application at http://localhost:5000

## Deployment to AWS EC2

### Prerequisites
1. An AWS account
2. An EC2 instance running Linux (Ubuntu/Amazon Linux 2 recommended)
3. SSH access to your EC2 instance
4. A PostgreSQL database (either RDS or installed on EC2)

### Deployment Steps

#### 1. Prepare Your EC2 Instance

First, connect to your EC2 instance via SSH:
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

Update your system and install Node.js:
```bash
# For Amazon Linux 2
sudo yum update -y
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# OR for Ubuntu
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Install PostgreSQL client tools (if needed):
```bash
# For Amazon Linux 2
sudo yum install -y postgresql

# OR for Ubuntu
sudo apt install -y postgresql-client
```

#### 2. Set Up PostgreSQL Database

If you're using Amazon RDS, make note of your database endpoint, username, password, and database name.

If you're hosting PostgreSQL on your EC2 instance:
```bash
# For Amazon Linux 2
sudo amazon-linux-extras install postgresql13
sudo yum install -y postgresql-server postgresql-devel
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# OR for Ubuntu
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configure PostgreSQL
sudo -u postgres psql -c "CREATE USER todoapp WITH PASSWORD 'your-password';"
sudo -u postgres psql -c "CREATE DATABASE tododb OWNER todoapp;"
```

#### 3. Deploy Your Application

Create a directory for your application:
```bash
mkdir -p ~/todoapp
cd ~/todoapp
```

Upload your code to the EC2 instance. You have several options:
- Use Git to clone your repository
- Use SCP to transfer files from your local machine
- Use AWS CodeDeploy

For example, using SCP:
```bash
# Run this from your local machine, not on EC2
scp -i your-key.pem -r /path/to/your/project/* ec2-user@your-instance-ip:~/todoapp/
```

Install dependencies:
```bash
cd ~/todoapp
npm install
```

#### 4. Configure Environment Variables

Create an environment file for production:
```bash
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://username:password@database-endpoint:5432/databasename
EOF
```

#### 5. Build the Application

```bash
npm run build
```

#### 6. Set Up Process Manager (PM2)

Install PM2 to keep your application running:
```bash
sudo npm install -g pm2
```

Create a PM2 configuration file:
```bash
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: "todoapp",
    script: "dist/index.js",
    env: {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://username:password@database-endpoint:5432/databasename"
    }
  }]
}
EOF
```

Start your application:
```bash
pm2 start ecosystem.config.js
```

Save the PM2 configuration to start on system boot:
```bash
pm2 startup
pm2 save
```

#### 7. Set Up Nginx as a Reverse Proxy (Optional but Recommended)

Install Nginx:
```bash
# For Amazon Linux 2
sudo amazon-linux-extras install nginx1
sudo systemctl start nginx
sudo systemctl enable nginx

# OR for Ubuntu
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Configure Nginx as a reverse proxy:
```bash
sudo tee /etc/nginx/conf.d/todoapp.conf << EOF
server {
    listen 80;
    server_name your-domain-or-ip;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
```

Test the configuration and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Set Up SSL/TLS with Let's Encrypt (Optional but Recommended)

```bash
# For Amazon Linux 2
sudo amazon-linux-extras install epel
sudo yum install -y certbot python2-certbot-nginx

# OR for Ubuntu
sudo apt install -y certbot python3-certbot-nginx

# Then obtain and install a certificate
sudo certbot --nginx -d your-domain.com
```

#### 9. Configure Security

Make sure your EC2 security group allows traffic on the appropriate ports:
- HTTP (port 80)
- HTTPS (port 443)
- SSH (port 22)

#### 10. Update Application (for future updates)

When you need to update your application:
```bash
cd ~/todoapp
git pull  # if using git
npm install  # if dependencies changed
npm run build
pm2 restart todoapp
```

## Accessing Your Todo App from the Internet using EC2 Public IP

### 1. Configure EC2 Security Groups

Make sure your EC2 security group allows incoming traffic on the necessary ports:

1. Open the AWS Management Console
2. Navigate to EC2 > Security Groups
3. Select the security group associated with your instance
4. Add inbound rules:
   - HTTP (Port 80) - Source: 0.0.0.0/0 (allows access from anywhere)
   - HTTPS (Port 443) - Source: 0.0.0.0/0 (if you're using SSL)
   - You should already have SSH (Port 22) configured for your access

### 2. Update Nginx Configuration for Public IP

If you've set up Nginx as a reverse proxy, update the configuration to use your public IP:

```bash
sudo nano /etc/nginx/conf.d/todoapp.conf
```

Update the `server_name` directive with your EC2 public IP:

```nginx
server {
    listen 80;
    server_name your-ec2-public-ip;  # Replace with your actual public IP

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Access Your Application

Now you should be able to access your application from any browser using:

```
http://your-ec2-public-ip
```

Just replace `your-ec2-public-ip` with your actual EC2 instance's public IP address.

### 4. Troubleshooting Issues

If you can't access your application, check the following:

1. **Verify the application is running:**
   ```bash
   pm2 status
   ```

2. **Check Nginx is running:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Check Nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Check your application logs:**
   ```bash
   pm2 logs todoapp
   ```

5. **Test locally on the EC2 instance:**
   ```bash
   curl http://localhost:5000
   ```

6. **Ensure the security group allows traffic:**
   Double-check your inbound rules in the EC2 console.

7. **Check if EC2 instance has a public IP:**
   Verify in the EC2 console that your instance has a public IP assigned.

### 5. Optional: Set up a Static IP (Elastic IP)

If you want a persistent IP address that doesn't change when you stop/start your EC2 instance:

1. In the EC2 console, go to "Elastic IPs"
2. Click "Allocate new address"
3. Select "Amazon's pool of IPv4 addresses"
4. Click "Allocate"
5. Select the new Elastic IP
6. Click "Actions" > "Associate Elastic IP address"
7. Select your EC2 instance and click "Associate"

This way, your application's IP address will remain the same even if you restart your EC2 instance.

### 6. Optional: Setting Up a Dynamic DNS (if you don't have a domain)

If you want a memorable URL instead of an IP address, you can use a free dynamic DNS service like:
- NoIP (noip.com)
- DuckDNS (duckdns.org)
- FreeDNS (freedns.afraid.org)

These services give you a subdomain like `yourtodoapp.ddns.net` that points to your EC2 IP address.

## Troubleshooting

- Check application logs with `pm2 logs todoapp`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Ensure database connectivity: `psql -h your-db-host -U your-username -d your-db`

## License

MIT