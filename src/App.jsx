import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PublicStore from './pages/PublicStore'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicStore />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
    </Router>
  )
}

export default App