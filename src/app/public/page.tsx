'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon, SwatchIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Query } from '../../types';

type ColorTheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'purple' | 'rose' | 'amber' | 'teal' | 'indigo' | 'pink';
type ViewMode = 'grid' | 'list';

export default function PublicQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('ocean');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  useEffect(() => {
    const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme;
    const savedViewMode = localStorage.getItem('viewMode') as ViewMode;
    
    if (savedColorTheme) {
      setColorTheme(savedColorTheme);
    } else {
      setColorTheme('ocean');
      localStorage.setItem('colorTheme', 'ocean');
    }
    
    if (savedViewMode) {
      setViewMode(savedViewMode);
    } else {
      setViewMode('grid');
      localStorage.setItem('viewMode', 'grid');
    }
    
    loadPublicQueries();

    // Listen for theme changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'colorTheme') {
        setColorTheme(e.newValue as ColorTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const changeColorTheme = (theme: ColorTheme) => {
    setColorTheme(theme);
    localStorage.setItem('colorTheme', theme);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    localStorage.setItem('viewMode', newMode);
  };

  const getThemeColors = () => {
    const themes = {
      default: {
        primary: 'bg-blue-600 hover:bg-blue-700',
        accent: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        bg: 'bg-blue-50 dark:bg-gray-900',
        card: 'bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700'
      },
      ocean: {
        primary: 'bg-cyan-600 hover:bg-cyan-700',
        accent: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
        bg: 'bg-cyan-50 dark:bg-gray-900',
        card: 'bg-white dark:bg-gray-800 border-cyan-200 dark:border-gray-700'
      },
      forest: {
        primary: 'bg-emerald-600 hover:bg-emerald-700',
        accent: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
        bg: 'bg-emerald-50 dark:bg-gray-900',
        card: 'bg-white dark:bg-gray-800 border-emerald-200 dark:border-gray-700'
      },
      sunset: {
        primary: 'bg-orange-600 hover:bg-orange-700',
        accent: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
        bg: 'bg-orange-50 dark:bg-gray-900',
        card: 'bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700'
      },
      purple: {
        primary: 'bg-purple-600 hover:bg-purple-700',
        accent: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
        bg: 'bg-purple-50 dark:bg-gray-900',
        card: 'bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700'
      },
      rose: {
        primary: 'bg-rose-600 hover:bg-rose-700',
        accent: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200',
        bg: 'bg-rose-50 dark:bg-gray-900',
        card: 'bg-white dark:bg-gray-800 border-rose-200 dark:border-gray-700'
      },
      amber: {
        primary: 'bg-amber-600 hover:bg-amber-700',
        accent: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
        bg: 'bg-amber-50 dark:bg-gray-900',
        card: 'bg-white dark:bg-gray-800 border-amber-200 dark:border-gray-700'
      },
      teal: {
        primary: 'bg-teal-600 hover:bg-teal-700',
        accent: 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
        bg: 'bg-teal-50 dark:bg-gray-900',
        card: 'bg-white dark:bg-gray-800 border-teal-200 dark:border-gray-700'
      },
      indigo: {
        primary: 'bg-indigo-600 hover:bg-indigo-700',
        accent: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
        bg: 'bg-indigo-50 dark:bg-gray-900',
        card: 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-gray-700'
      },
      pink: {
        primary: 'bg-pink-600 hover:bg-pink-700',
        accent: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
        bg: 'bg-pink-50 dark:bg-gray-900',
        card: 'bg-white dark:bg-gray-800 border-pink-200 dark:border-gray-700'
      }
    };
    return themes[colorTheme];
  };

  const loadPublicQueries = async () => {
    try {
      const response = await fetch('/api/queries/public');
      if (response.ok) {
        const publicQueries = await response.json();
        setQueries(publicQueries);
      } else {
        console.error('Failed to load public queries:', response.status);
        setQueries([]);
      }
    } catch (error) {
      console.error('Failed to load public queries:', error);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.sql.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || query.date === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  const themeColors = getThemeColors();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeColors.bg}`}>
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading public queries...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${themeColors.bg}`}>
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <nav className="mb-6">
          <div className="flex justify-between items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 inline-flex gap-1 shadow-sm">
              <Link href="/" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md font-medium transition-colors">
                New Query
              </Link>
              <Link href="/saved" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md font-medium transition-colors">
                Saved Queries
              </Link>
              <span className={`px-4 py-2 text-white rounded-md font-medium ${themeColors.primary}`}>
                Public Queries
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <button
                onClick={toggleViewMode}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? (
                  <ListBulletIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Squares2X2Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Color Theme Selector */}
              <div className="relative group">
                <button className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <SwatchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[200px]">
                  <div className="grid grid-cols-5 gap-3">
                    {(['default', 'ocean', 'forest', 'sunset', 'purple', 'rose', 'amber', 'teal', 'indigo', 'pink'] as ColorTheme[]).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => changeColorTheme(theme)}
                        className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                          colorTheme === theme ? 'border-gray-800 dark:border-gray-200 ring-2 ring-offset-2 ring-gray-400' : 'border-gray-300 dark:border-gray-600'
                        } ${
                          theme === 'default' ? 'bg-blue-500' :
                          theme === 'ocean' ? 'bg-cyan-500' :
                          theme === 'forest' ? 'bg-emerald-500' :
                          theme === 'sunset' ? 'bg-orange-500' :
                          theme === 'purple' ? 'bg-purple-500' :
                          theme === 'rose' ? 'bg-rose-500' :
                          theme === 'amber' ? 'bg-amber-500' :
                          theme === 'teal' ? 'bg-teal-500' :
                          theme === 'indigo' ? 'bg-indigo-500' : 'bg-pink-500'
                        }`}
                        title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Public SQL Queries
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and explore queries shared by the community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            {/* Search Input */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-gray-900 dark:text-gray-100"
              />
            </div>
            
            {/* Date Filter */}
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-gray-900 dark:text-gray-100"
                title="Filter by date"
              />
            </div>
            
            {/* Clear Filters */}
            {(searchTerm || dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {filteredQueries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {(searchTerm || dateFilter) ? 'No queries match your filters.' : 'No public queries available yet.'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {filteredQueries.map((query) => (
              <div 
                key={query.id} 
                className={`${themeColors.card} rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex items-start gap-6' : ''
                }`}
                onClick={() => setSelectedQuery(query)}
              >
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {query.name}
                    </h3>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${themeColors.accent}`}>
                        Public
                      </span>
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {query.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: viewMode === 'list' ? 1 : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {query.description}
                    </p>
                  )}
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
                    <code className="text-sm text-gray-800 dark:text-gray-200 break-all font-mono">
                      {query.sql.length > (viewMode === 'list' ? 100 : 150) ? 
                        `${query.sql.substring(0, viewMode === 'list' ? 100 : 150)}...` : 
                        query.sql
                      }
                    </code>
                  </div>

                  {/* Result Image - Show directly in card */}
                  {query.resultImage && (
                    <div className="mb-4">
                      <img 
                        src={query.resultImage} 
                        alt="Query result" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}

                  {/* Text Result Preview */}
                  {query.result && !query.resultImage && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Sample Result:</h4>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <pre className="text-sm text-green-800 dark:text-green-200 font-mono whitespace-pre-wrap overflow-hidden">
                          {query.result.length > (viewMode === 'list' ? 150 : 200) ? 
                            `${query.result.substring(0, viewMode === 'list' ? 150 : 200)}...` : 
                            query.result
                          }
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {query.tags && query.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {query.tags.slice(0, viewMode === 'list' ? 2 : 3).map((tag, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${themeColors.accent}`}
                        >
                          {tag}
                        </span>
                      ))}
                      {query.tags.length > (viewMode === 'list' ? 2 : 3) && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{query.tags.length - (viewMode === 'list' ? 2 : 3)} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{query.date}</span>
                    {query.isFavorite && (
                      <span className="text-yellow-500">⭐</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Query Detail Modal */}
        {selectedQuery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedQuery.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${themeColors.accent}`}>
                      Public Query
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedQuery.date}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedQuery.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedQuery.description}</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SQL Query</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
                      {selectedQuery.sql}
                    </pre>
                  </div>
                </div>
                
                {selectedQuery.result && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sample Result</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
                        {selectedQuery.result}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedQuery.resultImage && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Result Image</h3>
                    <img 
                      src={selectedQuery.resultImage} 
                      alt="Query result" 
                      className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
                
                {selectedQuery.tags && selectedQuery.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuery.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${themeColors.accent}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
