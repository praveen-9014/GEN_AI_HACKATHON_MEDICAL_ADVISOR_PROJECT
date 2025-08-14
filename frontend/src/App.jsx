import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Advisor from './pages/Advisor'
import Profile from './pages/Profile'
import ProtectedRoute from './ProtectedRoute'

const AppShell = () => {
    return (
        <>
            <nav className="bg-gradient-to-r from-teal-600 to-blue-700 text-white">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="font-semibold hover:text-teal-100 transition">Home</Link>
                        <Link to="/advisor" className="hover:text-teal-100 transition">Advisor</Link>
                        {/* Removed explicit Profile text link per requirement */}
                    </div>
                    <Link to="/profile" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center ring-1 ring-white/30">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M12 2a5 5 0 100 10 5 5 0 000-10zm-9 18a9 9 0 1118 0v1H3v-1z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
            </nav>
            <Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
				<Route path="/advisor" element={<ProtectedRoute><Advisor /></ProtectedRoute>} />
				<Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
        </>
	)
}

const App = () => (
    <BrowserRouter>
        <AppShell />
    </BrowserRouter>
)

export default App