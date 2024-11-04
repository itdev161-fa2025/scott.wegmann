import express from 'express';
import connectDatabase from './config/db';
import {  check, validationResult } from 'express-validator';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import User from './models/User';
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



// Connection listener
const port = 5000;
app.listen(port, () => console.log(`Express server running on port ${port}`));