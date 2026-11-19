// init/index.js

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const Mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

const demoHostsData = [
  { username: "beachlover_raj", email: "raj@wanderbnb.com", password: "raj123" },
  { username: "hillgirl_priya", email: "priya@wanderbnb.com", password: "priya123" },
  { username: "desertking_vik", email: "vik@wanderbnb.com", password: "vik123" },
  { username: "lakequeen_maya", email: "maya@wanderbnb.com", password: "maya123" },
  { username: "citystar_neha", email: "neha@wanderbnb.com", password: "neha123" },
];

async function getOrCreateHost(hostData) {
  // Check whether the host already exists
  let host = await User.findOne({
    $or: [
      { username: hostData.username },
      { email: hostData.email },
    ],
  });

  // Create the host only if they don't already exist
  if (!host) {
    host = await User.register(
      new User({
        username: hostData.username,
        email: hostData.email,
      }),
      hostData.password
    );

    console.log(`Created host: ${hostData.username}`);
  } else {
    console.log(`Existing host reused: ${hostData.username}`);
  }

  return host;
}

async function initDB() {
  try {
    await mongoose.connect(Mongo_url);
    console.log("Connected to MongoDB!");

    // Get or create the demo hosts
    const demoHosts = await Promise.all(
      demoHostsData.map((host) => getOrCreateHost(host))
    );

    // Insert or update listings without deleting existing documents
    for (let i = 0; i < initData.data.length; i++) {
      const listing = initData.data[i];

      const owner = demoHosts[i % demoHosts.length];

      await Listing.findOneAndUpdate(
        {
          title: listing.title,
          location: listing.location,
        },
        {
          $set: {
            ...listing,
            owner: owner._id,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    console.log(`Successfully seeded ${initData.data.length} listings!`);
  } catch (error) {
    console.error("Initialization error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

initDB();