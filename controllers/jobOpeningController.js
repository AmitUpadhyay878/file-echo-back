const JobOpening = require('../models/jobOpening');

// @desc    Get all active job openings
// @route   GET /api/jobs
// @access  Public
const getJobOpenings = async (req, res) => {
  try {
    const jobs = await JobOpening.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching job openings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single job opening
// @route   GET /api/jobs/:id
// @access  Public
const getJobOpening = async (req, res) => {
  try {
    const job = await JobOpening.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job opening not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job opening:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create job opening
// @route   POST /api/jobs
// @access  Private/Admin
const createJobOpening = async (req, res) => {
  try {
    const job = new JobOpening(req.body);
    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job opening:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update job opening
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJobOpening = async (req, res) => {
  try {
    const job = await JobOpening.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job opening not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error updating job opening:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete job opening
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJobOpening = async (req, res) => {
  try {
    const job = await JobOpening.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job opening not found' });
    }
    res.json({ message: 'Job opening removed' });
  } catch (error) {
    console.error('Error deleting job opening:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getJobOpenings,
  getJobOpening,
  createJobOpening,
  updateJobOpening,
  deleteJobOpening,
}; 