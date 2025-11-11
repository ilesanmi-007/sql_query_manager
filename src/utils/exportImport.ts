// Export and Import functionality for SQL queries
export interface ExportData {
  queries: any[];
  tags: any[];
  categories: any[];
  exportedAt: string;
  version: string;
  metadata: {
    totalQueries: number;
    totalTags: number;
    totalCategories: number;
    exportFormat: 'json' | 'sql';
  };
}

export class ExportImportManager {
  static exportToJSON(queries: any[], includeMetadata: boolean = true): string {
    const tags = JSON.parse(localStorage.getItem('sqlQueryTags') || '[]');
    const categories = JSON.parse(localStorage.getItem('sqlQueryCategories') || '[]');
    
    const exportData: ExportData = {
      queries,
      tags,
      categories,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      metadata: {
        totalQueries: queries.length,
        totalTags: tags.length,
        totalCategories: categories.length,
        exportFormat: 'json'
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  static exportToSQL(queries: any[]): string {
    let sqlContent = `-- SQL Query Manager Export\n-- Generated on: ${new Date().toISOString()}\n-- Total queries: ${queries.length}\n\n`;
    
    queries.forEach((query, index) => {
      sqlContent += `-- ========================================\n`;
      sqlContent += `-- Query #${index + 1}: ${query.name || `Query ${query.id}`}\n`;
      sqlContent += `-- Created: ${query.timestamp}\n`;
      if (query.description) {
        sqlContent += `-- Description: ${query.description}\n`;
      }
      if (query.tags && query.tags.length > 0) {
        const tags = JSON.parse(localStorage.getItem('sqlQueryTags') || '[]');
        const tagNames = query.tags.map((tagId: string) => {
          const tag = tags.find((t: any) => t.id === tagId);
          return tag ? tag.name : tagId;
        }).join(', ');
        sqlContent += `-- Tags: ${tagNames}\n`;
      }
      sqlContent += `-- ========================================\n\n`;
      sqlContent += `${query.sql}\n\n`;
      
      if (query.result) {
        sqlContent += `/*\nSample Result:\n${query.result}\n*/\n\n`;
      }
    });

    return sqlContent;
  }

  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async importFromJSON(file: File): Promise<{
    queries: any[];
    tags: any[];
    categories: any[];
    metadata?: any;
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          
          // Validate import data structure
          if (!data.queries || !Array.isArray(data.queries)) {
            throw new Error('Invalid file format: missing queries array');
          }

          resolve({
            queries: data.queries || [],
            tags: data.tags || [],
            categories: data.categories || [],
            metadata: data.metadata
          });
        } catch (error) {
          reject(new Error(`Failed to parse JSON file: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  static async importFromSQL(file: File): Promise<{ queries: any[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const queries = this.parseSQLFile(content);
          resolve({ queries });
        } catch (error) {
          reject(new Error(`Failed to parse SQL file: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  private static parseSQLFile(content: string): any[] {
    const queries: any[] = [];
    const lines = content.split('\n');
    let currentQuery: any = null;
    let sqlLines: string[] = [];
    let inComment = false;
    let inResult = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;

      // Handle multi-line comments for results
      if (line.startsWith('/*')) {
        inResult = line.includes('Sample Result:');
        inComment = true;
        if (inResult && currentQuery) {
          currentQuery.result = '';
        }
        continue;
      }

      if (line.endsWith('*/')) {
        inComment = false;
        inResult = false;
        continue;
      }

      if (inComment && inResult && currentQuery) {
        currentQuery.result += line + '\n';
        continue;
      }

      // Parse query metadata from comments
      if (line.startsWith('-- Query #')) {
        // Save previous query if exists
        if (currentQuery && sqlLines.length > 0) {
          currentQuery.sql = sqlLines.join('\n').trim();
          queries.push(currentQuery);
        }

        // Start new query
        currentQuery = {
          id: Date.now() + queries.length,
          name: line.split(': ')[1] || `Imported Query ${queries.length + 1}`,
          sql: '',
          description: '',
          result: '',
          date: new Date().toISOString().split('T')[0],
          timestamp: new Date().toLocaleString(),
          currentVersion: 1,
          tags: [],
          versions: []
        };
        sqlLines = [];
        continue;
      }

      // Parse other metadata
      if (line.startsWith('-- Description:') && currentQuery) {
        currentQuery.description = line.replace('-- Description:', '').trim();
        continue;
      }

      if (line.startsWith('-- Tags:') && currentQuery) {
        const tagNames = line.replace('-- Tags:', '').trim().split(',').map(t => t.trim());
        // For now, just store tag names - they'll need to be matched with actual tag IDs later
        currentQuery.tagNames = tagNames;
        continue;
      }

      // Skip other comments and separators
      if (line.startsWith('--') || line.startsWith('=')) {
        continue;
      }

      // Collect SQL lines
      if (!inComment) {
        sqlLines.push(line);
      }
    }

    // Don't forget the last query
    if (currentQuery && sqlLines.length > 0) {
      currentQuery.sql = sqlLines.join('\n').trim();
      queries.push(currentQuery);
    }

    return queries;
  }

  static generateBackupFilename(format: 'json' | 'sql'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `sql-queries-backup-${timestamp}.${format}`;
  }

  static validateImportFile(file: File): { isValid: boolean; error?: string } {
    const validExtensions = ['.json', '.sql'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please select a .json or .sql file.'
      };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return {
        isValid: false,
        error: 'File too large. Maximum size is 10MB.'
      };
    }

    return { isValid: true };
  }
}
