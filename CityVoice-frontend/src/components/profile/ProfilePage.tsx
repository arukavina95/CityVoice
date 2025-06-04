import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div className="max-w-xl mx-auto mt-10 text-center text-lg">Niste prijavljeni.</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-900 rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Moj profil</h1>
      <div className="space-y-4">
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-300">Korisničko ime:</span>
          <span className="ml-2 text-gray-900 dark:text-gray-100">{currentUser.username}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span>
          <span className="ml-2 text-gray-900 dark:text-gray-100">{currentUser.email}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-300">Uloge:</span>
          <span className="ml-2 text-gray-900 dark:text-gray-100">{currentUser.roles.join(', ')}</span>
        </div>
  
      </div>
    </div>
  );
};

export default ProfilePage; 