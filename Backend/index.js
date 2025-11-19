const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors  = require("cors")
const port = process.env.PORT || 5000;
const Category = require("./src/models/categoryModel");
const User = require("./src/models/user");
const dotenv = require("dotenv");

dotenv.config();


app.use(express.json());
app.use(cors());





async function main() { 
    await mongoose.connect('mongodb+srv://anandarathore33_db_user:v1Tom9LbmAEuaj6Y@cluster.lwziieq.mongodb.net/cluster?appName=Cluster')

app.get('/', (req,res) => {
    res.send('Recipe Hub App Server is running')
})
}

main()
.then(()=>{console.log("mongodb connected successfully")})
.catch(err => console.log(err))


const ItemRoutes= require("./src/routes/itemRoute");
const CategoryRoutes = require("./src/routes/categoryRoute")
const AuthRoutes = require("./src/routes/authRoutes");

app.use('/api', ItemRoutes)
app.use('/api', CategoryRoutes)
app.use('/api/auth',AuthRoutes)
app.listen(port, ()=> {
    console.log(`Recipe Hub app listening on port ${port}`)
})