import React from 'react';
import { Link } from 'react-router-dom';

export default function ActivityCard({ 
  title, 
  description, 
  icon: IconComponent, 
  path, 
  color = 'blue',
  available = true,
  stats = null 
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
  };

  if (!available) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-60">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconComponent className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">{title}</h3>
          <p className="text-gray-400 mb-4">{description}</p>
          <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">
            Coming Soon
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={path}
      className="bg-white rounded-xl shadow-sm border-2 hover:shadow-lg transition-all duration-200 group border-gray-200 hover:border-purple-200"
    >
      <div className="p-6 text-center">
        <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[color]} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <IconComponent className="text-white" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        {stats && (
          <div className="mb-4 text-sm text-gray-600">
            {stats}
          </div>
        )}
        
        <div className={`bg-gradient-to-r ${colorClasses[color]} text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:shadow-md transition-shadow duration-200`}>
          Start Learning
        </div>
      </div>
    </Link>
  );
}
