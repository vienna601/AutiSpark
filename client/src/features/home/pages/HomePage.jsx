import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Edit3, 
  MessageCircle, 
  User, 
  Settings,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      title: 'Reading Practice',
      description: 'Interactive reading exercises with AI feedback',
      icon: BookOpen,
      path: '/reading',
      color: 'blue',
      available: false
    },
    {
      title: 'Writing Practice',
      description: 'Creative writing with personalized guidance',
      icon: Edit3,
      path: '/writing',
      color: 'purple',
      available: true
    },
    {
      title: 'AI Tutor Chat',
      description: 'One-on-one conversation with AI teacher',
      icon: MessageCircle,
      path: '/chat',
      color: 'green',
      available: false
    }
  ];

  const stats = [
    { label: 'Sessions Completed', value: '12', icon: TrendingUp },
    { label: 'Words Written', value: '485', icon: Edit3 },
    { label: 'Achievement Stars', value: '8', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AutiSpark</h1>
                <p className="text-gray-600 text-sm">AI Learning Companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600">
                <Settings size={20} />
              </button>
              <button className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Welcome back! Ready to learn today?
          </h2>
          <p className="text-gray-600 text-lg">
            Choose an activity below to continue your learning journey
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="text-blue-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
              purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
              green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            };

            const borderClasses = {
              blue: 'border-blue-200',
              purple: 'border-purple-200',
              green: 'border-green-200'
            };

            if (!feature.available) {
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-60">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">{feature.title}</h3>
                    <p className="text-gray-400 mb-4">{feature.description}</p>
                    <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">
                      Coming Soon
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={index}
                to={feature.path}
                className="bg-white rounded-xl shadow-sm border-2 hover:shadow-lg transition-all duration-200 group"
                style={{ borderColor: feature.color === 'purple' ? '#e879f9' : '#d1d5db' }}
              >
                <div className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[feature.color]} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className={`bg-gradient-to-r ${colorClasses[feature.color]} text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:shadow-md transition-shadow duration-200`}>
                    Start Learning
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" size={24} />
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
              <Edit3 className="text-purple-600" size={20} />
              <div className="flex-1">
                <div className="font-medium text-gray-800">Completed writing exercise</div>
                <div className="text-gray-600 text-sm">2 hours ago</div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="text-yellow-500 fill-current" size={16} />
                <span className="text-sm font-medium">8/10</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg opacity-60">
              <BookOpen className="text-blue-600" size={20} />
              <div className="flex-1">
                <div className="font-medium text-gray-800">Reading practice session</div>
                <div className="text-gray-600 text-sm">Coming soon</div>
              </div>
              <div className="text-sm text-gray-500">--</div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg opacity-60">
              <MessageCircle className="text-green-600" size={20} />
              <div className="flex-1">
                <div className="font-medium text-gray-800">AI tutor conversation</div>
                <div className="text-gray-600 text-sm">Coming soon</div>
              </div>
              <div className="text-sm text-gray-500">--</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>AutiSpark - Personalized learning for every child</p>
        </div>
      </div>
    </div>
  );
}
