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
  for (var child of children) {
    childElements.push(<span>{pos}.</span>)
    childElements.push(<span><Avatar url={child.picture} /></span>)
    childElements.push(<span>{child.name}</span>)
    childElements.push(<Time seconds={child.total_seconds} />)
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
