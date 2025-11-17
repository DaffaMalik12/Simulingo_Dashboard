'use client';

import { Calendar, User, Eye, Tag, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function ArtikelPage() {
  // Dummy articles data
  const articles = [
    {
      id: 1,
      title: "10 Essential Grammar Rules Every English Learner Should Know",
      category: "Grammar Tips",
      coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop",
      excerpt: "Grammar is the foundation of effective communication...",
      author: "Sarah Johnson",
      date: "15 Nov 2024",
      views: 1245,
      status: "Published"
    },
    {
      id: 2,
      title: "Expand Your Vocabulary: 50 Advanced English Words",
      category: "Vocabulary",
      coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop",
      excerpt: "Building a rich vocabulary is crucial for mastering English...",
      author: "Michael Chen",
      date: "14 Nov 2024",
      views: 892,
      status: "Published"
    },
    {
      id: 3,
      title: "Speed Reading Techniques for Better Comprehension",
      category: "Reading Strategies",
      coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop",
      excerpt: "Reading faster doesn't mean sacrificing understanding...",
      author: "Emma Williams",
      date: "13 Nov 2024",
      views: 678,
      status: "Published"
    },
    {
      id: 4,
      title: "Improve Your English Listening Skills with Podcasts",
      category: "Listening Tips",
      coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=400&fit=crop",
      excerpt: "Podcasts are an excellent way to train your ear...",
      author: "David Lee",
      date: "12 Nov 2024",
      views: 1523,
      status: "Published"
    },
    {
      id: 5,
      title: "Common English Idioms and Their Meanings",
      category: "Vocabulary",
      coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
      excerpt: "Idioms add color to your English conversations...",
      author: "Jennifer Park",
      date: "10 Nov 2024",
      views: 956,
      status: "Draft"
    }
  ];

  const stats = [
    { label: "Total Artikel", value: "24", color: "bg-blue-500" },
    { label: "Published", value: "18", color: "bg-green-500" },
    { label: "Draft", value: "6", color: "bg-yellow-500" },
    { label: "Total Views", value: "15.2K", color: "bg-purple-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Artikel</h1>
          <p className="text-gray-600 mt-1">Kelola semua artikel pembelajaran</p>
        </div>
        <Link href="/dashboard/tambah-artikel" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Tambah Artikel
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
              placeholder="Cari artikel..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Semua Kategori</option>
            <option>Grammar Tips</option>
            <option>Vocabulary</option>
            <option>Reading Strategies</option>
            <option>Listening Tips</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Semua Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artikel
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 line-clamp-1">{article.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{article.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{article.author}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{article.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye size={16} />
                      <span>{article.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      article.status === 'Published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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
            Menampilkan <span className="font-medium">1-5</span> dari <span className="font-medium">24</span> artikel
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