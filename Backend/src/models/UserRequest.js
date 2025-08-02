import mongoose from 'mongoose';

const userRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectionReason: String,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for better query performance
userRequestSchema.index({ phoneNumber: 1 });
userRequestSchema.index({ status: 1 });
userRequestSchema.index({ createdAt: -1 });

// Method to approve request
userRequestSchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
};

// Method to reject request
userRequestSchema.methods.reject = function(adminId, reason = '') {
  this.status = 'rejected';
  this.rejectedBy = adminId;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
};

const UserRequest = mongoose.model('UserRequest', userRequestSchema);

export default UserRequest; 