const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  team: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
  ],
  description: {
    type: String,
    required: true,
  },

}, {
  timestamps: true
});


const Task = mongoose.model("Task", taskSchema);
module.exports = Task;