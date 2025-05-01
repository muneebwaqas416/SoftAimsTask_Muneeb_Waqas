import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { CircleHelp } from "lucide-react";

function PasswordHelpHover() {
  return (
    <HoverCard>
      <HoverCardTrigger><CircleHelp className="inline ml-1 mb-0.5 blue-600 cursor-pointer w-4" /></HoverCardTrigger>
      <HoverCardContent className="font-normal text-md w-72">
        Password must satisfy the following:
        <ul className="list-disc list-inside mt-2">
          <li>Minimum length of 8 characters </li>
          <li>Contains at least 1 letter </li>
          <li>Contains at least 1 number </li>
          <li>Contains at least 1 special character.</li>
        </ul>
      </HoverCardContent>
    </HoverCard>
  )
}

export default PasswordHelpHover