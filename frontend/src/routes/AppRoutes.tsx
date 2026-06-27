import { Routes, Route } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'

import Home from '@/pages/Home/Home'
import AuthPage from '@/pages/Auth/AuthPage'
import LeaderboardsInfo from '@/pages/Public/LeaderboardsInfo'
import CommunityInfo from '@/pages/Public/CommunityInfo'
import Testimonials from '@/pages/Public/Testimonials'
import Pricing from '@/pages/Public/Pricing'
import Dashboard from '@/pages/Dashboard/Dashboard'
import Targets from '@/pages/Targets/Targets'
import CreateTarget from '@/pages/Targets/CreateTarget'
import EditTarget from '@/pages/Targets/EditTarget'
import History from '@/pages/History/History'
import Profile from '@/pages/Profile/Profile'
import Calendar from '@/pages/Calendar/Calendar'
import Assistant from '@/pages/Assistant/Assistant'
import Leaderboard from '@/pages/Leaderboard/Leaderboard'
import Squads from '@/pages/Squads/Squads'
import Shop from '@/pages/Shop/Shop'
import Analytics from '@/pages/Analytics/Analytics'
import Settings from '@/pages/Settings/Settings'
import Planner from '@/pages/Planner/Planner'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/leaderboards" element={<LeaderboardsInfo />} />
        <Route path="/community" element={<CommunityInfo />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/pricing" element={<Pricing />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/targets" element={<Targets />} />
          <Route path="/targets/new" element={<CreateTarget />} />
          <Route path="/targets/:id/edit" element={<EditTarget />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/history" element={<History />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/squads" element={<Squads />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}
