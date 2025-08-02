#!/bin/bash

# RealChat2 - Setup Script
# ========================
# This script automates the setup process for RealChat2
# Run this script from the root directory of the project

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
        
        if [ "$NODE_MAJOR" -ge 18 ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
            return 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        return 1
    fi
}

# Function to check npm version
check_npm_version() {
    if command_exists npm; then
        NPM_VERSION=$(npm -v)
        NPM_MAJOR=$(echo $NPM_VERSION | cut -d'.' -f1)
        
        if [ "$NPM_MAJOR" -ge 8 ]; then
            print_success "npm version $NPM_VERSION is compatible"
            return 0
        else
            print_error "npm version $NPM_VERSION is too old. Please install npm 8 or higher."
            return 1
        fi
    else
        print_error "npm is not installed. Please install npm 8 or higher."
        return 1
    fi
}

# Function to check Git
check_git() {
    if command_exists git; then
        print_success "Git is installed"
        return 0
    else
        print_warning "Git is not installed. Please install Git for version control."
        return 1
    fi
}

# Function to install backend dependencies
install_backend() {
    print_header "Installing Backend Dependencies"
    
    if [ ! -d "Backend" ]; then
        print_error "Backend directory not found!"
        exit 1
    fi
    
    cd Backend
    
    print_status "Installing npm packages..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    cd ..
}

# Function to install frontend dependencies
install_frontend() {
    print_header "Installing Frontend Dependencies"
    
    if [ ! -d "Frontend" ]; then
        print_error "Frontend directory not found!"
        exit 1
    fi
    
    cd Frontend
    
    print_status "Installing npm packages..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    cd ..
}

# Function to setup environment variables
setup_environment() {
    print_header "Setting Up Environment Variables"
    
    cd Backend
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            print_status "Creating .env file from env.example..."
            cp env.example .env
            print_success "Environment file created"
            print_warning "Please edit Backend/.env with your configuration"
        else
            print_warning "env.example not found. Please create .env file manually"
        fi
    else
        print_success "Environment file already exists"
    fi
    
    cd ..
}

# Function to create admin user
create_admin() {
    print_header "Creating Admin User"
    
    cd Backend
    
    if [ -f "package.json" ]; then
        print_status "Creating admin user..."
        npm run setup
        
        if [ $? -eq 0 ]; then
            print_success "Admin user created successfully"
            print_status "Admin credentials:"
            print_status "  Name: Deep"
            print_status "  Phone: 7005461841"
        else
            print_warning "Failed to create admin user. You can create it manually later."
        fi
    else
        print_error "package.json not found in Backend directory"
    fi
    
    cd ..
}

# Function to check MongoDB
check_mongodb() {
    print_header "Checking MongoDB"
    
    if command_exists mongod; then
        print_success "MongoDB is installed"
        print_status "Make sure MongoDB is running: mongod"
    else
        print_warning "MongoDB is not installed locally"
        print_status "For local development, install MongoDB from: https://www.mongodb.com/try/download/community"
        print_status "For production, use MongoDB Atlas: https://cloud.mongodb.com"
    fi
}

# Function to display next steps
show_next_steps() {
    print_header "Setup Complete! Next Steps"
    
    echo -e "${CYAN}1. Configure Environment Variables:${NC}"
    echo "   Edit Backend/.env with your configuration"
    echo ""
    
    echo -e "${CYAN}2. Start MongoDB:${NC}"
    echo "   Local: mongod"
    echo "   Atlas: Use connection string in .env"
    echo ""
    
    echo -e "${CYAN}3. Start Development Servers:${NC}"
    echo "   Terminal 1: cd Backend && npm run dev"
    echo "   Terminal 2: cd Frontend && npm run dev"
    echo ""
    
    echo -e "${CYAN}4. Access the Application:${NC}"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend: http://localhost:5000"
    echo ""
    
    echo -e "${CYAN}5. Admin Login:${NC}"
    echo "   Name: Deep"
    echo "   Phone: 7005461841"
    echo ""
    
    echo -e "${CYAN}6. Documentation:${NC}"
    echo "   README.md - Main documentation"
    echo "   DEPLOYMENT_GUIDE.md - Deployment instructions"
    echo "   requirements.txt - All requirements"
    echo ""
    
    echo -e "${GREEN}🎉 RealChat2 is ready to use!${NC}"
}

# Main setup function
main() {
    print_header "RealChat2 Setup Script"
    echo ""
    
    # Check prerequisites
    print_header "Checking Prerequisites"
    
    if ! check_node_version; then
        exit 1
    fi
    
    if ! check_npm_version; then
        exit 1
    fi
    
    check_git
    check_mongodb
    
    echo ""
    
    # Install dependencies
    install_backend
    echo ""
    
    install_frontend
    echo ""
    
    # Setup environment
    setup_environment
    echo ""
    
    # Create admin user
    create_admin
    echo ""
    
    # Show next steps
    show_next_steps
}

# Check if script is run from project root
if [ ! -d "Backend" ] || [ ! -d "Frontend" ]; then
    print_error "Please run this script from the RealChat2 project root directory"
    exit 1
fi

# Run main function
main "$@" 