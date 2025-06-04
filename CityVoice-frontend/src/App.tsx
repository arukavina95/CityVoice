import React from 'react';
import { AppRoutes } from './AppRoutes';
import { Navbar } from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 p-4 md:px-8 md:py-6 bg-gray-100">
                <AppRoutes />
            </main>
            <Footer />
            <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontSize: '1rem' } }} />
        </div>
    );
};

export default App;
