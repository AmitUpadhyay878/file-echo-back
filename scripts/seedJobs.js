const JobOpening = require('../models/jobOpening');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding jobs'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const jobOpenings = [
  {
    title: 'Senior Full Stack Developer',
    type: 'Full-time',
    location: 'Remote',
    department: 'Engineering',
    description: 'We are looking for an experienced Full Stack Developer to join our engineering team. You will work on our file sharing platform, developing new features and maintaining existing functionality.',
    requirements: [
      '5+ years of experience in full stack development',
      'Proficiency in JavaScript/TypeScript, React, and Node.js',
      'Experience with MongoDB and RESTful APIs',
      'Strong understanding of cloud services (AWS, Azure, or GCP)',
      'Excellent problem-solving and communication skills'
    ],
    responsibilities: [
      'Design and implement new features for our file sharing platform',
      'Optimize application for maximum speed and scalability',
      'Collaborate with cross-functional teams to define and implement new features',
      'Ensure the technical feasibility of UI/UX designs',
      'Write clean, maintainable, and well-documented code'
    ],
    closeDate: new Date('2024-08-15'),
    isActive: true
  },
  {
    title: 'UX/UI Designer',
    type: 'Full-time',
    location: 'New York, NY',
    department: 'Design',
    description: 'Join our design team to create beautiful and intuitive user experiences for our file sharing platform. You will work closely with product managers and developers to bring designs to life.',
    requirements: [
      'Bachelor\'s degree in Design, HCI, or related field',
      '3+ years of experience in UX/UI design',
      'Strong portfolio showcasing your design process and solutions',
      'Proficiency in design tools like Figma, Sketch, or Adobe XD',
      'Understanding of user research methodologies'
    ],
    responsibilities: [
      'Create wireframes, prototypes, and high-fidelity mockups',
      'Conduct user research and usability testing',
      'Collaborate with developers to ensure proper implementation of designs',
      'Define and implement our visual design language',
      'Create and maintain design documentation'
    ],
    closeDate: new Date('2024-07-30'),
    isActive: true
  },
  {
    title: 'DevOps Engineer',
    type: 'Full-time',
    location: 'Remote',
    department: 'Operations',
    description: 'We are looking for a skilled DevOps Engineer to help us build and maintain our infrastructure. You will be responsible for deployment, scaling, and security of our services.',
    requirements: [
      '3+ years of experience in DevOps or SRE roles',
      'Experience with cloud platforms (AWS, Azure, or GCP)',
      'Proficiency with containerization (Docker, Kubernetes)',
      'Knowledge of infrastructure as code (Terraform, CloudFormation)',
      'Strong scripting skills (Bash, Python, or similar)'
    ],
    responsibilities: [
      'Design and implement CI/CD pipelines',
      'Manage and optimize cloud infrastructure',
      'Implement monitoring and alerting systems',
      'Automate deployment and scaling processes',
      'Ensure system security and compliance'
    ],
    closeDate: new Date('2024-08-01'),
    isActive: true
  },
  {
    title: 'Product Manager',
    type: 'Full-time',
    location: 'San Francisco, CA',
    department: 'Product',
    description: 'We are seeking a Product Manager to lead the development of our file sharing platform. You will work with cross-functional teams to define product strategy and roadmap.',
    requirements: [
      '4+ years of experience in product management',
      'Experience with B2B SaaS products',
      'Strong analytical and problem-solving skills',
      'Excellent communication and leadership abilities',
      'Technical background preferred but not required'
    ],
    responsibilities: [
      'Define product vision, strategy, and roadmap',
      'Gather and prioritize product requirements',
      'Work with engineering, design, and marketing teams',
      'Analyze market trends and competition',
      'Define success metrics and track product performance'
    ],
    closeDate: new Date('2024-07-25'),
    isActive: true
  },
  {
    title: 'QA Engineer',
    type: 'Full-time',
    location: 'Remote',
    department: 'Engineering',
    description: 'Join our QA team to ensure the quality and reliability of our file sharing platform. You will develop and execute test plans and identify bugs before they reach production.',
    requirements: [
      '3+ years of experience in software testing',
      'Experience with test automation frameworks',
      'Knowledge of testing methodologies',
      'Strong attention to detail',
      'Good communication skills'
    ],
    responsibilities: [
      'Develop and execute test plans and test cases',
      'Perform manual and automated testing',
      'Report and track bugs using issue tracking systems',
      'Collaborate with developers to resolve issues',
      'Improve testing processes and methodologies'
    ],
    closeDate: new Date('2024-08-10'),
    isActive: true
  },
  {
    title: 'Marketing Specialist',
    type: 'Full-time',
    location: 'Chicago, IL',
    department: 'Marketing',
    description: 'We are looking for a Marketing Specialist to help us grow our user base and increase brand awareness. You will develop and execute marketing campaigns for our file sharing platform.',
    requirements: [
      'Bachelor\'s degree in Marketing or related field',
      '2+ years of experience in digital marketing',
      'Experience with social media marketing',
      'Knowledge of SEO and content marketing',
      'Analytical mindset and data-driven approach'
    ],
    responsibilities: [
      'Develop and execute marketing campaigns',
      'Manage social media accounts and content',
      'Create and optimize content for SEO',
      'Analyze campaign performance and report on results',
      'Collaborate with product and sales teams'
    ],
    closeDate: new Date('2024-07-20'),
    isActive: true
  },
  {
    title: 'Customer Success Manager',
    type: 'Full-time',
    location: 'Remote',
    department: 'Customer Success',
    description: 'Join our Customer Success team to help our customers get the most out of our file sharing platform. You will be responsible for customer onboarding, education, and support.',
    requirements: [
      '3+ years of experience in customer success or account management',
      'Strong interpersonal and communication skills',
      'Experience with CRM tools like Salesforce',
      'Problem-solving abilities',
      'Technical aptitude to understand our product'
    ],
    responsibilities: [
      'Onboard and train new customers',
      'Build and maintain strong customer relationships',
      'Identify and address customer needs',
      'Drive product adoption and customer satisfaction',
      'Work with product team to advocate for customer needs'
    ],
    closeDate: new Date('2024-08-05'),
    isActive: true
  },
  {
    title: 'iOS Developer',
    type: 'Full-time',
    location: 'Austin, TX',
    department: 'Engineering',
    description: 'We are seeking an experienced iOS Developer to help us build our mobile app for file sharing. You will work on designing, coding, and maintaining our iOS application.',
    requirements: [
      '3+ years of experience in iOS development',
      'Proficiency in Swift and Objective-C',
      'Experience with iOS frameworks and APIs',
      'Understanding of UI/UX design principles',
      'Knowledge of RESTful APIs and JSON'
    ],
    responsibilities: [
      'Develop and maintain our iOS application',
      'Implement new features and functionality',
      'Ensure the performance and quality of the application',
      'Collaborate with the backend team on API integration',
      'Identify and fix bugs and performance bottlenecks'
    ],
    closeDate: new Date('2024-08-20'),
    isActive: true
  },
  {
    title: 'Data Analyst',
    type: 'Full-time',
    location: 'Remote',
    department: 'Analytics',
    description: 'Join our Analytics team to help us make data-driven decisions. You will analyze user behavior, product performance, and business metrics for our file sharing platform.',
    requirements: [
      'Bachelor\'s degree in Statistics, Mathematics, Computer Science, or related field',
      '2+ years of experience in data analysis',
      'Proficiency in SQL and data visualization tools',
      'Experience with Python or R for data analysis',
      'Strong analytical and problem-solving skills'
    ],
    responsibilities: [
      'Analyze user behavior and product usage patterns',
      'Create dashboards and reports for business metrics',
      'Identify trends and insights from data',
      'Support product and marketing teams with data',
      'Develop and maintain data models'
    ],
    closeDate: new Date('2024-07-28'),
    isActive: true
  },
  {
    title: 'Security Engineer',
    type: 'Full-time',
    location: 'Boston, MA',
    department: 'Security',
    description: 'We are looking for a Security Engineer to help us protect our file sharing platform and our users\' data. You will be responsible for identifying and mitigating security risks.',
    requirements: [
      '4+ years of experience in information security',
      'Knowledge of security frameworks and best practices',
      'Experience with security tools and technologies',
      'Understanding of cloud security',
      'Certifications like CISSP, CEH, or similar are a plus'
    ],
    responsibilities: [
      'Perform security assessments and penetration testing',
      'Implement and maintain security controls',
      'Monitor systems for security breaches',
      'Respond to security incidents',
      'Develop security policies and procedures'
    ],
    closeDate: new Date('2024-08-25'),
    isActive: true
  }
];

async function seedJobs() {
  try {
    // Clear existing jobs first
    await JobOpening.deleteMany({});
    console.log('Cleared existing job openings');

    // Insert new jobs
    const result = await JobOpening.insertMany(jobOpenings);
    console.log(`Successfully added ${result.length} job openings to the database`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error seeding job openings:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seed function
seedJobs(); 