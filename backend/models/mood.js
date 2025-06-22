const mongoose = require('mongoose');
const { Schema } = mongoose;

const MoodSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: String,
  tone: String,
  speechCharacteristics: String,
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mood', MoodSchema);
