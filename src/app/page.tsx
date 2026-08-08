'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, CodeBracketIcon, DocumentTextIcon, TableCellsIcon, TagIcon, PhotoIcon, SunIcon, MoonIcon, SwatchIcon } from '@heroicons/react/24/outline';

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
  name: string;
  sql: string;
  description: string;
  result: string;
  resultImage?: string;
  date: string;
  timestamp: string;
  lastEdited?: string;
  versions?: QueryVersion[];
  currentVersion: number;
}

export default function Home() {
  const [name, setName] = useState('');
  const [sql, setSql] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colorTheme, setColorTheme] = useState<'default' | 'ocean' | 'forest' | 'sunset' | 'database'>('database');

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

  const removeImage = () => {
    setResultImage(null);
  };

  const saveQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
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
      versions: [{
        version: 1,
        name: name || `Query ${Date.now()}`,
        sql,
        description,
        result,
        resultImage: resultImage || undefined,
        editedAt: new Date().toLocaleString()
      }]
    };
    
    const saved = localStorage.getItem('sqlQueries');
    const queries = saved ? JSON.parse(saved) : [];
    const updated = [newQuery, ...queries];
    localStorage.setItem('sqlQueries', JSON.stringify(updated));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setName('');
    setSql('');
    setDescription('');
    setResult('');
    setResultImage(null);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <div className="glass-card rounded-2xl p-2 inline-flex gap-2">
              <span className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg">
                New Query
              </span>
              <Link href="/saved" className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl font-medium transition-all duration-200">
                Saved Queries
              </Link>
            </div>
            <button
              onClick={toggleTheme}
              className="glass-card p-3 rounded-xl hover:shadow-lg transition-all duration-200"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </nav>

        <div className="text-center mb-12 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-xl">
            <CodeBracketIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            SQL Query Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create, organize, and manage your SQL queries with style and efficiency
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <form onSubmit={saveQuery} className="space-y-8">
            {/* Query Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-lg font-semibold text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <TagIcon className="w-5 h-5 text-white" />
                </div>
                Query Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                placeholder="e.g., Get Active Users, Monthly Sales Report..."
              />
            </div>

            {/* SQL Query Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-lg font-semibold text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <CodeBracketIcon className="w-5 h-5 text-white" />
                </div>
                SQL Query
              </label>
              <div className="relative">
                <textarea
                  value={sql}
                  onChange={(e) => setSql(e.target.value)}
                  className="w-full p-6 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-white font-mono text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none"
                  placeholder="SELECT * FROM users WHERE active = 1;"
                  rows={8}
                  required
                />
                <div className="absolute top-4 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded-lg">
                  SQL
                </div>
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-lg font-semibold text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 resize-none"
                placeholder="Describe what this query does, its purpose, and any important notes..."
                rows={4}
              />
            </div>

            {/* Sample Result */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-lg font-semibold text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <TableCellsIcon className="w-5 h-5 text-white" />
                </div>
                Sample Result
              </label>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Text Result */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Text Output</label>
                  <textarea
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white font-mono text-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 resize-none"
                    placeholder="Paste sample output or expected results here..."
                    rows={6}
                  />
                </div>

                {/* Image Result */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Result Screenshot</label>
                  {!resultImage ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-300">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 text-center">
                          <span className="font-medium">Click to upload</span><br />
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={resultImage}
                        alt="Query result"
                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
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
                className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center gap-3">
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <PlusIcon className="w-5 h-5" />
                  )}
                  {isSubmitting ? 'Saving Query...' : 'Save Query'}
                </div>
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-12 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <p className="text-gray-500">
            Built with ❤️ for developers who love organized SQL queries -- Ilesanmi 
          </p>
        </div>
      </div>
    </div>
  );
}
