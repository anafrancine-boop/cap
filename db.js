// const { MongoClient } = require("mongodb");
// require("dotenv").config();

// const uri = process.env.MONGO_URI;

// if (!uri) {
//   throw new Error(
//     "Missing MONGO_URI in .env"
//   );
// }

// const client = new MongoClient(uri);

// let database = null;

// async function connectDB() {
//   try {
//     if (database) {
//       return database;
//     }

//     await client.connect();

//     database =
//       client.db(
//         "drainage_system"
//       );

//     console.log(
//       "✅ MongoDB Atlas connected successfully"
//     );

//     return database;

//   } catch (err) {

//     console.error(
//       "❌ MongoDB connection failed:",
//       err.message
//     );

//     throw err;
//   }
// }

// module.exports = connectDB;

module.exports = {};