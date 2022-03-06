const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "twitterClone.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
//api one
app.get("/tables/", async (request, response) => {
  const gettables = `select * from user `;
  const dbresponse = await db.all(gettables);
  response.send(dbresponse);
});
//api register
app.post("/register/", async (request, response) => {
  const Userdetails = request.body;
  console.log(Userdetails);
  const { username, password, name, gender } = Userdetails;
  const gettables = `select * from user where name like "${name}"`;
  const dbresponse = await db.get(gettables);
  if (dbresponse !== undefined) {
    if (password.length < 6) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const addQuery = `insert into user (
            username,password,name,gender)
            values(${username},${password},${name},${gender})`;
      await db.run(addQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
//api login
app.post("/login/", async (request, response) => {
  const userDetails = request.body;
  console.log(userDetails);
  const { username, password } = userDetails;
  const dbquery = `select * from user where username="${username}"`;
  const dbresponse = await db.get(dbquery);
  if (dbresponse !== undefined) {
    const dbpassword = await bcrypt.compare(password, dbresponse.password);
    if (dbpassword === true) {
      const payload = { username: username };
      const jwtoken = jwt.sign(payload, "my secret token");
      response.send({ jwtoken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});
