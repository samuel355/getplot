import { Toaster } from 'react-hot-toast';
import Sidebar from './components/sidebar';
import Header from './components/header';

export default function PropertiesLayout({ children }) {
  return (

      <div className="min-h-screen bg-background flex w-full">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </div>

  );
}