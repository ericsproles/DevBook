import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import Post from '../../models/Post';
import Profile from '../../models/Profile';

import validatePostInput from '../../validation/post';

const router = express.Router();

// @route    GET  api/posts/test
// @desc     Tests post route
// @access   Public
router.get(`/test`, (req, res) => res.json({ msg: `Posts Works` }));

// @route    GET  api/posts/
// @desc     Get all posts
// @access   Public
router.get(`/`, (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ posts: `No posts found` }));
});

// @route    GET  api/posts/:id
// @desc     Get post by id
// @access   Public
router.get(`/:id`, (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ posts: `No posts found with that ID` })
    );
});

// @route    POST  api/posts
// @desc     Create post
// @access   Private
router.post(
  `/`,
  passport.authenticate(`jwt`, { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id,
    });
    newPost.save().then(post => res.json(post));
  }
);

// @route    DELETE  api/posts/:id
// @desc     Delete post
// @access   Private
router.delete(
  `/:id`,
  passport.authenticate(`jwt`, { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: `User not authorized` });
          }
          // Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: `No post found` }));
    });
  }
);

// @route    POST  api/posts/like/:id
// @desc     Like a post by ID
// @access   Private
router.post(
  `/like/:id`,
  passport.authenticate(`jwt`, { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: `User already liked this post` });
          }
          // Add user ID to likes aray
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        });
      })
      .catch(err => res.status(404).json({ postnotfound: `No post found` }));
  }
);

// @route    POST  api/posts/unlike/:id
// @desc     Unlike a post by ID
// @access   Private
router.post(
  `/unlike/:id`,
  passport.authenticate(`jwt`, { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: `You have not yet liked this post` });
          }
          // Get the remove index
          const removeIndex = post.likes.map(item =>
            item.user.toString().indexOf(req.user.id)
          );
          // Splice out of the array
          post.likes.splice(removeIndex, 1);
          // Save to the database
          post.save().then(post => res.json(post));
        });
      })
      .catch(err => res.status(404).json({ postnotfound: `No post found` }));
  }
);

// @route    POST  api/posts/comment/:id
// @desc     Add comment to a post
// @access   Private
router.post(
  `/comment/:id`,
  passport.authenticate(`jwt`, { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id,
        };
        // Add to comments array
        post.comments.unshift(newComment);
        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: `No post found` }));
  }
);

// @route    Delete  api/posts/comment/:id/:comment_id
// @desc     Delete comment to a post
// @access   Private
router.delete(
  `/comment/:id/:comment_id`,
  passport.authenticate(`jwt`, { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check to see if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          // If array length is 0, then comment does not exist
          return res
            .status(404)
            .json({ commentnotexists: `Comment does not exist` });
        }
        // Comment exists, Get the remove index
        const removeIndex = post.comments
          .map(comment => comment._id.toString())
          .indexOf(req.params.comment_id);
        // Splice comment out of the array
        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: `No post found` }));
  }
);

export default router;
