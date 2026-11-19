const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const Mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

async function deleteListings() {
  await mongoose.connect(Mongo_url);

  const result = await Listing.deleteMany({
    title: {
      $in: ["Forest Eco Resort", "Modern Apartment Stay"]
    }
  });

  console.log(`Deleted ${result.deletedCount} listings.`);

  await mongoose.connection.close();
}

deleteListings();