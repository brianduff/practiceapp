import React from "react";
import './LeaderBoard.css';

function LeaderBoard({ showPractice, children }) {
  var childElements = []
  var pos = 1
  for (var child of children) {
    childElements.push(<span>{pos}.</span>)
    childElements.push(<span><img width="50" src={child.picture} alt="blah"></img></span>)
    childElements.push(<span>{child.name}</span>)
    childElements.push(<span>{child.minutes}</span>)
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

export default LeaderBoard;