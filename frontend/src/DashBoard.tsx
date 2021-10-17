import { LeaderBoard } from "./LeaderBoard";
import { Student } from "./types";
import "./DashBoard.css"

export interface Props {
  children: Student[]
}

export function DashBoard({ children }: Props) {
  return (
    <div className="DashBoard">
      <div className="DashBoardCell">
        <LeaderBoard children={children} />
      </div>
      <div>
        Another dashboard cell
      </div>
    </div>
  )
}