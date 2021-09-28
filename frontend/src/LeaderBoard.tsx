import './LeaderBoard.css';
import { Child } from './types';

interface Props {
  showPractice: () => void,
  children: Child[]
}

export default function LeaderBoard({ showPractice, children }: Props) {
  var childElements = []
  var pos = 1
  for (var child of children) {
    childElements.push(<span>{pos}.</span>)
    childElements.push(<span><img width="50" src={child.picture} alt="blah"></img></span>)
    childElements.push(<span>{child.name}</span>)
    childElements.push(<span>{child.total_seconds}</span>)
    pos++
  }

  return (
    <div>
      <div className="LeaderBoard">
        {childElements}
      </div>
      <div>
        <button onClick={showPractice}>Practice</button>
      </div>
    </div>
  );
}
