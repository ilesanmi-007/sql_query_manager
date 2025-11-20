'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PhotoIcon, SunIcon, MoonIcon, XMarkIcon, StarIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { TagManager } from '../utils/tagManager';
import { storage } from '../lib/storage';
import { Query, Tag } from '../types';

type ColorTheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'purple' | 'rose' | 'amber' | 'teal' | 'indigo' | 'pink';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [sql, setSql] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [colorTheme, setColorTheme] = useState<ColorTheme>('ocean');
  
  // New state for enhanced features
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
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
    
    // Load available tags
    setAvailableTags(TagManager.getTags());

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
      if (e.key === 'colorTheme' && e.newValue) {
        setColorTheme(e.newValue as ColorTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [session, status, router]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    console.log('Toggling theme:', { current: isDarkMode, new: newTheme, willBe: newTheme ? 'dark' : 'light' });
    
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Force DOM update
    if (newTheme) {
      document.documentElement.classList.add('dark');
      console.log('Added dark class');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Removed dark class');
    }
  };

  const changeColorTheme = (theme: ColorTheme) => {
    setColorTheme(theme);
    localStorage.setItem('colorTheme', theme);
  };

  const getThemeColors = () => {
    const themes = {
      default: {
        primary: 'bg-blue-600 hover:bg-blue-700',
        accent: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        bg: 'bg-blue-50 dark:bg-gray-900',
        focus: 'focus:ring-blue-500 focus:border-blue-500'
      },
      ocean: {
        primary: 'bg-cyan-600 hover:bg-cyan-700',
        accent: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
        bg: 'bg-cyan-50 dark:bg-gray-900',
        focus: 'focus:ring-cyan-500 focus:border-cyan-500'
      },
      forest: {
        primary: 'bg-emerald-600 hover:bg-emerald-700',
        accent: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
        bg: 'bg-emerald-50 dark:bg-gray-900',
        focus: 'focus:ring-emerald-500 focus:border-emerald-500'
      },
      sunset: {
        primary: 'bg-orange-600 hover:bg-orange-700',
        accent: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
        bg: 'bg-orange-50 dark:bg-gray-900',
        focus: 'focus:ring-orange-500 focus:border-orange-500'
      },
      purple: {
        primary: 'bg-purple-600 hover:bg-purple-700',
        accent: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
        bg: 'bg-purple-50 dark:bg-gray-900',
        focus: 'focus:ring-purple-500 focus:border-purple-500'
      },
      rose: {
        primary: 'bg-rose-600 hover:bg-rose-700',
        accent: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200',
        bg: 'bg-rose-50 dark:bg-gray-900',
        focus: 'focus:ring-rose-500 focus:border-rose-500'
      },
      amber: {
        primary: 'bg-amber-600 hover:bg-amber-700',
        accent: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
        bg: 'bg-amber-50 dark:bg-gray-900',
        focus: 'focus:ring-amber-500 focus:border-amber-500'
      },
      teal: {
        primary: 'bg-teal-600 hover:bg-teal-700',
        accent: 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
        bg: 'bg-teal-50 dark:bg-gray-900',
        focus: 'focus:ring-teal-500 focus:border-teal-500'
      },
      indigo: {
        primary: 'bg-indigo-600 hover:bg-indigo-700',
        accent: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
        bg: 'bg-indigo-50 dark:bg-gray-900',
        focus: 'focus:ring-indigo-500 focus:border-indigo-500'
      },
      pink: {
        primary: 'bg-pink-600 hover:bg-pink-700',
        accent: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
        bg: 'bg-pink-50 dark:bg-gray-900',
        focus: 'focus:ring-pink-500 focus:border-pink-500'
      }
    };
    return themes[colorTheme];
  };

  const handleSqlChange = (value: string) => {
    setSql(value);
  };

  // Tag management
  const addTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const createNewTag = () => {
    if (newTagName.trim()) {
      try {
        const newTag = TagManager.createTag(newTagName.trim());
        setAvailableTags(TagManager.getTags());
        setSelectedTags([...selectedTags, newTag.id]);
        setNewTagName('');
        setShowNewTagInput(false);
      } catch {
        alert('Tag already exists or invalid name');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResultImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setResultImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    }
  };

  const removeImage = () => {
    setResultImage(null);
  };

  const saveQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    
    setIsSubmitting(true);
    
    const userId = (session.user as any).id;
    console.log('Session user:', session.user);
    console.log('User ID from session:', userId);
    
    if (!userId) {
      alert('User ID not found. Please log out and log back in.');
      setIsSubmitting(false);
      return;
    }
    
    const newQuery: Query = {
      id: Date.now(),
      name: name || `Query ${Date.now()}`,
      sql,
      description,
      result,
      resultImage: resultImage || undefined,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleString(),
      currentVersion: 1,
      tags: selectedTags,
      isFavorite,
      userId,
      visibility: visibility,
      versions: [{
        version: 1,
        name: name || `Query ${Date.now()}`,
        sql,
        description,
        result,
        resultImage: resultImage || undefined,
        editedAt: new Date().toLocaleString(),
        tags: selectedTags,
        isFavorite
      }]
    };
    
    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuery)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save query');
      }

      console.log('Query saved successfully');
      
      setName('');
      setSql('');
      setDescription('');
      setResult('');
      setResultImage(null);
      setSelectedTags([]);
      setIsFavorite(false);
      setVisibility('private');
    } catch (error) {
      console.error('Failed to save query:', error);
      alert(`Failed to save query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getThemeColors().bg}`}>
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  const themeColors = getThemeColors();

  return (
    <div className={`min-h-screen p-6 ${themeColors.bg}`}>
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6">
          <div className="flex justify-between items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 inline-flex gap-1 shadow-sm">
              <span className={`px-4 py-2 text-white rounded-md font-medium ${themeColors.primary}`}>
                New Query
              </span>
              <Link href="/saved" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md font-medium transition-colors">
                Saved Queries
              </Link>
              <Link href="/public" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md font-medium transition-colors">
                Public Queries
              </Link>
              {(session.user as any)?.isAdmin && (
                <Link href="/admin" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md font-medium transition-colors">
                  Admin
                </Link>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {session.user?.email}
              </span>
              
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
              <button
                onClick={() => signOut()}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            SQL Query Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and organize your SQL queries
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <form onSubmit={saveQuery} className="space-y-6">
            {/* Query Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Query Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 ${themeColors.focus} transition-colors text-gray-900 dark:text-gray-100`}
                placeholder="e.g., Get Active Users, Monthly Sales Report..."
              />
            </div>

            {/* SQL Query Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                SQL Query
              </label>
              
              <textarea
                value={sql}
                onChange={(e) => handleSqlChange(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 font-mono text-sm ${themeColors.focus} transition-colors resize-none text-gray-900 dark:text-gray-100`}
                placeholder="SELECT * FROM users WHERE active = 1;"
                rows={6}
                required
              />
            </div>

            {/* Tags, Favorite & Visibility */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Tags */}
              <div className="lg:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags
                </label>
                
                <div className="space-y-2">
                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map(tagId => {
                        const tag = availableTags.find(t => t.id === tagId);
                        return tag ? (
                          <span
                            key={tagId}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${themeColors.accent}`}
                          >
                            {tag.name}
                            <button
                              type="button"
                              onClick={() => removeTag(tagId)}
                              className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Available Tags */}
                  <div className="flex flex-wrap gap-1">
                    {availableTags
                      .filter(tag => !selectedTags.includes(tag.id))
                      .slice(0, 6)
                      .map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => addTag(tag.id)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}
                    
                    {/* New Tag Input */}
                    {showNewTagInput ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="Tag name"
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          onKeyPress={(e) => e.key === 'Enter' && createNewTag()}
                        />
                        <button
                          type="button"
                          onClick={createNewTag}
                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        >
                          <CheckCircleIcon className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {setShowNewTagInput(false); setNewTagName('');}}
                          className="p-1 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowNewTagInput(true)}
                        className="px-2 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        + New
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Favorite */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Favorite
                </label>
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                >
                  {isFavorite ? (
                    <StarIconSolid className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <StarIcon className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {isFavorite ? 'Favorited' : 'Add to favorites'}
                  </span>
                </button>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visibility
                </label>
                <button
                  type="button"
                  onClick={() => setVisibility(visibility === 'private' ? 'public' : 'private')}
                  className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                >
                  {visibility === 'public' ? (
                    <EyeIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {visibility === 'public' ? 'Public' : 'Private'}
                  </span>
                </button>
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 ${themeColors.focus} transition-colors resize-none text-gray-900 dark:text-gray-100`}
                placeholder="Describe what this query does..."
                rows={3}
              />
            </div>

            {/* Sample Result */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sample Result
              </label>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Text Result */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Text Output</label>
                  <textarea
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    onPaste={handlePaste}
                    className={`w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 font-mono text-sm focus:ring-4 ${themeColors.focus} transition-all duration-300 resize-none text-gray-900 dark:text-gray-100`}
                    placeholder="Paste sample output or expected results here..."
                    rows={6}
                  />
                </div>

                {/* Image Result */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Result Screenshot</label>
                  {!resultImage ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div 
                        className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all duration-300"
                        onPaste={handlePaste}
                        tabIndex={0}
                      >
                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                          <span className="font-medium">Click to upload or paste image</span><br />
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={resultImage}
                        alt="Query result"
                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed ${themeColors.primary} disabled:opacity-50`}
              >
                {isSubmitting ? 'Saving...' : 'Save Query'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
