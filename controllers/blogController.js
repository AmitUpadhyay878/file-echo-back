const Blog = require('../models/blog');
const User = require('../models/User');

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      tag,
      category,
      search
    } = req.query;
    
    // Build filter query
    const query = { isPublished: true };
    
    if (tag) {
      query.tags = tag;
    }
    
    if (category) {
      query.categories = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const blogs = await Blog.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'username email');
      
    // Get total documents
    const count = await Blog.countDocuments(query);
    
    // Format blog data with proper image URLs
    const formattedBlogs = blogs.map(blog => {
      const blogObj = blog.toObject();
      
      // Fix coverImage path if it doesn't start with http
      if (blogObj.coverImage && !blogObj.coverImage.startsWith('http')) {
        // If path starts with slash, remove it to prevent double slashes
        const imagePath = blogObj.coverImage.startsWith('/') 
          ? blogObj.coverImage.substring(1) 
          : blogObj.coverImage;
          
        blogObj.coverImage = `${req.protocol}://${req.get('host')}/${imagePath}`;
      }
      
      return blogObj;
    });
    
    res.json({
      blogs: formattedBlogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug,
      isPublished: true 
    }).populate('author', 'username email');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    
    // Convert to object to modify
    const blogObj = blog.toObject();
    
    // Fix coverImage path if it doesn't start with http
    if (blogObj.coverImage && !blogObj.coverImage.startsWith('http')) {
      // If path starts with slash, remove it to prevent double slashes
      const imagePath = blogObj.coverImage.startsWith('/') 
        ? blogObj.coverImage.substring(1) 
        : blogObj.coverImage;
        
      blogObj.coverImage = `${req.protocol}://${req.get('host')}/${imagePath}`;
    }
    
    res.json(blogObj);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      excerpt, 
      coverImage, 
      tags, 
      categories,
      isPublished = true 
    } = req.body;
    
    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    
    const blog = new Blog({
      title,
      content,
      excerpt: excerpt || content.substring(0, 297) + '...',
      coverImage,
      author: req.user._id,
      tags: tags || [],
      categories: categories || [],
      isPublished,
      readTime
    });
    
    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check ownership
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }
    
    const {
      title,
      content,
      excerpt,
      coverImage,
      tags,
      categories,
      isPublished
    } = req.body;
    
    // Calculate read time if content changed
    let readTime = blog.readTime;
    if (content) {
      const wordCount = content.split(/\s+/).length;
      readTime = Math.ceil(wordCount / 200);
    }
    
    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (coverImage) blog.coverImage = coverImage;
    if (tags) blog.tags = tags;
    if (categories) blog.categories = categories;
    if (isPublished !== undefined) blog.isPublished = isPublished;
    blog.readTime = readTime;
    blog.updatedAt = Date.now();
    
    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check ownership or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }
    
    await Blog.deleteOne({ _id: req.params.id });
    res.json({ message: 'Blog removed' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get popular tags
// @route   GET /api/blogs/tags
// @access  Public
const getPopularTags = async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get blogs by author
// @route   GET /api/blogs/author/:userId
// @access  Public
const getBlogsByAuthor = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const blogs = await Blog.find({ 
      author: req.params.userId,
      isPublished: true 
    })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'username email');
      
    const count = await Blog.countDocuments({ 
      author: req.params.userId,
      isPublished: true 
    });
    
    // Format blog data with proper image URLs
    const formattedBlogs = blogs.map(blog => {
      const blogObj = blog.toObject();
      
      // Fix coverImage path if it doesn't start with http
      if (blogObj.coverImage && !blogObj.coverImage.startsWith('http')) {
        // If path starts with slash, remove it to prevent double slashes
        const imagePath = blogObj.coverImage.startsWith('/') 
          ? blogObj.coverImage.substring(1) 
          : blogObj.coverImage;
          
        blogObj.coverImage = `${req.protocol}://${req.get('host')}/${imagePath}`;
      }
      
      return blogObj;
    });
    
    res.json({
      blogs: formattedBlogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    console.error('Error fetching author blogs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getPopularTags,
  getBlogsByAuthor
}; 