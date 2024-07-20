import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Snowflake } from '@theinternetfolks/snowflake';

const signup = async (req, res) => {

  const { name, email, password } = req.body;
  const check= await User.findOne({email : email});
  if(check)
  {
    res.json({
      "status": false,
      "errors": [
        {
          "param": "email",
          "message": "User with this email address already exists.",
          "code": "RESOURCE_EXISTS"
        }
      ]
    });
  }
  const snowflake = new Snowflake();
  try {
    //onsole.log(id);
    //console.log('hello');
    const id = Snowflake.generate().toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({
        status: true,
        content: {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at.toISOString()
          },
          meta: {
            access_token: token
          }
        }
      });

  } catch (error) {
    res.status(500).json({ message: error });
  }
};

const login = async (req, res) => {

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
        status: true,
        content: {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at.toISOString()
          },
          meta: {
            access_token: token
          }
        }
      });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMe= async (req,res)=>{

    const id=req.userId;

    try {
        const user = await User.findOne(id).select('-password'); // Exclude password from the response
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        res.json({
        status: true,
        content: {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at.toISOString()
          }          
        }
       });
      } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
      }
};

export {signup,login,getMe};