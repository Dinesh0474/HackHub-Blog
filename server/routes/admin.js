const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const   adminLayout = '../views/layouts/admin';

const jwtSecret = process.env.JWT_SECRET;

/*
 check login
*/


const authMiddleware = (req,res,next) => {
  const token = req.cookies.token;

  if(!token){
    return res.status(401).json({ message: 'Unauthorized'});
  }

  try{
    const decoded = jwt.verify(token,jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json({ message: 'Unauthorized'});
  }
}






/*
Get
admin - login
*/


router.get('/admin', async (req, res) => {
  

  try{
    
    const locals = {
        title: "Admin",
        description: "Simple Blog created with Nodejs, Express & MongoDb"
      };
    
    
    
    
    res.render('admin/index', { locals , layout: adminLayout});
  } catch(error){
    console.log(error);
  }
 
});


/*
post
admin - check login
*/

  
router.post('/admin', async (req, res) => {
  

  try{
    const {username,password} = req.body;
    
    const user = await User.findOne({username});

    if(!user){
      return res.status(401).json({message:'Invalid Credentials'});
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json({message: 'Invalid Credentials'});
    }
    

    const token = jwt.sign({userId: user._id},jwtSecret);
    res.cookie('token',token, {httpOnly: true});


    res.redirect('/dashboard');
  } catch(error){
    console.log(error);
  }
 
});

/*
get
admin dashboard
*/

router.get('/dashboard', authMiddleware, async (req,res) => {
  try{
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with Nodejs, Express & MongoDb"
    };

     const data = await Post.find();
     res.render('admin/dashboard',{
        locals,
        data,
        layout: adminLayout
     });
  } catch(error) {

  }
  
})


/*
get
admin-create new post
*/


router.get('/add-post', authMiddleware, async (req,res) => {
  try{
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with Nodejs, Express & MongoDb"
    };

     const data = await Post.find();
     res.render('admin/add-post',{
        locals,
        layout: adminLayout
     });
  } catch(error) {

  }
  
});



router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;

    // Check if title is provided
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Create a new Post object
    const newPost = new Post({
      title: title,
      body: body,
    });

    // Save the newPost object to the database
    await newPost.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});



/*
get
admin-create new post
*/


router.get('/edit-post/:id', authMiddleware, async (req,res) => {
  try{
    const locals = {
      title: "Edit Post",
      descrption: " Free Nodejs  User Management System"
    }
   const data = await Post.findOne({ _id:req.params.id});
  
   res.render('admin/edit-post',{
    locals,
    data,
    layout: adminLayout
   })
  } catch(error) {
    console.log(error);
  }
  
});


/*

admin-create new post
*/


router.put('/edit-post/:id', authMiddleware, async (req,res) => {
  try{
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt:  Date.now()
    });
   res.redirect(`/edit-post/${req.params.id}`);
  } catch(error) {
    console.log(error);
  }
  
});




// router.post('/admin', async (req, res) => {
  

//     try{
//       const {username,password} = req.body;
       

//       if(req.body.username === 'admin' && req.body.password === 'password') {
//         res.send('You Are Logged In')
//       } else{
//         res.send('Wrong username and password')
//       }
//     } catch(error){
//       console.log(error);
//     }
   
//   });

/*
post
admin - register
*/








  router.post('/register', async (req, res) => {
  

    try{
      const {username,password} = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      try{
        const user = await User.create({username,password: hashedPassword});
        res.status(201).json({message: 'User Created',user});
      } catch( error) {
        if(error.code === 11000){
          res.status(409).json({message:'user already in use'})
        }
        res.status(500).json({message:'Internal Server Error'})
      }

    } catch(error){
      console.log(error);
    }
   
  });


/*
delete
admin - delete post
*/


router.delete('/delete-post/:id', authMiddleware, async (req,res) =>{
  try{
    await Post.deleteOne({_id: req.params.id});
    res.redirect('/dashboard');
  } catch(error) {
    console.log(error);
  }
});


/*
get
admin - logout
*/


router.get('/logout', (req,res) => {
  res.clearCookie('token');
  res.redirect('/')
} )



/*
 check login
*/


module.exports = router; 