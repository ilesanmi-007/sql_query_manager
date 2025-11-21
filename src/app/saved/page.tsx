'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  Squares2X2Icon,
  ListBulletIcon,
  SwatchIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Query } from '../../types';
import { storage } from '../../lib/storage';
import VisibilityToggle from '../../components/VisibilityToggle';

type ColorTheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'purple' | 'rose' | 'amber' | 'teal' | 'indigo' | 'pink';
type ViewMode = 'grid' | 'list';

export default function SavedQueries() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [queries, setQueries] = useState<Query[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [colorTheme, setColorTheme] = useState<ColorTheme>('ocean');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Sync theme state with DOM and localStorage
    const savedTheme = localStorage.getItem('theme');
    const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme;
    const savedViewMode = localStorage.getItem('viewMode') as ViewMode;
    
    // Fix: Properly handle light mode
    const isDark = savedTheme === 'dark' || (savedTheme === null);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Set default theme if none exists
    if (savedTheme === null) {
      localStorage.setItem('theme', 'dark');
    }
    
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
    
    loadUserQueries();

    // Listen for theme changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const newIsDark = e.newValue === 'dark';
        setIsDarkMode(newIsDark);
        if (newIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      if (e.key === 'colorTheme') {
        setColorTheme(e.newValue as ColorTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [session, status, router]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
      default: { primary: 'bg-blue-600 hover:bg-blue-700', bg: 'bg-blue-50 dark:bg-gray-900' },
      ocean: { primary: 'bg-cyan-600 hover:bg-cyan-700', bg: 'bg-cyan-50 dark:bg-gray-900' },
      forest: { primary: 'bg-emerald-600 hover:bg-emerald-700', bg: 'bg-emerald-50 dark:bg-gray-900' },
      sunset: { primary: 'bg-orange-600 hover:bg-orange-700', bg: 'bg-orange-50 dark:bg-gray-900' },
      purple: { primary: 'bg-purple-600 hover:bg-purple-700', bg: 'bg-purple-50 dark:bg-gray-900' },
      rose: { primary: 'bg-rose-600 hover:bg-rose-700', bg: 'bg-rose-50 dark:bg-gray-900' },
      amber: { primary: 'bg-amber-600 hover:bg-amber-700', bg: 'bg-amber-50 dark:bg-gray-900' },
      teal: { primary: 'bg-teal-600 hover:bg-teal-700', bg: 'bg-teal-50 dark:bg-gray-900' },
      indigo: { primary: 'bg-indigo-600 hover:bg-indigo-700', bg: 'bg-indigo-50 dark:bg-gray-900' },
      pink: { primary: 'bg-pink-600 hover:bg-pink-700', bg: 'bg-pink-50 dark:bg-gray-900' }
    };
    return themes[colorTheme];
  };

  const loadUserQueries = async () => {
    if (!session?.user) return;
    
    try {
      const userQueries = await storage.listUserQueries((session.user as any).id);
      setQueries(userQueries);
    } catch (error) {
      console.error('Failed to load queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuery = async (queryId: number) => {
    if (!confirm('Are you sure you want to delete this query?')) return;
    
    try {
      await storage.deleteQuery(queryId, (session?.user as any)?.id);
      setQueries(queries.filter(q => q.id !== queryId));
    } catch (error) {
      console.error('Failed to delete query:', error);
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
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading saved queries...</div>
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
              <span className={`px-4 py-2 text-white rounded-md font-medium ${themeColors.primary}`}>
                Saved Queries
              </span>
              <Link href="/public" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md font-medium transition-colors">
                Public Queries
              </Link>
              {(session?.user as any)?.isAdmin && (
                <Link href="/admin" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md font-medium transition-colors">
                  Admin
                </Link>
              )}
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
                    {(['default', 'ocean', 'forest', 'sunset', 'purple', 'rose', 'amber', 'teal', 'indigo', 'pink'] as const).map((theme) => (
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
            Saved Queries
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {queries.length} queries in your collection
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
              {(searchTerm || dateFilter) ? 'No queries match your filters.' : 'No saved queries yet.'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {filteredQueries.map((query) => (
              <div key={query.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'flex items-start gap-6' : ''
              }`}>
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {query.name}
                    </h3>
                    <div className="flex items-center gap-2 ml-2">
                      {query.isFavorite && (
                        <span className="text-yellow-500">⭐</span>
                      )}
                      <VisibilityToggle 
                        query={query}
                        currentUserId={(session?.user as any)?.id}
                        onVisibilityChange={(queryId, newVisibility) => {
                          setQueries(queries.map(q => 
                            q.id === queryId ? {...q, visibility: newVisibility} : q
                          ));
                        }}
                      />
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

                  {/* Result Display */}
                  {query.result && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">Result:</h4>
                      <div className="bg-white dark:bg-gray-800 rounded p-3 max-h-48 overflow-y-auto">
                        <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                          {query.result}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Result Image */}
                  {query.resultImage && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Screenshot:</h4>
                      <img
                        src={query.resultImage}
                        alt="Query result"
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(query.resultImage, '_blank')}
                      />
                    </div>
                  )}
                  
                  {query.tags && query.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {query.tags.slice(0, viewMode === 'list' ? 2 : 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
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
                    <button
                      onClick={() => deleteQuery(query.id)}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
