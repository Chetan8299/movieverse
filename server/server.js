const dotenv = require("dotenv");
dotenv.config({ path: require("path").join(__dirname, ".env") });

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 4000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});