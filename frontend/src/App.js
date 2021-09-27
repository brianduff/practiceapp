import { useState } from "react";
import LeaderBoard from "./LeaderBoard";
import Practice from './Practice';

const LEADERBOARD_PAGE = 1
const PRACTICE_PAGE = 2

function App() {
  const [page, setPage] = useState(LEADERBOARD_PAGE)

  const showPractice = () => {
    setPage(PRACTICE_PAGE)
  }

  if (page === PRACTICE_PAGE) {
    return <Practice />
  } else {
    return <LeaderBoard showPractice={showPractice} />
  }
}

export default App;
