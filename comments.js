// Create web server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors');

const mongoose = require('mongoose');
const Comment = require('./models/comment');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comments';
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Define Comment schema    
const commentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});

// Create Comment model
const Comment = mongoose.model('Comment', commentSchema);
// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
// Middleware to handle CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Middleware to handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// Middleware to handle 404 errors
app.use((req, res, next) => {
  res.status(404).send('Sorry, that route does not exist.');
});
// Middleware to handle OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.sendStatus(200);
});
// Route to get all comments

app.get('/comments', (req, res) => {
    Comment.find()
        .then((comments) => {
        res.json(comments);
        })
        .catch((err) => {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Internal server error' });
        });
    });

// Route to create a new comment
app.post('/comments', (req, res) => {
  const { name, email, comment } = req.body;
  const newComment = new Comment({ name, email, comment });
  newComment.save()
    .then((comment) => {
      res.status(201).json(comment);
    })
    .catch((err) => {
      console.error('Error saving comment:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
});
// Route to update a comment

app.put('/comments/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, comment } = req.body;
    Comment.findByIdAndUpdate(id, { name, email, comment }, { new: true })                  
        .then((updatedComment) => {
            if (!updatedComment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
            res.json(updatedComment);
        })
        .catch((err) => {
            console.error('Error updating comment:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
}
);
// Route to delete a comment
app.delete('/comments/:id', (req, res) => {
  const { id } = req.params;
  Comment.findByIdAndDelete(id)
    .then((deletedComment) => {
      if (!deletedComment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      res.json({ message: 'Comment deleted successfully' });
    })
    .catch((err) => {
      console.error('Error deleting comment:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Export the app for testing
module.exports = app;
// Export the Comment model for testing
module.exports = Comment;
// Export the server for testing
module.exports = app;
// Export the mongoose connection for testing
module.exports = mongoose.connection;