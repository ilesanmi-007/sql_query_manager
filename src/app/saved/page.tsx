'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css';
import { 
  MagnifyingGlassIcon, 
  CalendarIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PlusIcon,
  FolderOpenIcon,
  CodeBracketIcon,
  PhotoIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  Squares2X2Icon,
  ListBulletIcon,
  SunIcon,
  MoonIcon,
  ArrowsPointingOutIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

interface QueryVersion {
  version: number;
  name: string;
  sql: string;
  description: string;
  result: string;
  resultImage?: string;
  editedAt: string;
  editedBy?: string;
}

interface Query {
  id: number;
  name?: string;
  sql: string;
  description: string;
  result: string;
  resultImage?: string;
  date: string;
  timestamp: string;
  lastEdited?: string;
  versions?: QueryVersion[];
  currentVersion?: number;
}

export default function SavedQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedQueries, setExpandedQueries] = useState<Set<number>>(new Set());
  const [editingQuery, setEditingQuery] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    sql: '',
    description: '',
    result: '',
    resultImage: ''
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colorTheme, setColorTheme] = useState<'default' | 'ocean' | 'forest' | 'sunset' | 'database'>('database');
  const [fullscreenQuery, setFullscreenQuery] = useState<Query | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedColorTheme = localStorage.getItem('colorTheme') as 'default' | 'ocean' | 'forest' | 'sunset' | 'database';
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    
    if (savedColorTheme) {
      setColorTheme(savedColorTheme);
      document.documentElement.setAttribute('data-theme', savedColorTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'database');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const changeColorTheme = (theme: 'default' | 'ocean' | 'forest' | 'sunset' | 'database') => {
    setColorTheme(theme);
    localStorage.setItem('colorTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  useEffect(() => {
    const saved = localStorage.getItem('sqlQueries');
    console.log('Raw localStorage data:', saved); // Debug log
    if (saved) {
      try {
        const parsedQueries = JSON.parse(saved);
        console.log('Parsed queries:', parsedQueries); // Debug log
        setQueries(parsedQueries);
      } catch (error) {
        console.error('Error parsing saved queries:', error);
        // Try to recover corrupted data
        localStorage.removeItem('sqlQueries');
        setQueries([]);
      }
    } else {
      console.log('No saved queries found in localStorage');
    }
  }, []);

  useEffect(() => {
    Prism.highlightAll();
  }, [queries, expandedQueries]);

  const deleteQuery = (id: number) => {
    if (confirm('Delete this query?')) {
      const updated = queries.filter(q => q.id !== id);
      setQueries(updated);
      localStorage.setItem('sqlQueries', JSON.stringify(updated));
    }
  };

  const startEdit = (query: Query) => {
    if (viewMode === 'grid') {
      setIsEditModalOpen(true);
    }
    setEditingQuery(query.id);
    setEditForm({
      name: query.name || '',
      sql: query.sql,
      description: query.description,
      result: query.result,
      resultImage: query.resultImage || ''
    });
  };

  const cancelEdit = () => {
    setEditingQuery(null);
    setIsEditModalOpen(false);
    setEditForm({ name: '', sql: '', description: '', result: '', resultImage: '' });
  };

  const openFullscreen = (query: Query) => {
    setFullscreenQuery(query);
  };

  const closeFullscreen = () => {
    setFullscreenQuery(null);
  };

  const saveEdit = (id: number) => {
    const updated = queries.map(query => {
      if (query.id === id) {
        const currentVersion = query.currentVersion || 1;
        const newVersion = currentVersion + 1;
        
        const newVersionData: QueryVersion = {
          version: newVersion,
          name: editForm.name,
          sql: editForm.sql,
          description: editForm.description,
          result: editForm.result,
          resultImage: editForm.resultImage || undefined,
          editedAt: new Date().toLocaleString()
        };

        return {
          ...query,
          name: editForm.name,
          sql: editForm.sql,
          description: editForm.description,
          result: editForm.result,
          resultImage: editForm.resultImage || undefined,
          lastEdited: new Date().toLocaleString(),
          currentVersion: newVersion,
          versions: [...(query.versions || []), newVersionData]
        };
      }
      return query;
    });
    
    setQueries(updated);
    localStorage.setItem('sqlQueries', JSON.stringify(updated));
    setEditingQuery(null);
    setIsEditModalOpen(false);
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedQueries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedQueries(newExpanded);
  };

  const truncateText = (text: string, maxLines: number = 3) => {
    const lines = text.split('\n');
    return lines.length > maxLines ? lines.slice(0, maxLines).join('\n') + '...' : text;
  };

  const shouldShowSeeMore = (text: string, maxLines: number = 3) => {
    return text.split('\n').length > maxLines;
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = !searchTerm || 
      query.sql.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (query.name && query.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = !dateFilter || query.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen p-6 theme-bg">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-8 animate-fade-in-up">
          <div className="glass-card rounded-2xl p-2 inline-flex gap-2">
            <Link href="/" className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl font-medium transition-all duration-200">
              New Query
            </Link>
            <span className="px-6 py-3 theme-gradient text-white rounded-xl font-medium shadow-lg">
              Saved Queries
            </span>
          </div>
        </nav>

        <div className="flex items-center justify-between mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 theme-gradient rounded-2xl flex items-center justify-center shadow-xl">
              <FolderOpenIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold theme-text-gradient">
                Saved Queries
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{queries.length} queries in your collection</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Color Theme Selector */}
            <div className="relative group">
              <button className="glass-card p-3 rounded-xl hover:shadow-lg transition-all duration-200">
                <SwatchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="grid grid-cols-2 gap-2 w-48">
                  {[
                    { key: 'database', name: 'Database', colors: ['#1e40af', '#3b82f6'] },
                    { key: 'ocean', name: 'Ocean', colors: ['#0891b2', '#06b6d4'] },
                    { key: 'forest', name: 'Forest', colors: ['#059669', '#10b981'] },
                    { key: 'sunset', name: 'Sunset', colors: ['#dc2626', '#f59e0b'] },
                    { key: 'default', name: 'Purple', colors: ['#7c3aed', '#a855f7'] }
                  ].map((theme) => (
                    <button
                      key={theme.key}
                      onClick={() => changeColorTheme(theme.key as any)}
                      className={`p-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                        colorTheme === theme.key ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ background: `linear-gradient(45deg, ${theme.colors[0]}, ${theme.colors[1]})` }}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{theme.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="glass-card rounded-xl p-1 flex">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'theme-gradient text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'theme-gradient text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="glass-card p-3 rounded-xl hover:shadow-lg transition-all duration-200"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            
            <Link 
              href="/" 
              className="group px-6 py-3 theme-gradient text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <PlusIcon className="w-5 h-5" />
                New Query
              </div>
            </Link>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in-up search-enhanced" style={{animationDelay: '0.2s'}}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-4 theme-focus-ring theme-border-focus transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Search queries by name, SQL content, or description..."
              />
            </div>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-4 theme-focus-ring theme-border-focus transition-all duration-300 text-gray-900 dark:text-gray-100"
              />
            </div>
            <button
              onClick={() => { setSearchTerm(''); setDateFilter(''); }}
              className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-300 font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
          {filteredQueries.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center animate-fade-in-up col-span-full" style={{animationDelay: '0.3s'}}>
              <div className="w-24 h-24 theme-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CodeBracketIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">No queries found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {queries.length === 0 
                  ? "Start building your SQL query collection" 
                  : "Try adjusting your search filters"
                }
              </p>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-8 py-4 theme-gradient text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <PlusIcon className="w-5 h-5" />
                Create your first query
              </Link>
            </div>
          ) : (
            filteredQueries.map((query, index) => {
              const isExpanded = expandedQueries.has(query.id);
              const showSqlMore = shouldShowSeeMore(query.sql);
              const showDescMore = query.description && shouldShowSeeMore(query.description, 2);
              const showResultMore = query.result && shouldShowSeeMore(query.result, 2);
              const hasExpandableContent = showSqlMore || showDescMore || showResultMore;
              const isEditing = editingQuery === query.id && viewMode === 'list';

              return (
                <div 
                  key={query.id} 
                  className={`glass-card rounded-3xl overflow-hidden animate-fade-in-up hover:shadow-2xl transition-all duration-300 ${
                    viewMode === 'grid' ? 'h-fit' : ''
                  }`}
                  style={{animationDelay: `${0.3 + index * 0.1}s`}}
                >
                  <div className="theme-header-bg px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 theme-gradient rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          #{query.id.toString().slice(-3)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">
                            {query.name || `Query #${query.id}`}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{query.timestamp}</p>
                        </div>
                      </div>
                      
                      {/* Action Buttons - Separated for better UX */}
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {/* View Actions */}
                        <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-1">
                          {viewMode === 'list' && hasExpandableContent && (
                            <button
                              onClick={() => toggleExpanded(query.id)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-200 tooltip"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                          )}
                          {viewMode === 'grid' && (
                            <button
                              onClick={() => openFullscreen(query)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-200 tooltip"
                              title="View Fullscreen"
                            >
                              <ArrowsPointingOutIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        {/* Edit Actions */}
                        <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 rounded-lg p-1">
                          <button
                            onClick={() => startEdit(query)}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-all duration-200 tooltip"
                            title="Edit Query"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Delete Action */}
                        <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-1">
                          <button
                            onClick={() => deleteQuery(query.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all duration-200 tooltip"
                            title="Delete Query"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Editing Query</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(query.id)}
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="Query name"
                        />
                        
                        <textarea
                          value={editForm.sql}
                          onChange={(e) => setEditForm({...editForm, sql: e.target.value})}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          rows={6}
                        />
                        
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="Description"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <>
                        {query.versions && query.versions.length > 1 && (
                          <div className="theme-version-badge p-3 rounded-xl border">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                v{query.currentVersion || 1}
                              </span>
                              <span className="theme-version-count px-2 py-1 rounded-full text-xs">
                                {query.versions.length} versions
                              </span>
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <CodeBracketIcon className="w-4 h-4 theme-icon-color" />
                            SQL Query
                          </h4>
                          <div className="database-code-block p-4 rounded-xl border">
                            <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-hidden">
                              <code className="language-sql">
                                {viewMode === 'grid' ? truncateText(query.sql, 3) : (isExpanded ? query.sql : truncateText(query.sql, 4))}
                              </code>
                            </pre>
                          </div>
                        </div>

                        {query.description && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                            <div className="theme-desc-bg p-3 rounded-xl border">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {viewMode === 'grid' ? truncateText(query.description, 2) : (isExpanded ? query.description : truncateText(query.description, 3))}
                              </p>
                            </div>
                          </div>
                        )}

                        {query.resultImage && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Result Screenshot</h4>
                            <div className="theme-result-bg p-3 rounded-xl border">
                              <div className="flex justify-center">
                                <img
                                  src={query.resultImage}
                                  alt="Query result"
                                  className={`object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                    viewMode === 'grid' ? 'w-full h-32 object-cover' : 'max-w-full h-auto max-h-64'
                                  }`}
                                  onClick={() => window.open(query.resultImage, '_blank')}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Fullscreen Query Modal */}
        {fullscreenQuery && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="theme-header-bg p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {fullscreenQuery.name || `Query #${fullscreenQuery.id}`}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{fullscreenQuery.timestamp}</p>
                  </div>
                  <button
                    onClick={closeFullscreen}
                    className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <CodeBracketIcon className="w-5 h-5 theme-icon-color" />
                    SQL Query
                  </h3>
                  <div className="database-code-block p-6 rounded-xl">
                    <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      <code className="language-sql">{fullscreenQuery.sql}</code>
                    </pre>
                  </div>
                </div>

                {fullscreenQuery.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Description</h3>
                    <div className="theme-desc-bg p-4 rounded-xl">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{fullscreenQuery.description}</p>
                    </div>
                  </div>
                )}

                {fullscreenQuery.result && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Sample Result</h3>
                    <div className="theme-result-bg p-4 rounded-xl">
                      <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{fullscreenQuery.result}</pre>
                    </div>
                  </div>
                )}

                {fullscreenQuery.resultImage && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Result Screenshot</h3>
                    <div className="theme-result-bg p-4 rounded-xl">
                      <img
                        src={fullscreenQuery.resultImage}
                        alt="Query result"
                        className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(fullscreenQuery.resultImage, '_blank')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal for Grid View */}
        {isEditModalOpen && editingQuery && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="theme-header-bg p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Edit Query</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(editingQuery)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Query Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-4 theme-focus-ring theme-border-focus transition-all duration-300"
                    placeholder="Enter query name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SQL Query</label>
                  <textarea
                    value={editForm.sql}
                    onChange={(e) => setEditForm({...editForm, sql: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-4 theme-focus-ring theme-border-focus transition-all duration-300"
                    rows={12}
                    placeholder="Enter your SQL query"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-4 theme-focus-ring theme-border-focus transition-all duration-300"
                    rows={4}
                    placeholder="Describe what this query does"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sample Result</label>
                  <textarea
                    value={editForm.result}
                    onChange={(e) => setEditForm({...editForm, result: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-4 theme-focus-ring theme-border-focus transition-all duration-300"
                    rows={6}
                    placeholder="Paste sample output or expected results"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
