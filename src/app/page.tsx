'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PhotoIcon, SunIcon, MoonIcon, XMarkIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { TagManager, Tag } from '../utils/tagManager';

interface QueryVersion {
  version: number;
  name: string;
  sql: string;
  description: string;
  result: string;
  resultImage?: string;
  editedAt: string;
  editedBy?: string;
  tags?: string[];
  isFavorite?: boolean;
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
  tags?: string[];
  isFavorite: boolean;
}

export default function Home() {
  const [name, setName] = useState('');
  const [sql, setSql] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // New state for enhanced features
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Load available tags
    setAvailableTags(TagManager.getTags());
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
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
      } catch (error) {
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
      tags: selectedTags,
      isFavorite,
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
    setSelectedTags([]);
    setIsFavorite(false);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen p-6 bg-green-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6">
          <div className="flex justify-between items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 inline-flex gap-1 shadow-sm">
              <span className="px-4 py-2 bg-green-600 text-white rounded-md font-medium">
                New Query
              </span>
              <Link href="/saved" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md font-medium transition-colors">
                Saved Queries
              </Link>
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
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none text-gray-900 dark:text-gray-100"
                placeholder="SELECT * FROM users WHERE active = 1;"
                rows={6}
                required
              />
            </div>

            {/* Tags & Favorite */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none text-gray-900 dark:text-gray-100"
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
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 font-mono text-sm focus:ring-4 theme-focus-ring theme-border-focus transition-all duration-300 resize-none text-gray-900 dark:text-gray-100"
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
                      <div className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all duration-300">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-center">
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
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
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
