const Task = require("../models/Task");
const { validateObjectId } = require("../utils/validation");
const User = require("../models/User");  


exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json({ tasks, status: true, msg: "Tasks found successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.getTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    const task = await Task.findOne({
      $or: [
        { user: req.user.id }, 
        { team: { $in: [req.user.id] } }  
      ],
      _id: req.params.taskId  
    }).populate('team', 'email'); 
    if (!task) {
      return res.status(400).json({ status: false, msg: "No task found.." });
    }
    res.status(200).json({ task, status: true, msg: "Task found successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}


exports.postTask = async (req, res) => {
  try {
    const { description, team } = req.body;

    const teamEmails = Array.isArray(team) ? team : [team];

    if (!description) {
      return res.status(400).json({ status: false, msg: "Description of task not found" });
    }

    const teamEmailsLowercased = teamEmails.map(email => email.toLowerCase());

    const validUsers = await User.find({ 
      email: { $in: teamEmailsLowercased } 
    }, "_id email");

    const validUserIds = validUsers.map(user => user._id.toString());

    const invalidEmails = teamEmailsLowercased.filter(email => 
      !validUsers.some(user => user.email.toLowerCase() === email)
    );

    if (invalidEmails.length > 0) {
      return res.status(400).json({
        status: false,
        msg: `The following emails are not registered: ${invalidEmails.join(", ")}`
      });
    }

    const task = await Task.create({
      user: [req.user.id, ...validUserIds],
      description,
      team: validUserIds  
    });

    res.status(201).json({ task, status: true, msg: "Task created successfully.." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

exports.putTask = async (req, res) => {
  try {
    const { description, team } = req.body;

    const teamEmails = Array.isArray(team) ? team : [team];

    if (!description) {
      return res.status(400).json({ status: false, msg: "Description of task not found" });
    }

    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    let task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(400).json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user != req.user.id) {
      return res.status(403).json({ status: false, msg: "You can't update task of another user" });
    }

    const teamEmailsLowercased = teamEmails.map(email => email.toLowerCase());

    const validUsers = await User.find({ email: { $in: teamEmailsLowercased } }, "_id email");

    const validUserIds = validUsers.map(user => user._id.toString());

    const invalidEmails = teamEmailsLowercased.filter(email => 
      !validUsers.some(user => user.email.toLowerCase() === email)
    );

    if (invalidEmails.length > 0) {
      return res.status(400).json({
        status: false,
        msg: `The following emails are not registered: ${invalidEmails.join(", ")}`
      });
    }

    task = await Task.findByIdAndUpdate(
      req.params.taskId, 
      { description, team: validUserIds }, 
      { new: true }
    );

    res.status(200).json({ task, status: true, msg: "Task updated successfully.." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};


exports.deleteTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    let task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(400).json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user != req.user.id) {
      return res.status(403).json({ status: false, msg: "You can't delete task of another user" });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.status(200).json({ status: true, msg: "Task deleted successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}