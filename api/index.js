const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({dest: 'uploads/'});
const fs = require('fs');
const { isValidObjectId } = mongoose.Types.ObjectId;

const salt = bcrypt.genSaltSync(10);
const secret = 'vvdvhrgvgeuv';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));


mongoose.connect('mongodb+srv://ishantthulla21:test123@cluster0.pnuo0ec.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try{
    const userDoc = await User.create({username, 
        password:bcrypt.hashSync(password, salt)})
  res.json(userDoc);
  } catch (e){
    res.status(400).json(e);
  }
});

//login

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });

    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);

        if (passOk) {
            // Password is correct, generate a token
            jwt.sign({ username, id: userDoc._id }, secret, (err, token) => {
                if (err) {
                    console.error(err);
                    res.status(500).json('Server error');
                } else {
                    res.cookie('token', token).json({
                        id:userDoc._id,
                        username,
                    });
                }

            });
        } else {
            res.status(400).json('Wrong credentials');
        }
    } else {
        res.status(400).json('User not found');
    }
});


app.get('/profile', (req, res) => {
    const { token } = req.cookies;

    jwt.verify(token, secret, {}, (err, decoded) => {
        if (err) {
            // Handle token verification error
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Include the full name in the response
        const { username, fullName } = decoded;

        res.json({ username, fullName });
    });
});



app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
})

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length-1];
    const newPath = path+'.'+ext;
    fs.renameSync(path,newPath);

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const {title,summary,content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover:newPath,
            author:info.id,
            
    })
    res.json(postDoc);
    })

})

// update

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
    let newPath = null;
    if (req.file) {
      const {originalname,path} = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path+'.'+ext;
      fs.renameSync(path, newPath);
    }
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {id,title,summary,content} = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json('you are not the author');
      }
      await postDoc.updateOne({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });
  
      res.json(postDoc);
    });
  
  });

// show post

app.get('/post', async (req,res) => {
    res.json(
      await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1})
        .limit(20)
    );
  });

app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc)
})
  


const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
