# Shikaku Puzzle

A simple Shikaku puzzle game built using Node.js, Express, MongoDB, JavaScript and Socket.IO.

## Features

- Create a puzzle by selecting rows and columns
- Generate Shikaku puzzles
- Select rectangles by dragging on the board
- Validate selected rectangles
- Lock completed rectangles
- Save game progress in MongoDB
- Continue the puzzle after refreshing the page
- Timer for the current game
- Reset the current game
- Start a new game with a different size
- Show a congratulations message when the puzzle is completed
- Socket.IO support for game updates

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JavaScript
- HTML
- CSS
- EJS

## How to Run

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

### 3. Start the project

```bash
npm run dev
```

Open:

```text
http://localhost:5000
```

## Deployment Note

The project uses Socket.IO for real-time game communication.

I tested the project on Vercel and Render, but the current Socket.IO setup is not working correctly in the deployed environment. 

## How to Play

1. Select the number of rows and columns.
2. Start the game.
3. Drag across the cells to select a rectangle.
4. A rectangle is locked when the selection is valid.
5. Continue until all rectangles are completed.
6. The game is completed when the whole board is solved.

## Project Structure

```text
public/
  game.js
  index.js
  style.css

src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  socket/
  views/
  app.js
  server.js
```



## Author

Radha Parmar
