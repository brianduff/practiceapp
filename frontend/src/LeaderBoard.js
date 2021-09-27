import React from "react";
import './LeaderBoard.css';

const children = [
  {
    "name": "Michael",
    "minutes": 200,
    "picture": "https://storage.googleapis.com/discobubble-quiz/IMG_2071.jpg"
  },
  {
    "name": "Caitlin",
    "minutes": 175,
    "picture": "https://storage.googleapis.com/discobubble-quiz/IMG_3196.jpg"
  },
  {
    "name": "Dan",
    "minutes": 168,
    "picture": "https://storage.googleapis.com/discobubble-quiz/country_detail_pokemon.png"

  }
]

// https://storage.googleapis.com/discobubble-quiz/IMG_2071.jpg
// https://storage.googleapis.com/discobubble-quiz/IMG_3196.jpg


function LeaderBoard() {
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
    <div className="LeaderBoard">
      {childElements}
    </div>
  );
}

export default LeaderBoard;