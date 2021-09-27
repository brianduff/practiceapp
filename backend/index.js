const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

app.get("/api/test", async (req, res) => {
  res.json({
    "hello": "world"
  })
})

app.get("/api/children", async (req, res) => {
  res.json([
    {
      "name": "Michael",
      "minutes": 200,
      "picture": "https://storage.googleapis.com/discobubble-quiz/IMG_2071.jpg",
      "loggedIn": true
    },
    {
      "name": "Caitlin",
      "minutes": 175,
      "picture": "https://storage.googleapis.com/discobubble-quiz/IMG_3196.jpg",
      "loggedIn": true
    },
    {
      "name": "Dan",
      "minutes": 168,
      "picture": "https://storage.googleapis.com/discobubble-quiz/country_detail_pokemon.png"

    }
  ])
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)
})

