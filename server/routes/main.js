const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

/*
GET
Home
*/
router.get('', async (req, res) => {
  try {
    const locals = {
      title: "Nodejs Blog",
      description: "Simple Blog created with Nodejs, Express & MongoDb"
    };
    let perPage = 6;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{$sort: {createdAt: -1}}])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.count();
    console.log(count);
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/'
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/about', (req, res) => {
  res.render('about',{
    currentRoute: '/about'
  });
});


router.get('/contact', (req, res) => {
  res.render('contact',{
    currentRoute: '/contact'
  });
});
module.exports = router;





/*
Get
POST :id
*/



router.get('/post/:id', async (req, res) => {
  try{

   

    let slug = req.params.id;
    
    const data = await Post.findById({ _id: slug}); 

    const locals = {
      title: data.title,
      description: "Simple Blog created with Nodejs, Express & MongoDb"
    };
    res.render('post', { 
      locals,
      data,
    currentRoute: `/post/${slug}` });
  } catch(error){
    console.log(error);
  }
 
});




