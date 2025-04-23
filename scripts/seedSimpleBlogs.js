const mongoose = require('mongoose');
const Blog = require('../models/blog');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding blogs'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Helper function to create a slug from title
function createSlug(title) {
  return title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
}

// Function to seed blogs
async function seedBlogs() {
  try {
    // First check if we have any users to use as authors
    const users = await User.find({}).limit(1);
    if (users.length === 0) {
      console.error('No users found. Please create at least one user before seeding blogs.');
      await mongoose.disconnect();
      return;
    }

    // Use the first user as the author for all blogs
    const authorId = users[0]._id;
    
    // Clear existing blogs first
    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    // Sample blog data
    const blogs = [
      {
        title: 'How to Securely Share Files Online',
        slug: 'how-to-securely-share-files-online',
        content: 'In today\'s digital world, sharing files securely is more important than ever. Whether you\'re sending sensitive documents, large media files, or collaborating on projects, ensuring your data remains protected should be a top priority. When you share files online, they can potentially be intercepted, accessed by unauthorized users, or stored indefinitely on servers without your knowledge. End-to-end encryption ensures that your files are encrypted on your device and can only be decrypted by the intended recipient. This prevents anyone in the middle, including the service provider, from accessing the content.',
        excerpt: 'Learn essential practices for securely sharing files online and protect your sensitive data from unauthorized access.',
        coverImage: '/images/blog/secure-file-sharing.jpg',
        author: authorId,
        tags: ['Security', 'File Sharing', 'Data Protection', 'Privacy'],
        categories: ['Security', 'Tips'],
        readTime: 6,
        isPublished: true
      },
      {
        title: 'The Future of Cloud Storage: Trends to Watch',
        slug: 'future-of-cloud-storage-trends-to-watch',
        content: 'Cloud storage has revolutionized how we store and access data, making it possible to retrieve files from anywhere with an internet connection. As technology continues to evolve, the cloud storage landscape is changing rapidly. Let\'s explore the emerging trends that are shaping the future of this essential technology. Cloud storage has become ubiquitous in both personal and professional contexts. From Google Drive and Dropbox to enterprise solutions like AWS S3 and Microsoft Azure, users have many options for storing data in the cloud.',
        excerpt: 'Explore the latest trends in cloud storage technology and how they will shape the way we store and access data in the future.',
        coverImage: '/images/blog/cloud-storage-future.jpg',
        author: authorId,
        tags: ['Cloud Storage', 'Technology', 'Future Tech', 'Data Management'],
        categories: ['Technology', 'Trends'],
        readTime: 8,
        isPublished: true
      },
      {
        title: 'Productivity Hacks for Remote File Collaboration',
        slug: 'productivity-hacks-for-remote-file-collaboration',
        content: 'Remote work has become the new normal for many teams, making effective file collaboration more important than ever. When team members are distributed across different locations and time zones, having the right tools and practices for file sharing and collaboration can make the difference between a productive team and a frustrated one. Before discussing solutions, let\'s understand the typical challenges remote teams face: version control issues, access problems, communication gaps, tool fragmentation, and security concerns.',
        excerpt: 'Discover practical tips and tools to streamline file collaboration for remote teams and boost productivity.',
        coverImage: '/images/blog/remote-collaboration.jpg',
        author: authorId,
        tags: ['Productivity', 'Remote Work', 'Collaboration', 'File Management'],
        categories: ['Productivity', 'Remote Work'],
        readTime: 9,
        isPublished: true
      },
      {
        title: 'Understanding File Encryption: A Beginner\'s Guide',
        slug: 'understanding-file-encryption-beginners-guide',
        content: 'In an age where data breaches and privacy concerns are increasingly common, understanding how to protect your digital files is essential. File encryption is one of the most effective ways to secure sensitive information, but for many, it remains a mysterious concept. This guide aims to demystify file encryption and provide practical knowledge for everyday users. At its core, encryption is the process of converting information into a code to prevent unauthorized access. When you encrypt a file, you\'re essentially scrambling its contents so that they can only be read after they\'ve been decrypted with the correct key.',
        excerpt: 'Learn the basics of file encryption, why it\'s important, and how to implement it to protect your sensitive data.',
        coverImage: '/images/blog/file-encryption.jpg',
        author: authorId,
        tags: ['Security', 'Encryption', 'Privacy', 'Data Protection'],
        categories: ['Security', 'Education'],
        readTime: 7,
        isPublished: true
      },
      {
        title: 'Best Practices for Managing Large File Transfers',
        slug: 'best-practices-for-managing-large-file-transfers',
        content: 'Transferring large files efficiently and securely presents unique challenges that go beyond standard file sharing. Whether you\'re working with high-resolution videos, design assets, software packages, or extensive datasets, managing large file transfers requires special consideration and tools. Before discussing solutions, let\'s understand the specific challenges that large files present: bandwidth limitations, upload/download time, connection stability, storage limitations, security concerns, and progress tracking.',
        excerpt: 'Learn effective strategies for transferring and managing large files to overcome size limitations and ensure successful delivery.',
        coverImage: '/images/blog/large-file-transfer.jpg',
        author: authorId,
        tags: ['File Transfer', 'Large Files', 'Data Management', 'Productivity'],
        categories: ['Guides', 'Technology'],
        readTime: 8,
        isPublished: true
      }
    ];

    // Insert blogs
    const result = await Blog.insertMany(blogs);
    console.log(`Successfully added ${result.length} blog posts to the database`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');

  } catch (error) {
    console.error('Error seeding blogs:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seed function
seedBlogs(); 