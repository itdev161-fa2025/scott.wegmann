import express from 'express';
import connectDatabase from './config/db';
import {  check, validationResult } from 'express-validator';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import User from './models/User';
import Post from './models/Post';
import auth from './middleware/auth';

//Initialize express application
const app = express();

//connect database
connectDatabase();

// configure Middleware
app.use(express.json({extended: false}));
app.use(cors({ origin: 'http://localhost:3000'}));


//API endpoints
app.get('/', (req, res) => 
res.send('http get request sent to root api endpoint')
);

/**

 * @route POST api/login

 * @desc Login user

 */

app.post(

  '/api/login',

  [

  check('email', 'Please enter a valid email').isEmail(),

  check('password', 'A password is required').exists()

  ],

  async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

  return res.status(422).json({ errors: errors.array() });

  } else {

  const { email, password } = req.body;

  try {

    // Check if user exists

    let user = await User.findOne({ email: email });

    if (!user) {

    return res

      .status(400)

      .json({ errors: [{ msg: 'Invalid email or password' }] });

    }



    // Check password

    const match = await bcrypt.compare(password, user.password);

    if (!match) {

    return res

      .status(400)

      .json({ errors: [{ msg: 'Invalid email or password' }] });

    }



    // Generate and return a JWT token

    returnToken(user, res);

    } catch (error) {

    res.status(500).send('Server error');

    }

  }

  }

);

const returnToken = (user, res) => {

  const payload = {

  user: {

    id: user.id

  }

  };



  jwt.sign(

  payload,

  config.get('jwtSecret'),

  { expiresIn: '10hr' },

  (err, token) => {

    if (err) throw err;

    res.json({ token: token });

  }

  );

};




app.get('./api/auth', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500). send ('unknown server error');
  }
});

// Post endpoints
/**
* @route Post api/posts
*@desc Create post
*/
app.post(
  '/api/posts',
  [
    auth,
    [
      check('title', 'Title text is required').not().isEmpty(),
      check('body', 'Body text is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({errors: errors.array()});
    }
    else {
      const {title, body} = req.body;
      try {
        //Get the user who created the post
        const user = await User.findById(req.user.id);

        //save to the db and return 
        await post.save();

        res.json(post);
      }catch (error) {
        console.error(error);
        res.status(500).send('Server error');
      }
    }
  }
);

/**
 * @route GET api/posts
 * @desc Get posts
 */
app.get('/api/posts', auth, async (req, res) => {
  try{
    const posts = await Post.find().sort({ date: -1})

    res.json(posts);
  }catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * @route GET api/posts/:id
 * @desc get post
 * 
 */
app.get('/api/posts/:id', auth, async (res, req) => {
  try{
  const post = await Post.findById(req.params.id);

  //Make sure the post was found
  if (!post) {
    return res.status(404).json({msg: 'Post not found'});
  }

  res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * @route Delete api/posts/:id
 * @desc Delete a post
 * 
 */
app.delete('/api/posts/:id', auth, async (req, res) =>{
  try{
    const post = await Post.findById(req.params.id);

    //Make sure post was found
    if (!post) {
      return res.status(404).json({msg: 'Post not found'});
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized'});
    }

    await post.remove();

    res.json({msg: 'Post removed'});
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * @route PUT api/posts/:id
 * @desc Update a post
 * 
 */
app.put('/api/posts/:id', auth, async (req, res) => {
  try{
    const {title, body } = req.body;
    const post = await Post.findById(req.params.id);

    // Make sure the post was found 
    if (!post) {
      return res.status(404).json({ msg: 'Post not found'});
    }

    // Make sure the request user created the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized'});
    }

    // Update the post and return 
    post.title = title || post.title;
    post.body = body || post.body;

    await post.save();

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Connection listener
const port = 5000;
app.listen(port, () => console.log(`Express server running on port ${port}`));