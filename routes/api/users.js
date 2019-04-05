import express from 'express';
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import keys from '../../config/keys';
import validateRegisterInput from '../../validation/register';
import validateLoginInput from '../../validation/login';

// Load Input Validation
// const validateRegisterInput = require(`../../validation/register`);
// const validateLoginInput = require(`../../validation/login`);

// Load User model
import User from '../../models/User';

const router = express.Router();

// @route    GET api/users/test
// @desc     Tests users route
// @access   Public
router.get(`/test`, (req, res) => res.json({ msg: `Users Works` }));

// @route    POST api/users/register
// @desc     Create a new user
// @access   Public
router.post(`/register`, (req, res) => {
  // TO DO
  // lowercase email before saving it to database

  // Check Validation
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // Grab User
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = `Email already exists`;
      console.log(errors);
      return res.status(400).json(errors);
    }
    const avatar = gravatar.url(req.body.email, {
      s: 200, // Size
      r: `pg`, // Rating
      d: `mm`, // Default
    });
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      avatar,
      password: req.body.password,
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(userJson => res.json(userJson))
          .catch(err => console.log(err));
      });
    });
  });
});

// @route    GET api/users/test
// @desc     Login User / Returning JWT
// @access   Public
router.post(`/login`, (req, res) => {
  const { email } = req.body;
  const { password } = req.body;

  // Check Validation
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check for user
    if (!user) {
      errors.email = `User not found`;
      return res.status(404).json(errors);
    }
    // Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      // Password matches
      if (isMatch) {
        // User Matched
        const userPayload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        }; // Create JWT Payload

        // Sign Token
        jwt.sign(
          userPayload,
          keys.secretOrKey,
          { expiresIn: 10800 },
          (err, token) => {
            res.json({
              success: true,
              token: `Bearer ${token}`,
            });
          }
        );
      } else {
        // Password does NOT match
        errors.password = `Password incorrect`;
        return res.status(400).json(errors);
      }
    });
  });
});

// @route    GET api/users/current
// @desc     Return current user
// @access   Private
router.get(
  `/current`,
  passport.authenticate(`jwt`, { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

export default router;
