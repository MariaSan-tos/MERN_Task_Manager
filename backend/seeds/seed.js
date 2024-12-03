const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Task = require("../models/Task");
const seedData = require("../data/seedData.json");
require("dotenv").config();

const seedDatabase = async () => {
  try {

    const mongoUrl = process.env.MONGODB_URL;
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected...");


    await User.deleteMany();
    await Task.deleteMany();

    for (const userData of seedData) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      });

      const savedUser = await user.save();

      const tasks = userData.tasks.map(taskData => {
        return new Task({
          user: savedUser._id,
          description: taskData.description,
        });
      });

      await Task.insertMany(tasks);
    }

    console.log("Seeding complete!");
    process.exit();
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
