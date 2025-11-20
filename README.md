# SQL Query Manager

A modern, feature-rich web application for managing, organizing, and tracking SQL queries with version control, tagging, and export capabilities.

## 🚀 Features

### Core Functionality
- **Query Management**: Create, edit, and organize SQL queries with descriptions
- **Version Control**: Track query versions with timestamps and edit history
- **Result Storage**: Save query results as text or images
- **Favorites System**: Mark important queries as favorites for quick access
- **Tag Management**: Organize queries with custom tags and categories
- **Search & Filter**: Find queries by name, tags, or content
- **Dark/Light Mode**: Toggle between themes for comfortable viewing

### Advanced Features
- **Export/Import**: Backup and restore queries in JSON format
- **SQL Validation**: Basic syntax validation for SQL queries
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: All data persists locally in your browser

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.2 with React 19
- **Styling**: Tailwind CSS with custom components
- **Icons**: Heroicons for consistent UI elements
- **Syntax Highlighting**: Prism.js for SQL code display
- **Storage**: Browser localStorage for data persistence
- **Build Tool**: Turbopack for fast development and builds

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ilesanmi-007/SQL_saving_box.git
   cd sql-query-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage Guide

### Creating a New Query
1. Fill in the query name and description
2. Write your SQL query in the code editor
3. Add query results (text or upload an image)
4. Select relevant tags or create new ones
5. Mark as favorite if needed
6. Click "Save Query" to store

### Managing Saved Queries
- **View All**: Navigate to `/saved` to see all stored queries
- **Search**: Use the search bar to find specific queries
- **Filter**: Filter by tags, favorites, or date ranges
- **Edit**: Click on any query to modify and create new versions
- **Delete**: Remove queries you no longer need

### Version Control
- Each edit creates a new version automatically
- View version history with timestamps
- Compare different versions of the same query
- Restore previous versions when needed

### Tag Management
- Create custom tags for better organization
- Assign multiple tags to queries
- Filter queries by specific tags
- Manage tag colors and descriptions

### Export & Import
- **Export**: Download all queries as a JSON backup file
- **Import**: Upload and restore queries from backup files
- **Selective Import**: Choose which queries to import

## 📁 Project Structure

```
sql-query-manager/
├── src/
│   ├── app/
│   │   ├── saved/           # Saved queries page
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main query creation page
│   ├── utils/
│   │   ├── exportImport.ts  # Export/import functionality
│   │   ├── sqlValidator.ts  # SQL syntax validation
│   │   └── tagManager.ts    # Tag management system
│   └── types/               # TypeScript type definitions
├── package.json
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 🎨 Customization

### Themes
The application supports both light and dark themes. Toggle using the sun/moon icon in the header.

### Tags
Create custom tags with:
- Custom names and descriptions
- Color coding for visual organization
- Hierarchical categorization

### Storage
All data is stored locally in your browser's localStorage. To backup your data:
1. Use the export feature to download a JSON file
2. Import the file on any device to restore your queries

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with zero configuration

### Other Platforms
The application can be deployed on any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/ilesanmi-007/SQL_saving_box/issues) page to report bugs or request new features.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the code examples in the source
- Email: ilesanmi3451@gmail.com

---

**Built with ❤️ using Next.js and modern web technologies**
# SQL Query Manager

A modern, full-featured web application for managing, organizing, and sharing SQL queries with advanced collaboration features.

## 🚀 Overview

SQL Query Manager is a comprehensive Next.js application that provides developers and data analysts with a powerful platform to store, organize, execute, and share SQL queries. Built with modern web technologies, it offers both individual productivity features and team collaboration capabilities.

## ✨ Key Features

### 📝 Query Management
- **Create & Store**: Save SQL queries with names, descriptions, and metadata
- **Version Control**: Track query versions and changes over time
- **Rich Editor**: Syntax highlighting and code formatting for SQL
- **Result Storage**: Save query results and screenshots for reference
- **Favorites System**: Mark important queries for quick access

### 🏷️ Organization & Discovery
- **Tag System**: Organize queries with custom tags and categories
- **Advanced Search**: Find queries by name, description, tags, or content
- **Filtering**: Filter by favorites, tags, visibility, and date ranges
- **Smart Categorization**: Automatic organization suggestions

### 👥 Collaboration & Sharing
- **Public/Private Queries**: Control query visibility and sharing
- **Public Query Feed**: Browse and discover queries shared by the community
- **User Profiles**: View queries by specific users
- **Read-only Sharing**: Safe sharing without edit permissions

### 🎨 User Experience
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Color Themes**: Multiple color schemes (Ocean, Forest, Sunset, Purple, Rose, etc.)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Intuitive Interface**: Clean, modern UI with excellent usability

### 🔐 Security & Authentication
- **User Authentication**: Secure login system with NextAuth.js
- **Row-Level Security**: Database-level access control
- **Owner Permissions**: Only query owners can edit or change visibility
- **Admin Panel**: Administrative controls for user and query management

### 💾 Data Storage Options
- **Supabase Integration**: Cloud-based PostgreSQL with real-time features
- **Local Storage**: Client-side storage for offline usage
- **Flexible Backend**: Adaptable storage layer supporting multiple backends

### ☁️ Supabase Cloud Storage
The application leverages **Supabase** as its primary cloud database solution, providing:
- **PostgreSQL Database**: Robust, scalable relational database in the cloud
- **Real-time Subscriptions**: Live updates when queries are shared or modified
- **Row Level Security (RLS)**: Database-level access control for user data protection
- **Authentication Integration**: Seamless user management with built-in auth
- **Automatic Backups**: Enterprise-grade data protection and recovery
- **Global CDN**: Fast data access from anywhere in the world
- **RESTful APIs**: Auto-generated APIs for all database operations

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Heroicons** - Beautiful SVG icons

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **NextAuth.js** - Authentication and session management
- **Row Level Security** - Database-level access control
- **RESTful APIs** - Clean API design with proper HTTP methods

### Development & Testing
- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for cloud storage)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/ilesanmi-007/SQL-Query-Manager.git
   cd SQL-Query-Manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database setup**
   ```bash
   # Run the schema in your Supabase project
   psql -f supabase-schema.sql
   
   # Apply visibility migration if upgrading
   psql -f migration-add-visibility.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Environment Variables
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Schema
The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `queries` - SQL queries with metadata
- `tags` - Query categorization system

