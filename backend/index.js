const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

var children = [
  {
    "name": "Michael",
    "total_seconds": 0,
    "picture": "https://storage.googleapis.com/discobubble-quiz/IMG_2071.jpg",
    "loggedIn": true
  },
  {
    "name": "Caitlin",
    "total_seconds": 0,
    "picture": "https://storage.googleapis.com/discobubble-quiz/IMG_3196.jpg",
    "loggedIn": true
  },
  {
    "name": "Dan",
    "total_seconds": 0,
    "picture": "https://storage.googleapis.com/discobubble-quiz/country_detail_pokemon.png"

  }
]

// from the frontend: { elapsed_seconds: 60 }

app.post("/api/children/:childId/session", (req, res) => {
  children[req.params.childId].total_seconds += req.body.elapsed_seconds
  res.json(req.body)
})

app.get("/api/children", (req, res) => {
  // Sort the children by their practice time, descending.
  children.sort((a, b) => b.total_seconds - a.total_seconds)

  res.json(children)
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)
})

