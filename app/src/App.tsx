import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import ChatWidget from './components/ChatWidget'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <ChatWidget />
    </>
  )
}
