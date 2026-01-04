import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import DeckCardsPage from './pages/admin/DeckCardsPage'
import UserProgressPage from './pages/admin/UserProgressPage'
import UserDeckCardsPage from './pages/admin/UserDeckCardsPage'
import DeckAnalyticsPage from './pages/admin/DeckAnalyticsPage'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentDeckDetailPage from './pages/student/StudentDeckDetailPage'
import GamePage from './pages/student/GamePage'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import './i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
              
                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/decks/:deckId/cards"
                  element={
                    <ProtectedRoute requireAdmin>
                      <DeckCardsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/decks/:deckId"
                  element={
                    <ProtectedRoute requireAdmin>
                      <DeckAnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/:userId"
                  element={
                    <ProtectedRoute requireAdmin>
                      <UserProgressPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/:userId/decks/:deckId/cards"
                  element={
                    <ProtectedRoute requireAdmin>
                      <UserDeckCardsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/decks/:deckId/users/:userId/cards"
                  element={
                    <ProtectedRoute requireAdmin>
                      <UserDeckCardsPage />
                    </ProtectedRoute>
                  }
                />
              
                {/* Student routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/decks/:deckId"
                  element={
                    <ProtectedRoute>
                      <StudentDeckDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/game/:sessionId"
                  element={
                    <ProtectedRoute>
                      <GamePage />
                    </ProtectedRoute>
                  }
                />
              
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
              <Footer />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

