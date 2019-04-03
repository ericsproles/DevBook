import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import passport from 'passport';
import users from './routes/api/users';
import profile from './routes/api/profile';
import posts from './routes/api/posts';

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require(`./config/keys`).mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log(`MongoDB Connected`))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport Config
require(`./config/passport`)(passport);

app.get(`/`, (req, res) => res.send(`Hellllllo world`));

// Use Routes
app.use(`/api/users`, users);
app.use(`/api/profile`, profile);
app.use(`/api/posts`, posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
