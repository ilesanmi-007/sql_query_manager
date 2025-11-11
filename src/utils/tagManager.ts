// Tag and Category Management System
export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  usageCount: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: string;
  queryCount: number;
}

export class TagManager {
  private static readonly STORAGE_KEY_TAGS = 'sqlQueryTags';
  private static readonly STORAGE_KEY_CATEGORIES = 'sqlQueryCategories';

  // Predefined tag colors
  private static readonly TAG_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
  ];

  // Predefined categories with icons
  private static readonly DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'queryCount'>[] = [
    { name: 'Analytics', description: 'Data analysis and reporting queries', color: '#3b82f6', icon: '📊' },
    { name: 'CRUD Operations', description: 'Create, Read, Update, Delete operations', color: '#10b981', icon: '🔄' },
    { name: 'Performance', description: 'Performance optimization queries', color: '#f59e0b', icon: '⚡' },
    { name: 'Maintenance', description: 'Database maintenance and admin queries', color: '#6b7280', icon: '🔧' },
    { name: 'Migration', description: 'Schema changes and data migration', color: '#8b5cf6', icon: '🚀' },
    { name: 'Backup', description: 'Backup and restore operations', color: '#06b6d4', icon: '💾' },
    { name: 'Security', description: 'Security and permissions related queries', color: '#ef4444', icon: '🔒' },
    { name: 'Testing', description: 'Test data and validation queries', color: '#84cc16', icon: '🧪' }
  ];

  static getTags(): Tag[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_TAGS);
    return stored ? JSON.parse(stored) : [];
  }

  static getCategories(): Category[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_CATEGORIES);
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Initialize with default categories
      const defaultCategories = this.DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        queryCount: 0
      }));
      this.saveCategories(defaultCategories);
      return defaultCategories;
    }
  }

  static createTag(name: string, description?: string): Tag {
    const tags = this.getTags();
    const existingTag = tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
    
    if (existingTag) {
      throw new Error('Tag already exists');
    }

    const newTag: Tag = {
      id: this.generateId(),
      name: name.trim(),
      color: this.getRandomColor(),
      description: description?.trim(),
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    tags.push(newTag);
    this.saveTags(tags);
    return newTag;
  }

  static createCategory(name: string, description?: string, color?: string, icon?: string): Category {
    const categories = this.getCategories();
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
    
    if (existingCategory) {
      throw new Error('Category already exists');
    }

    const newCategory: Category = {
      id: this.generateId(),
      name: name.trim(),
      description: description?.trim(),
      color: color || this.getRandomColor(),
      icon: icon?.trim(),
      createdAt: new Date().toISOString(),
      queryCount: 0
    };

    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  static updateTag(id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>): Tag {
    const tags = this.getTags();
    const tagIndex = tags.findIndex(tag => tag.id === id);
    
    if (tagIndex === -1) {
      throw new Error('Tag not found');
    }

    tags[tagIndex] = { ...tags[tagIndex], ...updates };
    this.saveTags(tags);
    return tags[tagIndex];
  }

  static updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Category {
    const categories = this.getCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }

    categories[categoryIndex] = { ...categories[categoryIndex], ...updates };
    this.saveCategories(categories);
    return categories[categoryIndex];
  }

  static deleteTag(id: string): void {
    const tags = this.getTags().filter(tag => tag.id !== id);
    this.saveTags(tags);
  }

  static deleteCategory(id: string): void {
    const categories = this.getCategories().filter(cat => cat.id !== id);
    this.saveCategories(categories);
  }

  static incrementTagUsage(tagId: string): void {
    const tags = this.getTags();
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
      tag.usageCount++;
      this.saveTags(tags);
    }
  }

  static incrementCategoryUsage(categoryId: string): void {
    const categories = this.getCategories();
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      category.queryCount++;
      this.saveCategories(categories);
    }
  }

  static decrementTagUsage(tagId: string): void {
    const tags = this.getTags();
    const tag = tags.find(t => t.id === tagId);
    if (tag && tag.usageCount > 0) {
      tag.usageCount--;
      this.saveTags(tags);
    }
  }

  static decrementCategoryUsage(categoryId: string): void {
    const categories = this.getCategories();
    const category = categories.find(c => c.id === categoryId);
    if (category && category.queryCount > 0) {
      category.queryCount--;
      this.saveCategories(categories);
    }
  }

  static getPopularTags(limit: number = 10): Tag[] {
    return this.getTags()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  static searchTags(query: string): Tag[] {
    const searchTerm = query.toLowerCase();
    return this.getTags().filter(tag => 
      tag.name.toLowerCase().includes(searchTerm) ||
      tag.description?.toLowerCase().includes(searchTerm)
    );
  }

  static searchCategories(query: string): Category[] {
    const searchTerm = query.toLowerCase();
    return this.getCategories().filter(category => 
      category.name.toLowerCase().includes(searchTerm) ||
      category.description?.toLowerCase().includes(searchTerm)
    );
  }

  static suggestTags(sqlQuery: string): string[] {
    const suggestions: string[] = [];
    const upperSql = sqlQuery.toUpperCase();

    // Suggest based on SQL content
    if (upperSql.includes('SELECT') && upperSql.includes('COUNT')) suggestions.push('analytics');
    if (upperSql.includes('INSERT') || upperSql.includes('UPDATE') || upperSql.includes('DELETE')) suggestions.push('crud');
    if (upperSql.includes('CREATE') || upperSql.includes('ALTER') || upperSql.includes('DROP')) suggestions.push('schema');
    if (upperSql.includes('INDEX') || upperSql.includes('EXPLAIN')) suggestions.push('performance');
    if (upperSql.includes('BACKUP') || upperSql.includes('RESTORE')) suggestions.push('backup');
    if (upperSql.includes('GRANT') || upperSql.includes('REVOKE')) suggestions.push('security');
    if (upperSql.includes('JOIN')) suggestions.push('complex');
    if (upperSql.includes('UNION') || upperSql.includes('INTERSECT')) suggestions.push('advanced');
    if (upperSql.includes('PROCEDURE') || upperSql.includes('FUNCTION')) suggestions.push('stored-procedure');
    if (upperSql.includes('TRIGGER')) suggestions.push('trigger');

    return [...new Set(suggestions)]; // Remove duplicates
  }

  private static saveTags(tags: Tag[]): void {
    localStorage.setItem(this.STORAGE_KEY_TAGS, JSON.stringify(tags));
  }

  private static saveCategories(categories: Category[]): void {
    localStorage.setItem(this.STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static getRandomColor(): string {
    return this.TAG_COLORS[Math.floor(Math.random() * this.TAG_COLORS.length)];
  }

  // Export/Import functionality
  static exportTagsAndCategories(): string {
    return JSON.stringify({
      tags: this.getTags(),
      categories: this.getCategories(),
      exportedAt: new Date().toISOString()
    });
  }

  static importTagsAndCategories(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.tags && Array.isArray(parsed.tags)) {
        this.saveTags(parsed.tags);
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        this.saveCategories(parsed.categories);
      }
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }
}
