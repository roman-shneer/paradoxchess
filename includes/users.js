const crypto = require("crypto");

module.exports = {
  the_users: this,
  user_keys: {},
  usersConnected: {},
  socketKeys: {},
  visited_ips: {},
  tools: null,

  userUpdateSession: function (user_id) {
    if (typeof this.usersConnected[user_id] == "undefined") {
      return false;
    }
    this.usersConnected[user_id].time = this.tools.now(); //last access time
    return true;
  },

  generateNewId: function (sess) {
    return Math.floor(Math.random() * this.tools.now());
  },

  get_random_hash: function () {
    return crypto
      .createHash("md5")
      .update(this.generateNewId().toString())
      .digest("hex");
  },

  initSession: function (cookie, page, ip) {
    if (typeof this.user_keys[cookie] == "undefined") {
      this.user_keys[cookie] = this.generateNewId();
    }
    var user_id = this.user_keys[cookie];

    if (typeof this.usersConnected[user_id] == "undefined") {
      this.usersConnected[user_id] = {
        time: this.tools.now(),
        page: page,
        ip: ip,
        data: { userName: "Guest", role: "guest" },
      };
    }

    return user_id;
  },

  sendToStartClient: function (user_id, extra) {
    tools = this.tools;
    the_users = this;
    var wgl = {};
    user_id = parseInt(user_id);
    for (var w in tools.bookingGames) {
      if (
        (typeof tools.bookingGames[w].users_permitted != "undefined" &&
          tools.bookingGames[w].users_permitted.indexOf(user_id) > -1) ||
        typeof this.tools.bookingGames[w].users_permitted == "undefined"
      ) {
        wgl[w] = tools.bookingGames[w];
      }
    }

    var active_games = 0;
    var active_users = 0;
    for (var a in tools.games) {
      if (tools.games[a].status == 1 && tools.games[a].game_type == "multy") {
        active_games++;
        for (var u in tools.games[a].users) {
          if (
            tools.games[a].users[u].role != "robot" &&
            tools.games[a].users[u].status == 1
          )
            active_users++;
        }
      }
    }

    var json1 = {
      uid: user_id,
      bookingGames: wgl,
      count_connected: Object.keys(the_users.usersConnected).length,
      count_active_games: active_games,
      count_active_users: active_users,
    };
    const user = this.user(user_id);
    if (user != null) {
      json1.own_games = user.bookingKeys != undefined ? user.bookingKeys : [];
      if (typeof extra != "undefined") {
        for (var e in extra) {
          json1[e] = extra[e];
        }
      }
      user.socket.send(JSON.stringify(json1));
    }
    return;
  },
  sendToStartClients: function () {
    for (var uid in this.usersConnected)
      if (typeof this.usersConnected[uid].socket != "undefined")
        this.sendToStartClient(uid);
  },

  sendToGameClient: function (uid, game, extra, tour_changed) {
    the_users = this;
    if (this.user(uid) == null) return;
    if (game != null) {
      var json = {
        status: game.status,
        tour: game.tour,
      };

      if (game.winner != undefined) json.winner = game.winner;
      if (game.users[uid].shah != undefined) json.info = "Сheck on you!";

      if (game.users[uid].mat != undefined) {
        json.info = "You are checkmated";
      }
    } else {
      var json = {};
    }
    if (extra != undefined) for (var e in extra) json[e] = extra[e];

    if (this.user(uid) != null) {
      this.user(uid).socket.send(JSON.stringify(json));
    }
  },

  sendToGameClients: function (game, extra, tour_changed) {
    if (typeof tour_changed == "undefined") {
      tour_changed = false;
    }
    for (var uid in game.users) {
      if (game.users[uid].status != -1) {
        this.sendToGameClient(uid, game, extra, tour_changed);
      }
    }
  },

  disconnectUser: function (user_id) {
    var user = this.user(user_id);
    if (user.bookingGames != undefined) {
      for (var k in user.bookingGames) {
        tools.cancelBoookingGame(user_id, k);
      }
    }
    if (user.game_key != undefined) {
      if (tools.games[user.game_key] != undefined) {
        tools.leave_game(
          user_id,
          tools.games[user.game_key],
          "_is_leaved_game"
        );
      }
    }
    delete this.usersConnected[user_id];
    this.sendToStartClients();
  },

  user_by_key: function (key) {
    the_users = this;
    user_id = the_users.user_keys[key];

    the_users.userUpdateSession(user_id);

    return user_id;
  },

  user_set_socket: function (user_id, page, ws) {
    the_users = this;

    if (ws != null) {
      the_users.socketKeys[ws.id] = user_id;
      this.user(user_id).socket = ws; //multy sockets
    }
  },

  getUserIdFromSocketId: function (socketId) {
    return this.socketKeys[socketId];
  },

  user: function (userId) {
    let user = this.usersConnected[userId];
    if (typeof user == "undefined") {
      user = null;
    }
    return user;
  },
};