## 🎯 Use Cases

### For Individual Developers
- Store frequently used SQL queries
- Build a personal knowledge base of database operations
- Track query performance and results over time
- Organize queries by project or functionality

### For Data Teams
- Share common queries across team members
- Collaborate on complex data analysis
- Maintain a centralized query repository
- Document data workflows and procedures

### For Organizations
- Create a company-wide SQL knowledge base
- Standardize common database operations
- Enable knowledge sharing between teams
- Maintain query documentation and best practices

## 🚦 API Endpoints

### Queries
- `GET /api/queries` - List user queries
- `POST /api/queries` - Create new query
- `GET /api/queries/[id]` - Get specific query
- `PUT /api/queries/[id]` - Update query
- `DELETE /api/queries/[id]` - Delete query
- `PATCH /api/queries/[id]/visibility` - Toggle visibility

### Public Queries
- `GET /api/queries/public` - List all public queries
- `GET /public` - Public queries page (no auth required)

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- visibility.test.ts
```

## 📱 Features in Detail

### Query Visibility System
- **Private Queries**: Only visible to the owner
- **Public Queries**: Visible to all users in the public feed
- **Owner Controls**: Toggle visibility with a single click
- **Security**: Database-level access control ensures data privacy

### Tag Management
- Create custom tags for query organization
- Color-coded tag system for visual organization
- Filter queries by single or multiple tags
- Automatic tag suggestions based on query content

### Version Control
- Track all changes to queries over time
- Compare different versions side-by-side
- Restore previous versions when needed
- Maintain complete audit trail

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Development setup

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions
- **Email**: Contact the maintainers for enterprise support

## 🗺️ Roadmap

### Upcoming Features
- **Query Execution**: Direct database connection and query execution
- **Result Visualization**: Charts and graphs for query results
- **Team Workspaces**: Shared spaces for team collaboration
- **Query Templates**: Reusable query patterns and snippets
- **Advanced Analytics**: Query performance tracking and optimization
- **Export/Import**: Backup and migration tools
- **API Integration**: REST API for external tool integration

### Long-term Vision
- **Multi-database Support**: Connect to various database types
- **Real-time Collaboration**: Live editing and sharing
- **AI-powered Suggestions**: Smart query completion and optimization
- **Enterprise Features**: SSO, audit logs, and compliance tools

---

**Built with ❤️ by [Ilesanmi](https://github.com/ilesanmi-007)**

*Transform your SQL workflow with intelligent query management and seamless collaboration.*
