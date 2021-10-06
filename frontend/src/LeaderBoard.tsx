import './LeaderBoard.css';
import { Avatar } from './Avatar';
import { Student } from './types';
import { Time } from './Time';
import { button, ButtonBar } from './ButtonBar';
import { useHistory } from 'react-router-dom';

interface Props {
  children: Student[]
}

export default function LeaderBoard({ children }: Props) {
  const history = useHistory()

  var childElements = []
  var pos = 1
  var sortedChildren = [...children]
  sortedChildren.sort((a, b) => b.session_stats.seconds_week - a.session_stats.seconds_week)
  for (var child of sortedChildren) {
    childElements.push(<span>{pos}.</span>)
    childElements.push(<span><Avatar url={child.picture} /></span>)
    childElements.push(<span>{child.name}</span>)
    childElements.push(<Time seconds={child.session_stats.seconds_week} />)
    pos++
  }

  const showPractice = () => history.push("/practice")

  return (
    <div>
      <h1>Practice Leaderboard</h1>
      <div className="LeaderBoard">
        {childElements}
      </div>
      <ButtonBar buttons={[button("Start Practice", showPractice)]} />
    </div>
  );
}
