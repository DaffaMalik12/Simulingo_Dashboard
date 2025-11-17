'use client';

import { FileText, Edit, Trash2, Plus, Search, CheckCircle, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ReadingPage() {
  // Dummy reading questions data
  const questions = [
    {
      id: 1,
      passage: "Climate change is one of the most pressing issues of our time. Rising global temperatures are causing ice caps to melt...",
      passageTitle: "Climate Change: A Global Challenge",
      passageLength: 450,
      question: "What is the main idea of the passage?",
      options: [
        "Ice caps are melting rapidly",
        "Climate change is a critical global issue",
        "Temperature is rising everywhere",
        "Scientists are studying weather patterns"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      questionType: "Main Idea",
      createdDate: "15 Nov 2024",
      usageCount: 187
    },
    {
      id: 2,
      passage: "The Industrial Revolution, which began in the late 18th century, transformed societies from agrarian economies...",
      passageTitle: "The Industrial Revolution Era",
      passageLength: 520,
      question: "According to the passage, when did the Industrial Revolution begin?",
      options: [
        "Early 18th century",
        "Late 18th century",
        "Early 19th century",
        "Late 19th century"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      questionType: "Detail",
      createdDate: "14 Nov 2024",
      usageCount: 203
    },
    {
      id: 3,
      passage: "Quantum computing represents a paradigm shift in computational technology. Unlike classical computers...",
      passageTitle: "Understanding Quantum Computing",
      passageLength: 680,
      question: "What can be inferred about quantum computers from the passage?",
      options: [
        "They are slower than classical computers",
        "They use the same principles as regular computers",
        "They operate differently from classical computers",
        "They are widely available to consumers"
      ],
      correctAnswer: 2,
      difficulty: "medium",
      questionType: "Inference",
      createdDate: "13 Nov 2024",
      usageCount: 156
    },
    {
      id: 4,
      passage: "The Renaissance was a cultural movement that profoundly affected European intellectual life...",
      passageTitle: "The Renaissance Period",
      passageLength: 590,
      question: "The word 'profoundly' in line 3 is closest in meaning to:",
      options: [
        "Slightly",
        "Deeply",
        "Briefly",
        "Rarely"
      ],
      correctAnswer: 1,
      difficulty: "medium",
      questionType: "Vocabulary",
      createdDate: "12 Nov 2024",
      usageCount: 178
    },
    {
      id: 5,
      passage: "Biodiversity loss poses significant challenges to ecosystem stability. The interconnected nature of species...",
      passageTitle: "Biodiversity and Ecosystem Balance",
      passageLength: 720,
      question: "What is the author's purpose in writing this passage?",
      options: [
        "To entertain readers with nature stories",
        "To explain the importance of biodiversity",
        "To criticize environmental policies",
        "To describe various animal species"
      ],
      correctAnswer: 1,
      difficulty: "hard",
      questionType: "Purpose",
      createdDate: "10 Nov 2024",
      usageCount: 134
    }
  ];

  const stats = [
    { label: "Total Questions", value: "318", color: "bg-emerald-500" },
    { label: "Easy", value: "124", color: "bg-green-500" },
    { label: "Medium", value: "132", color: "bg-yellow-500" },
    { label: "Hard", value: "62", color: "bg-red-500" }
  ];

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: "text-green-500",
      medium: "text-yellow-500",
      hard: "text-red-500",
    };
    return colors[difficulty] || colors.easy;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reading Questions</h1>
          <p className="text-gray-600 mt-1">Kelola soal reading comprehension</p>
        </div>
        <Link href="/dashboard/tambah-reading" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Tambah Soal
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg opacity-10`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari soal atau passage..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Semua Level</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Semua Tipe</option>
            <option>Main Idea</option>
            <option>Detail</option>
            <option>Inference</option>
            <option>Vocabulary</option>
            <option>Purpose</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Urutkan</option>
            <option>Terbaru</option>
            <option>Terlama</option>
            <option>Paling Banyak Digunakan</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Passage & Question
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Options
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-md space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-600 " />
                        <p className="font-semibold text-sm text-gray-900">{question.passageTitle}</p>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 italic">{question.passage}</p>
                      <p className="text-xs text-blue-600 font-medium">{question.passageLength} words</p>
                      <p className="font-medium text-sm text-gray-900 mt-2">{question.question}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500 text-sky-100">
                      {question.questionType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5 max-w-xs">
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {index === question.correctAnswer && (
                            <CheckCircle size={14} className="text-green-600 mt-0.5 " />
                          )}
                          <span className={`text-xs ${index === question.correctAnswer ? 'text-green-700 font-medium' : 'text-gray-600'} line-clamp-1`}>
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{question.usageCount}x</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{question.createdDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-medium">1-5</span> dari <span className="font-medium">318</span> soal
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              3
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}