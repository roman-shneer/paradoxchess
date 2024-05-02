var express = require("express");
const session = require("express-session");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(express.static("public"));
app.use(
  "three",
  express.static(
    path.join(__dirname, "node_modules/three/build/three.module.js")
  )
);
app.use("/three/", express.static(path.join(__dirname, "node_modules/three/")));
app.use(
  "/build/",
  express.static(path.join(__dirname, "node_modules/three/build"))
);
app.use(
  "/jsm/",
  express.static(path.join(__dirname, "node_modules/three/examples/jsm"))
);
app.use("/react/", express.static(path.join(__dirname, "node_modules/react")));
app.use(
  "/react-dom/",
  express.static(path.join(__dirname, "node_modules/react-dom"))
);
app.use(
  session({
    secret: "samhara",
    resave: true,
    saveUninitialized: true,
    cookie: {
      name: "test",
      httpOnly: false,
      secure: false,
      maxAge: 60 * 1000 * 60,
    },
  })
);
const config = require("./includes/config.js");
const PORT = process.env.PORT || config.web_port;
app.all("/", function (req, res) {
  res.render("index.html", { PORT: PORT, socket_host: config.socket_host });
});
app.all("/guide/", function (req, res) {
  res.render("index.html", { PORT: PORT, socket_host: config.socket_host });
});
app.all("/rules/", function (req, res) {
  res.render("index.html", { PORT: PORT, socket_host: config.socket_host });
});
app.all("/game/", function (req, res) {
  res.render("game.html", { PORT: PORT, socket_host: config.socket_host });
});

const url = require("url");
var bot = require("./includes/bot.js");
var tools = require("./includes/tools.js");
var the_users = require("./includes/users.js");
var world = require("./includes/world.js");

var route_action = require("./includes/route_action.js");

var glob = { tools: tools, the_users: the_users, world: world, bot: bot };
route_action.glob = glob;
tools.glob = glob;
bot.glob = glob;
//statistics.glob=glob;
tools.the_users = the_users;
tools.world = world;
the_users.tools = tools;

//////////////////////////////////////SOCKETS///////////////////////////////////////////
const server = http.createServer(app);
const io = new Server(server);
io.on("connection", (socket) => {
  //socket.handshake.auth.token socket.handshake.auth.page
  const page = socket.handshake.auth.page;
  let user_key = socket.handshake.auth.token;
  console.log("Connected", page);
  if (user_key == null) {
    user_key = the_users.get_random_hash();
    socket.emit(
      "message",
      JSON.stringify({ action: "set_key", key: user_key })
    );
  }
  var user_id = the_users.user_by_key(user_key);
  var user = the_users.user(user_id);

  if (typeof user_id == "undefined" || user == null) {
    var UserIP = socket.handshake.address;
    var user_id = the_users.initSession(user_key, page, UserIP);
    user = the_users.user(user_id);
  }
  if (typeof user.disconnectTime != "undefined") {
    delete user.disconnectTime;
  }
  the_users.user_set_socket(user_id, page, socket);
  //START LOAD DATA
  if (page == "start") {
    the_users.sendToStartClient(user_id, {
      action: "load_data",
      user: user.data,
    });
  }
  //GAME LOAD DATA
  if (page == "game") {
    if (typeof user.game_key == "undefined") {
      user.socket.emit(
        "message",
        JSON.stringify({ status: 0, action: "redirect2home" })
      );
      return false;
    }
    var game_id = user.game_key;
    var game = tools.games[game_id];
    if (typeof game == "undefined" || game.status == 0) {
      user.socket.emit(
        "message",
        JSON.stringify({ status: 0, action: "redirect2home" })
      );
      return null;
    }

    the_users.sendToGameClient(
      user_id,
      game,
      {
        action: "load_data",
        game_id: game_id,
        cube_size: game.cube_size,
        game_type: game.game_type,
        world: game.data.world,
        models: game.data.models,
        tour: game.tour,
        user_id: user_id,
        users: game.users,
      },
      true
    );
  }
  //get message
  socket.on("message", function incoming(message) {
    message = JSON.parse(message);

    var user_key = message.mdkey;
    console.log(user_key);
    var user_id = the_users.user_by_key(user_key);

    if (message.page != "stat") {
      the_users.userUpdateSession(user_id);
    }
    //route actions for start , game, and viewgame sockets
    if (
      typeof message.action != "undefined" &&
      typeof route_action[message.page + "_" + message.action] == "function"
    ) {
      route_action[message.page + "_" + message.action]({
        message: message,
        user_id: user_id,
      });
    }
  });
  socket.on("disconnect", () => {
    const userId = the_users.getUserIdFromSocketId(socket.id);
    the_users.user(user_id).disconnectTime = tools.now();
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

setInterval(() => {
  Object.keys(the_users.usersConnected).forEach((userId) => {
    if (
      typeof the_users.usersConnected[userId] != "undefined" &&
      typeof the_users.usersConnected[userId].disconnectTime != "undefined"
    ) {
      if (the_users.usersConnected[userId].disconnectTime < tools.now() - 10) {
        the_users.disconnectUser(userId);
      }
    }
  });
}, 1000);
