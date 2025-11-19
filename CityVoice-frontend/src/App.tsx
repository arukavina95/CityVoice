import React from 'react';
import { AppRoutes } from './AppRoutes';
import { Navbar } from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 py-10 px-4 sm:px-8">
                <AppRoutes />
            </main>
            <Footer />
            <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontSize: '1rem' } }} />
        </div>
    );
};

export default App;
