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

---

**Built with ❤️ using Next.js and modern web technologies**
