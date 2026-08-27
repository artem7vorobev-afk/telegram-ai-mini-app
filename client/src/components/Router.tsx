import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from '../pages/Home'
import Chat from '../pages/Chat'
import ImageGen from '../pages/ImageGen'
import Audio from '../pages/Audio'
import Video from '../pages/Video'
import Music from '../pages/Music'
import Wallet from '../pages/Wallet'
import TopUp from '../pages/TopUp'
import Referrals from '../pages/Referrals'
import Profile from '../pages/Profile'

export default function Router() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/image" element={<ImageGen />} />
        <Route path="/audio" element={<Audio />} />
        <Route path="/video" element={<Video />} />
        <Route path="/music" element={<Music />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/topup" element={<TopUp />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  )
}
