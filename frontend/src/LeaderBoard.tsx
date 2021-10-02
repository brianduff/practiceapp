import './LeaderBoard.css';
import { Avatar } from './Avatar';
import { Child } from './types';
import { Time } from './Time';
import { button, ButtonBar } from './ButtonBar';

interface Props {
  showPractice: () => void,
  children: Child[]
}

export default function LeaderBoard({ showPractice, children }: Props) {
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
