import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import memberRoutes from './routes/memberRoutes.js';

dotenv.config();

const app= express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
try{
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('Database connected')
}
catch(error){
    console.error('Database connection error:', error)
};

app.use('/v1/auth',authRoutes);
app.use('/v1/role',roleRoutes);
app.use('/v1/community',communityRoutes);
app.use('/v1/member',memberRoutes);

app.listen(3000,()=>{
    console.log('server started...')
});