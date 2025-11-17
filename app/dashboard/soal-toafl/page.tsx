'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Volume2, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  type: 'reading' | 'listening' | 'structure';
  difficulty: 'easy' | 'medium' | 'hard';
  options: string[];
  correctAnswer: number;
  audio?: string;
  createdAt: string;
}

// Sample data in Arabic
const sampleQuestions: Question[] = [
  {
    id: 1,
    question: 'ما الفكرة الرئيسية للمقال؟',
    type: 'reading',
    difficulty: 'medium',
    options: [
      'أهمية الحفاظ على البيئة',
      'تاريخ تغيّر المناخ',
      'التقنيات الحديثة في الزراعة',
      'التأثيرات الاقتصادية للاحتباس الحراري'
    ],
    correctAnswer: 0,
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    question: 'استمع إلى المحادثة ثم أجب: ماذا يقترح الأستاذ؟',
    type: 'listening',
    difficulty: 'hard',
    options: [
      'تسليم البحث مبكرًا',
      'مراجعة المقدمة',
      'إجراء المزيد من البحث',
      'تغيير الموضوع'
    ],
    correctAnswer: 1,
    audio: 'audio-file.mp3',
    createdAt: '2024-01-14'
  },
  {
    id: 3,
    question: 'اختر الصيغة النحوية الصحيحة: الطلاب ____ يدرسون للامتحان.',
    type: 'structure',
    difficulty: 'easy',
    options: [
      'is',
      'are',
      'was',
      'been'
    ],
    correctAnswer: 1,
    createdAt: '2024-01-13'
  },
];



export default function TOAFLPage() {
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
  
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'easy': return 'bg-green-100 text-green-700';
        case 'medium': return 'bg-yellow-100 text-yellow-700';
        case 'hard': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };
  
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'reading': return <BookOpen size={16} />;
        case 'listening': return <Volume2 size={16} />;
        case 'structure': return <Edit2 size={16} />;
        default: return null;
      }
    };
  
    const filteredQuestions = questions.filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || q.type === filterType;
      const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      return matchesSearch && matchesType && matchesDifficulty;
    });
  
    return (
      <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TOAFL Questions</h1>
            <p className="text-gray-600 mt-1">Manage and organize your TOAFL test questions</p>
          </div>
          <Link
            href="/dashboard/tambah-soal"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Add TOAFL Question
          </Link>
        </div>
  
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Questions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{questions.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Reading</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {questions.filter(q => q.type === 'reading').length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Listening</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {questions.filter(q => q.type === 'listening').length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Structure</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {questions.filter(q => q.type === 'structure').length}
            </p>
          </div>
        </div>
  
        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
  
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
              <option value="structure">Structure</option>
            </select>
  
            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
  
        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Question Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                        {getTypeIcon(question.type)}
                        {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                      </span>
                      {question.audio && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                          <Volume2 size={12} />
                          Audio
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
                        <Clock size={12} />
                        {question.createdAt}
                      </span>
                    </div>
  
                    {/* Question Text */}
                    <h3 className="text-base font-medium text-gray-900 mb-3">
                      {question.question}
                    </h3>
  
                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-2 p-3 rounded-lg border ${
                            index === question.correctAnswer
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <span className={` w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                            index === question.correctAnswer
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-300 text-gray-700'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-sm text-gray-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
  
        {/* Pagination */}
        {filteredQuestions.length > 0 && (
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredQuestions.length}</span> of <span className="font-medium">{questions.length}</span> questions
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
}
