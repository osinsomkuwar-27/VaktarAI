import { askAvatar } from "./api"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { NavBar } from "@workspace/ui/components/ui/tubelight-navbar"
import HomePage from "@workspace/ui/components/ui/HomePage"
import AvatarPage from "./AvatarPage"
import ChatSection from "@workspace/ui/components/ui/ChatSection"
import Gallery from "@workspace/ui/components/ui/Gallery"
import SignUp from "@workspace/ui/components/ui/SignUp" 

export default function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/avatar" element={<AvatarPage/>}></Route>
        <Route path="/chat" element={<ChatSection askAvatar={askAvatar} />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<SignUp />} />
      </Routes>
    </Router>
  )
}
