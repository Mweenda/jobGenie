import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './components/LandingPage';
import { JobsPage } from './components/JobsPage';
import { Dashboard } from './components/Dashboard';

type Page = 'landing' | 'jobs' | 'dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'jobs':
        return <JobsPage />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Pills for Demo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="glass-floating rounded-full p-2 flex space-x-2">
          {[
            { key: 'landing', label: 'Landing' },
            { key: 'jobs', label: 'Jobs' },
            { key: 'dashboard', label: 'Dashboard' }
          ].map((page) => (
            <motion.button
              key={page.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(page.key as Page)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                currentPage === page.key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              {page.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}