import { useState, useEffect } from "react";
import LeaderBoard from "./LeaderBoard";
import Practice from './Practice';
import axios from 'axios';
import './App.css';

const LEADERBOARD_PAGE = 1
const PRACTICE_PAGE = 2

function App() {
  const [page, setPage] = useState(LEADERBOARD_PAGE)
  const [children, setChildren] = useState([])

  useEffect(() => {
    axios("http://localhost:4000/api/children").then(res => setChildren(res.data))
  }, [])

  const showPractice = () => {
    setPage(PRACTICE_PAGE)
  }

  var pageElement;
  if (page === PRACTICE_PAGE) {
    pageElement = <Practice children={children} />
  } else {
    pageElement = <LeaderBoard children={children} showPractice={showPractice} />
  }

  return <div className="container">{pageElement}</div>
}

export default App;
