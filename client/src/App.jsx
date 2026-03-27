import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from './components/Toast'
import ThreeBackground from './components/ThreeBackground'
import Navbar    from './components/Navbar'
import Footer    from './components/Footer'
import HomePage  from './pages/HomePage'
import ClipPage  from './pages/ClipPage'
import DocsPage  from './pages/DocsPage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ThreeBackground  />
          <Navbar />
          <Routes>
            <Route path="/"      element={<HomePage />} />
            <Route path="/clip"  element={<ClipPage  />} />
            <Route path="/docs"  element={<DocsPage  />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}