'use client';

import { BookOpen, Edit, Trash2, Plus, Search, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function StructurePage() {
  // Dummy structure questions data
  const questions = [
    {
      id: 1,
      question: "The committee _____ the proposal after a lengthy discussion.",
      sentence: "The committee _____ the proposal after a lengthy discussion.",
      options: [
        "has approved",
        "have approved",
        "approving",
        "approval"
      ],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Subject-Verb Agreement",
      createdDate: "15 Nov 2024",
      usageCount: 142
    },
    {
      id: 2,
      question: "By the time we arrive, the concert _____.",
      sentence: "By the time we arrive, the concert _____.",
      options: [
        "will start",
        "starts",
        "will have started",
        "has started"
      ],
      correctAnswer: 2,
      difficulty: "medium",
      topic: "Future Perfect Tense",
      createdDate: "14 Nov 2024",
      usageCount: 178
    },
    {
      id: 3,
      question: "_____ the weather was terrible, they decided to go hiking.",
      sentence: "_____ the weather was terrible, they decided to go hiking.",
      options: [
        "Despite",
        "Although",
        "Because",
        "However"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      topic: "Conjunctions",
      createdDate: "13 Nov 2024",
      usageCount: 195
    },
    {
      id: 4,
      question: "The report, _____ by the senior analyst, contained several errors.",
      sentence: "The report, _____ by the senior analyst, contained several errors.",
      options: [
        "prepare",
        "preparing",
        "prepared",
        "to prepare"
      ],
      correctAnswer: 2,
      difficulty: "medium",
      topic: "Participles",
      createdDate: "12 Nov 2024",
      usageCount: 123
    },
    {
      id: 5,
      question: "Not only _____ the exam, but she also got the highest score.",
      sentence: "Not only _____ the exam, but she also got the highest score.",
      options: [
        "she passed",
        "did she pass",
        "she did pass",
        "passed she"
      ],
      correctAnswer: 1,
      difficulty: "hard",
      topic: "Inversion",
      createdDate: "10 Nov 2024",
      usageCount: 89
    }
  ];

  const stats = [
    { label: "Total Questions", value: "243", color: "bg-purple-500" },
    { label: "Easy", value: "98", color: "bg-green-500" },
    { label: "Medium", value: "87", color: "bg-yellow-500" },
    { label: "Hard", value: "58", color: "bg-red-500" }
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
          <h1 className="text-3xl font-bold text-gray-900">Structure Questions</h1>
          <p className="text-gray-600 mt-1">Kelola soal structure dan grammar</p>
        </div>
         <Link href="/dashboard/tambah-structure" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
              placeholder="Cari soal..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Semua Level</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Semua Topik</option>
            <option>Tenses</option>
            <option>Conjunctions</option>
            <option>Participles</option>
            <option>Subject-Verb Agreement</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
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
                  Sentence
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
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
                    <div className="max-w-md">
                      <p className="font-medium text-gray-900">{question.sentence}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">{question.topic}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5 max-w-xs">
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {index === question.correctAnswer && (
                            <CheckCircle size={14} className="text-green-600 mt-0.5" />
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
                      <button className="p-1.5 text-blue-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
            Menampilkan <span className="font-medium">1-5</span> dari <span className="font-medium">243</span> soal
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