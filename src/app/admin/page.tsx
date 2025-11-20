'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SwatchIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { storage } from '../../lib/storage';
import { Query, User } from '../../types';

type ColorTheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'purple' | 'rose' | 'amber' | 'teal' | 'indigo' | 'pink';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [queries, setQueries] = useState<Query[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queries' | 'users'>('queries');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [colorTheme, setColorTheme] = useState<ColorTheme>('ocean');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !(session.user as any)?.isAdmin) {
      router.push('/auth/signin');
      return;
    }

    // Sync theme state with DOM and localStorage
    const savedTheme = localStorage.getItem('theme');
    const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme;
    
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

    loadData();

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
    
    // Force DOM update
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

  const loadData = async () => {
    if (!session?.user) {
      console.error('No session found');
      return;
    }

    try {
      console.log('Loading admin data for user:', (session.user as any).email);
      
      // For admin users, try to load data with fallback
      let allQueries = [];
      let allUsers = [];
      
      try {
        allQueries = await storage.getAllQueries();
        console.log('Loaded queries:', allQueries.length);
      } catch (queryError) {
        console.warn('Failed to load queries from Supabase, using localStorage fallback');
        // Fallback to localStorage for development
        const saved = localStorage.getItem('sqlQueries');
        allQueries = saved ? JSON.parse(saved) : [];
      }
      
      try {
        allUsers = await storage.getUsers();
        console.log('Loaded users:', allUsers.length);
      } catch (userError) {
        console.warn('Failed to load users from Supabase, creating mock admin user');
        // Fallback for development
        allUsers = [{
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin User',
          isAdmin: true,
          createdAt: new Date().toISOString()
        }];
      }
      
      setQueries(allQueries);
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await storage.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setQueries(queries.filter(q => q.userId !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const toggleAdmin = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      const updatedUser = { ...user, isAdmin: !user.isAdmin };
      await storage.updateUser(updatedUser);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
    }
  };

  const deleteQuery = async (queryId: string) => {
    if (!confirm('Are you sure you want to delete this query?')) return;
    
    try {
      await storage.deleteQuery(queryId);
      setQueries(queries.filter(q => q.id.toString() !== queryId));
    } catch (error) {
      console.error('Failed to delete query:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  const themeColors = getThemeColors();

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <div className="max-w-7xl mx-auto py-6 px-4">
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
              <Link href="/public" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md font-medium transition-colors">
                Public Queries
              </Link>
              <span className={`px-4 py-2 text-white rounded-md font-medium ${themeColors.primary}`}>
                Admin
              </span>
            </div>
            
            <div className="flex items-center gap-2">
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
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                {isDarkMode ? (
                  <SunIcon className="w-5 h-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users and view all saved queries. <Link href="/" className="text-blue-600 hover:text-blue-800">Click here to create a new query</Link>.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Queries
            </h3>
            <p className="text-3xl font-bold text-green-600">{queries.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Users
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {users.filter(u => u.isAdmin).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-2 border-green-200 dark:border-green-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Quick Actions
            </h3>
            <Link 
              href="/" 
              className={`inline-block px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${themeColors.primary}`}
            >
              + Create Query
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('queries')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'queries'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Queries ({queries.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Users ({users.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'queries' && (
              <div className="space-y-4">
                {queries.map((query) => (
                  <div key={query.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {query.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {query.description}
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          User ID: {query.userId} | Created: {query.date}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        {query.isFavorite && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Favorite
                          </span>
                        )}
                        <button
                          onClick={() => deleteQuery(query.id.toString())}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 bg-gray-50 dark:bg-gray-900 rounded p-3">
                      <code className="text-sm text-gray-800 dark:text-gray-200">
                        {query.sql.substring(0, 200)}
                        {query.sql.length > 200 && '...'}
                      </code>
                    </div>
                  </div>
                ))}
                {queries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No queries found
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {user.name || 'Unnamed User'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                        <div className="mt-1 text-xs text-gray-500">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                          {user.lastLogin && ` | Last login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.isAdmin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {queries.filter(q => q.userId === user.id).length} queries
                        </span>
                        <button
                          onClick={() => toggleAdmin(user.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
