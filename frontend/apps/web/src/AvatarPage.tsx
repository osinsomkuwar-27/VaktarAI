import AvatarGenerator from "@workspace/ui/components/ui/AvatarGenerator"
import { generateAvatar} from "./api"

export default function AvatarPage() {
  return (
    <div className="min-h-screen bg-[#061E29] text-[#F3F4F4]">
      <AvatarGenerator generateAvatar={generateAvatar} />
    </div>
  )
}

// If you render ChatSection elsewhere (e.g. a chat route), pass askAvatar the same way:
// import VaktarChat from "@workspace/ui/components/ui/ChatSection"
// <VaktarChat askAvatar={askAvatar} />