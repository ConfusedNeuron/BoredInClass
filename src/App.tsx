import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { ChopsticksPage } from './games/chopsticks/ChopsticksPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="border-b border-gray-800 px-4 py-3 flex items-center max-w-2xl mx-auto w-full">
        <Link to="/" className="text-white font-bold text-lg hover:text-indigo-300 transition-colors">
          BoredInClass
        </Link>
      </header>
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chopsticks" element={<ChopsticksPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
