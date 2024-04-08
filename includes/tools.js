module.exports = {
  glob: null,
  the_users: null,
  bookingGames: {},
  games: {},
  dead_games_list: {},
  //saved_games_list: {},
  ifCellEmpty: function (game, d) {
    var model = tools.getModel(game, d, "cube");
    if (model != null) return true;
    else return false;
  },

  ifWorldLimit: function (d, game) {
    return game.data.world.includes(d);
  },

  getPawnPerpendWays: function (game, cube_number, limit) {
    //var tools=this;
    var d = cube_number.split(":");
    var x = parseInt(d[0]);
    var y = parseInt(d[1]);
    var z = parseInt(d[2]);
    const dir = game.dirs[game.tour];
    var result = [];

    const add2 = function (x, y, z) {
      var d = [x, y, z].join(":");

      if (tools.ifWorldLimit(d, game) == false) return true;
      result.push(d);
      return true;
    };

    //x\y
    if (dir == 0) {
      for (
        x1 = x + 1, y1 = y + 1;
        x1 <= game.cube_size && y1 <= game.cube_size;
        x1++, y1++
      ) {
        if (add2(x1, y1, z)) {
          break;
        }
      }
    }
    if (dir == 1) {
      for (x1 = x - 1, y1 = y - 1; x1 >= 1 && y1 >= 1; x1--, y1--) {
        if (add2(x1, y1, z)) {
          break;
        }
      }
    }
    if (dir == 1) {
      for (
        x1 = x + 1, y1 = y - 1;
        x1 <= game.cube_size && y1 >= 1;
        x1++, y1--
      ) {
        if (add2(x1, y1, z)) {
          break;
        }
      }
    }
    if (dir == 0) {
      for (
        x1 = x - 1, y1 = y + 1;
        x1 >= 1 && y1 <= game.cube_size;
        x1--, y1++
      ) {
        if (add2(x1, y1, z)) {
          break;
        }
      }
    }
    //x\z
    if (dir == 0) {
      for (
        x1 = x + 1, z1 = z + 1;
        x1 <= game.cube_size && z1 <= game.cube_size;
        x1++, z1++
      ) {
        if (add2(x1, y, z1)) {
          break;
        }
      }
    }
    if (dir == 1) {
      for (x1 = x - 1, z1 = z - 1; x1 >= 1 && z1 >= 1; x1--, z1--) {
        if (add2(x1, y, z1)) {
          break;
        }
      }
    }
    if (dir == 1) {
      for (
        x1 = x + 1, z1 = z - 1;
        x1 <= game.cube_size && z1 >= 1;
        x1++, z1--
      ) {
        if (add2(x1, y, z1)) {
          break;
        }
      }
    }
    if (dir == 0) {
      for (
        x1 = x - 1, z1 = z + 1;
        x1 >= 1 && z1 <= game.cube_size;
        x1--, z1++
      ) {
        if (add2(x1, y, z1)) {
          break;
        }
      }
    }
    //y/z
    if (dir == 0) {
      for (
        z1 = z + 1, y1 = y + 1;
        z1 <= game.cube_size && y1 <= game.cube_size;
        z1++, y1++
      ) {
        if (add2(x, y1, z1)) {
          break;
        }
      }
    }
    if (dir == 1) {
      for (y1 = y - 1, z1 = z - 1; y1 >= 1 && y1 >= 1; y1--, z1--) {
        if (add2(x, y1, z1)) {
          break;
        }
      }
    }
    if (dir == 1) {
      for (
        y1 = y + 1, z1 = z - 1;
        y1 <= game.cube_size && z1 >= 1;
        y1++, z1--
      ) {
        if (add2(x, y1, z1)) {
          break;
        }
      }
    }
    if (dir == 0) {
      for (
        y1 = y - 1, z1 = z + 1;
        y1 >= 1 && z1 <= game.cube_size;
        y1--, z1++
      ) {
        if (add2(x, y1, z1)) {
          break;
        }
      }
    }
    return result;
  },

  getPerpendWays: function (game, cube_number, limit) {
    //var tools=this;
    var d = cube_number.split(":");
    var x = parseInt(d[0]);
    var y = parseInt(d[1]);
    var z = parseInt(d[2]);

    var result = [];
    if (typeof limit != "undefined") {
      //limited to one cell
      var add2 = function (x, y, z) {
        var d = [x, y, z].join(":");

        if (tools.ifWorldLimit(d, game) == false) return true;
        result.push(d);
        return true;
      };
    } else {
      var add2 = function (x, y, z) {
        var d = [x, y, z].join(":");

        if (tools.ifWorldLimit(d, game) == false) return true;
        result.push(d);

        if (tools.ifCellEmpty(game, d)) return true;
        else return false;
      };
    }
    //x\y
    for (
      x1 = x + 1, y1 = y + 1;
      x1 <= game.cube_size && y1 <= game.cube_size;
      x1++, y1++
    )
      if (add2(x1, y1, z)) break;
    for (x1 = x - 1, y1 = y - 1; x1 >= 1 && y1 >= 1; x1--, y1--)
      if (add2(x1, y1, z)) break;
    for (x1 = x + 1, y1 = y - 1; x1 <= game.cube_size && y1 >= 1; x1++, y1--)
      if (add2(x1, y1, z)) break;
    for (x1 = x - 1, y1 = y + 1; x1 >= 1 && y1 <= game.cube_size; x1--, y1++)
      if (add2(x1, y1, z)) break;
    //x\z
    for (
      x1 = x + 1, z1 = z + 1;
      x1 <= game.cube_size && z1 <= game.cube_size;
      x1++, z1++
    )
      if (add2(x1, y, z1)) break;
    for (x1 = x - 1, z1 = z - 1; x1 >= 1 && z1 >= 1; x1--, z1--)
      if (add2(x1, y, z1)) break;
    for (x1 = x + 1, z1 = z - 1; x1 <= game.cube_size && z1 >= 1; x1++, z1--)
      if (add2(x1, y, z1)) break;
    for (x1 = x - 1, z1 = z + 1; x1 >= 1 && z1 <= game.cube_size; x1--, z1++)
      if (add2(x1, y, z1)) break;
    //y/z
    for (
      z1 = z + 1, y1 = y + 1;
      z1 <= game.cube_size && y1 <= game.cube_size;
      z1++, y1++
    )
      if (add2(x, y1, z1)) break;
    for (y1 = y - 1, z1 = z - 1; y1 >= 1 && y1 >= 1; y1--, z1--)
      if (add2(x, y1, z1)) break;
    for (y1 = y + 1, z1 = z - 1; y1 <= game.cube_size && z1 >= 1; y1++, z1--)
      if (add2(x, y1, z1)) break;
    for (y1 = y - 1, z1 = z + 1; y1 >= 1 && z1 <= game.cube_size; y1--, z1++)
      if (add2(x, y1, z1)) break;
    return result;
  },

  getPawnDirectWays: function (game, cube_number, limit) {
    //tools=this;
    var d = cube_number.split(":");
    var x = parseInt(d[0]);
    var y = parseInt(d[1]);
    var z = parseInt(d[2]);
    const dir = game.dirs[game.tour];
    var result = [];
    var add_func = function (x, y, z) {
      var d = [x, y, z].join(":");
      if (tools.ifWorldLimit(d, game) == false) return true;
      result.push(d);
      return true;
    };

    /*
    for (var x1 = x + 1; x1 <= game.cube_size; x1++) {
      if (add_func(x1, y, z)) {
        break;
      }
    }
    for (var x1 = x - 1; x1 >= 1; x1--) {
      if (add_func(x1, y, z)) {
        break;
      }
    }*/
    //y
    if (dir == 0) {
      for (var y1 = y + 1; y1 <= game.cube_size; y1++) {
        if (add_func(x, y1, z)) {
          break;
        }
      }
    }
    if (dir == 1) {
      for (var y1 = y - 1; y1 >= 1; y1--) {
        if (add_func(x, y1, z)) {
          break;
        }
      }
    }
    //z
    if (dir == 0) {
      for (var z1 = z + 1; z1 <= game.cube_size; z1++) {
        if (add_func(x, y, z1)) {
          break;
        }
      }
    }
    if (dir == 1) {
      for (var z1 = z - 1; z1 >= 1; z1--) {
        if (add_func(x, y, z1)) {
          break;
        }
      }
    }

    return result;
  },

  getDirectWays: function (game, cube_number, limit) {
    //tools=this;
    var d = cube_number.split(":");
    var x = parseInt(d[0]);
    var y = parseInt(d[1]);
    var z = parseInt(d[2]);
    const result = [];

    if (typeof limit != "undefined") {
      //limited to one cell
      var add_func = function (x, y, z) {
        var d = [x, y, z].join(":");
        if (tools.ifWorldLimit(d, game) == false) return true;
        result.push(d);
        return true;
      };
    } else {
      //no limit
      var add_func = function (x, y, z) {
        var d = [x, y, z].join(":");

        if (tools.ifWorldLimit(d, game) == false) return true;
        result.push(d);

        if (tools.ifCellEmpty(game, d)) return true;
        else return false;
      };
    }
    //x

    for (var x1 = x + 1; x1 <= game.cube_size; x1++)
      if (add_func(x1, y, z)) break;
    for (var x1 = x - 1; x1 >= 1; x1--) if (add_func(x1, y, z)) break;
    //y
    for (var y1 = y + 1; y1 <= game.cube_size; y1++)
      if (add_func(x, y1, z)) break;
    for (var y1 = y - 1; y1 >= 1; y1--) if (add_func(x, y1, z)) break;
    //z
    for (var z1 = z + 1; z1 <= game.cube_size; z1++)
      if (add_func(x, y, z1)) break;
    for (var z1 = z - 1; z1 >= 1; z1--) if (add_func(x, y, z1)) break;

    return result;
  },

  figureWays: {
    pawn: function (game, cube_number) {
      //potencial ways
      var ways_direct = tools.getPawnDirectWays(game, cube_number, true);
      var ways_per = tools.getPawnPerpendWays(game, cube_number, true);

      return { move: ways_direct, war: ways_per };
    },

    king: function (game, cube_number) {
      //potencial ways
      var ways_direct = tools.getDirectWays(game, cube_number, true);
      var ways_per = tools.getPerpendWays(game, cube_number, true);
      ways_direct = ways_direct.concat(ways_per);
      return { move: ways_direct, war: ways_direct };
    },
    queen: function (game, cube_number) {
      var ways_direct = tools.getDirectWays(game, cube_number);
      var ways_per = tools.getPerpendWays(game, cube_number);
      ways_direct = ways_direct.concat(ways_per);
      return { move: ways_direct, war: ways_direct };
    },
    knight: function (game, cube_number) {
      //tools=this;
      var d = cube_number.split(":");
      var x = parseInt(d[0]);
      var y = parseInt(d[1]);
      var z = parseInt(d[2]);
      var result = { move: [], war: [] };
      var add2 = function (x, y, z) {
        var d = [x, y, z].join(":");
        //tools.ifCellEmpty(game,d)
        if (tools.ifWorldLimit(d, game) == true) {
          //if(tools.ifCellEmpty(game.data.world[d]))	{
          result.move.push(d);
        }
      };
      //x
      add2(x + 2, y + 1, z);
      add2(x + 2, y - 1, z);
      add2(x - 2, y + 1, z);
      add2(x - 2, y - 1, z);
      add2(x + 2, y, z + 1);
      add2(x + 2, y, z - 1);
      add2(x - 2, y, z + 1);
      add2(x - 2, y, z - 1);
      //y
      add2(x + 1, y + 2, z);
      add2(x - 1, y + 2, z);
      add2(x + 1, y - 2, z);
      add2(x - 1, y - 2, z);
      add2(x, y + 2, z + 1);
      add2(x, y + 2, z - 1);
      add2(x, y - 2, z + 1);
      add2(x, y - 2, z - 1);

      //z
      add2(x + 1, y, z + 2);
      add2(x - 1, y, z + 2);
      add2(x + 1, y, z - 2);
      add2(x - 1, y, z - 2);
      add2(x, y + 1, z + 2);
      add2(x, y - 1, z + 2);
      add2(x, y + 1, z - 2);
      add2(x, y - 1, z - 2);
      result.war = result.move;
      return result;
    },
    elephant: function (game, cube_number) {
      var ways = tools.getPerpendWays(game, cube_number);
      return { move: ways, war: ways };
    },
    castle: function (game, cube_number) {
      var ways = tools.getDirectWays(game, cube_number);
      return { move: ways, war: ways };
    },
  },

  getModel: function (game, it, what) {
    for (let m in game.data.models) {
      if (what == "cube" && game.data.models[m].cube_number == it)
        return game.data.models[m];
      if (what == "id" && game.data.models[m].id == it)
        return game.data.models[m];
    }
    return null;
  },

  prepare_new_game: function (users, cube_size) {
    for (var uid in users) {
      if (typeof users[uid].exit_game != "undefined")
        delete users[uid].exit_game;
    }
    return this.glob.world.get_figure_positions(users, cube_size);
  },

  chkMovePermission(game, to, from) {
    var to_model = this.getModel(game, to, "cube");
    var from_model = this.getModel(game, from, "cube");

    if (from_model == null) {
      return { result: false };
    }
    if (game.tour != from_model.uid) {
      return { result: false };
    }
    let fw = this.figureWays[from_model.figure](game, from_model.cube_number);
    if (to_model != null) {
      //attack
      if (
        to_model.uid.toString() == from_model.uid.toString() ||
        fw.war.includes(to) == false
      ) {
        return { result: false };
      }
    } else {
      //just move
      if (fw.move.includes(to) == false) {
        return { result: false };
      }
    }

    var new_game = tools.checkRiskiness(game, to, from_model.id);
    let chks = this.check_king_security(new_game, from_model.uid);
    if (chks.result == false) {
      return {
        result: false,
        error: "Cause for check situation from " + chks.figure,
      };
    }
    return { result: true };
  },

  move: function (from, to, game) {
    var permission = this.chkMovePermission(game, to, from);

    if (permission.result == true) {
      var from_model = this.getModel(game, from, "cube");
      var to_model = this.getModel(game, to, "cube");
      from_model.cube_number = to;
      var kill_model = 0;
      if (to_model != null) {
        kill_model = to_model.id;
        to_model.cube_number = 0;
      }
      game.tour = this.nextTour(game.tour, game.users);
      game.tour_time = this.now();
      return {
        result: true,
        kill_model: kill_model,
        active_model: from_model.id,
        error: "",
      };
    } else {
      return permission;
    }
  },
  nextTour: function (tour, users) {
    let uids = [];
    for (let u in users) if (users[u].status != 0) uids.push(u);
    var next_tour = uids.indexOf(tour) + 1;
    return typeof uids[next_tour] != "undefined" ? uids[next_tour] : uids[0];
  },

  startGame: function (w) {
    let game = this.bookingGames[w];
    const uids = Object.keys(game.users);
    const game_uniq_id = w + ":::" + uids.join(",") + ":::" + tools.now();

    game.tour = uids[0];
    game.start_time = this.now();
    game.status = 1;
    game.game_id = game_uniq_id;
    game.game_type = "multy";
    game.dirs = {};
    let dir = 0;
    const usersConnected = this.the_users.usersConnected;
    for (let uid in game.users) {
      usersConnected[uid].game_key = game_uniq_id;
      game.users[uid].status = 1;
      game.dirs[uid] = dir;
      dir = dir == 0 ? 1 : 0;
      //unselect users from another waiting lists
      for (let gkey in usersConnected[uid].bookingKeys) {
        if (gkey != w) {
          delete this.bookingGames[gkey].users[uid];
          if (Object.keys(this.bookingGames[gkey].users) == 0)
            delete this.bookingGames[gkey];
        }

        usersConnected[uid].socket.send(
          JSON.stringify({ action: "redirect2game", game_id: game_uniq_id })
        );
      }
      delete usersConnected[uid].bookingKeys;
    }

    game.data = tools.prepare_new_game(game.users, game.cube_size);

    tools.games[game_uniq_id] = game;
    delete tools.bookingGames[w];
    tools.the_users.sendToStartClients();
  },

  startSingleGame: function (user_id, cube_size, players_count) {
    user_id = parseInt(user_id);
    the_users = this.the_users;
    var game_key = cube_size + ":::" + players_count;

    var wgl = {
      users: {},
      cube_size: cube_size,
      players: players_count,
      game_type: "single",
      dirs: {},
      status: 1,
      animation_free: true,
      users_permitted: [parseInt(user_id)],
    };

    wgl["users"][user_id.toString()] = {
      role: the_users.usersConnected[user_id].data.role,
      status: 1,
    };
    wgl.users[0] = {
      role: "robot",
      status: 1,
    };

    const game_uniq_id =
      game_key + ":::" + Object.keys(wgl.users).join(",") + ":::" + this.now();
    wgl.tour = user_id;
    wgl.game_id = game_uniq_id;
    this.games[game_uniq_id] = wgl;
    var dir = 0;
    for (let uid in this.games[game_uniq_id].users) {
      if (uid == user_id) {
        this.glob.the_users.usersConnected[uid].game_key = game_uniq_id;
      }
      this.games[game_uniq_id].dirs[uid] = dir;
      dir = dir == 0 ? 1 : 0;
      //unselect users from another waiting lists

      if (parseInt(uid) == parseInt(user_id)) {
        for (let gkey in this.the_users.usersConnected[uid].bookingKeys) {
          delete this.bookingGames[gkey].users[uid];
          if (Object.keys(this.bookingGames[gkey].users) == 0)
            delete this.bookingGames[gkey];
        }
        delete this.the_users.usersConnected[uid].bookingKeys;
      }
    }

    this.glob.the_users.usersConnected[user_id].socket.send(
      JSON.stringify({ action: "redirect2game", game_id: game_uniq_id })
    );
    //tools.games[game_uniq_id].history_start = JSON.stringify(tools.games[game_uniq_id]); //history
    this.games[game_uniq_id].data = this.prepare_new_game(
      this.games[game_uniq_id].users,
      this.games[game_uniq_id].cube_size
    );

    delete wgl;
    this.glob.the_users.sendToStartClients();
  },

  leave_game: function (uid, game, reason) {
    console.log("leave_game", reason);
    game.users[uid].mat = reason;
    game.users[uid].status = -1;
    this.end_game(game, reason);
    game.users[uid].exit_game = true;

    this.the_users.sendToGameClient(uid, game, { action: "game_over" });
  },

  end_game: function (game, reason) {
    console.log("end_game", reason, game);
    tools = this;
    var live_users = {};
    for (var uid in game.users) {
      if (typeof game.users[uid].exit_game == "undefined") {
        live_users[uid] = game.users[uid];
      }
    }

    var data = { type: "leave" };

    for (var u in live_users) {
      if (typeof live_users[u].mat == "undefined") {
        game.users[u].winner = true;
        tools.games[game.game_id].winner = u;
        data.winner = u;
      } else {
        data.sess_id = u;
        data.uid = u;
      }
      if (game.users[u].status != -1) game.users[u].status = 0;
    }

    game.status = 0;

    game.end_time = tools.now();
    tools.checkemptygame(game);
    this.the_users.sendToGameClients(game, {
      action: "game_over",
      map: game.data,
    });
    return true;
    //}
  },

  bookingGame: function (uid, cube_size, players_count, to_uid) {
    the_users = this.glob.the_users;
    uid = parseInt(uid);
    const game_key =
      to_uid > 0
        ? uid + ":::" + cube_size + ":::" + players_count
        : cube_size + ":::" + players_count;

    if (typeof this.bookingGames[game_key] == "undefined") {
      this.bookingGames[game_key] = {
        users: {},
        cube_size: cube_size,
        players: players_count,
        game_id: game_key,
      };
    }
    if (typeof this.bookingGames[game_key].users[uid] == "undefined") {
      this.bookingGames[game_key].users[uid] = {
        userName: the_users.usersConnected[uid].data.userName,
        role: the_users.usersConnected[uid].data.role,
        status: 1,
      };
    }
    if (to_uid > 0) {
      if (typeof this.bookingGames[game_key].users_permitted == "undefined")
        this.bookingGames[game_key].users_permitted = [];
      this.bookingGames[game_key].users_permitted.push(parseInt(uid));
      this.bookingGames[game_key].users_permitted.push(parseInt(to_uid));
    }
    if (typeof the_users.usersConnected[uid].bookingKeys == "undefined")
      the_users.usersConnected[uid].bookingKeys = {};
    the_users.usersConnected[uid].bookingKeys[game_key] = 1;
  },
  acceptBookingGame: function (uid, game_key, to_uid) {
    if (typeof this.bookingGames[game_key] == "undefined") return;

    if (typeof this.bookingGames[game_key].users[uid] == "undefined")
      this.bookingGames[game_key].users[uid] = {
        userName: this.the_users.usersConnected[uid].data.userName,
        role: this.the_users.usersConnected[uid].data.role,
        status: 1,
      };

    if (typeof this.the_users.usersConnected[uid].bookingKeys == "undefined")
      this.the_users.usersConnected[uid].bookingKeys = {};
    this.the_users.usersConnected[uid].bookingKeys[game_key] = 1;
  },
  cancelBoookingGame: function (uid, game_key) {
    if (typeof this.bookingGames[game_key] != "undefined") {
      delete this.bookingGames[game_key].users[uid];
      if (Object.keys(this.bookingGames[game_key].users).length == 0)
        delete this.bookingGames[game_key];
    }
    if (
      typeof this.the_users.usersConnected[uid].bookingKeys[game_key] !=
      "undefined"
    )
      delete this.the_users.usersConnected[uid].bookingKeys[game_key];
    this.the_users.sendToStartClients();
  },

  ///////////
  check_king_security: function (game, uid) {
    let enemy = this.getOtherModels(game, uid);
    let models = this.getMyModels(game, uid);
    for (let m in models) {
      if (models[m].figure == "king") {
        var my_king = models[m].cube_number;
      }
    }
    let result = { result: true, figure: "" };
    for (let e in enemy) {
      var fw = this.figureWays[enemy[e].figure](game, enemy[e].cube_number);
      //SHAH!
      if (fw.war.includes(my_king)) {
        result = { result: false, figure: enemy[e].figure };
        break;
      }
    }
    return result;
  },
  checkRiskiness: function (game, cube_number, model_id) {
    var new_game = JSON.parse(JSON.stringify(game));
    var dest_model = this.getModel(new_game, cube_number, "cube");

    if (new_game.data.models[model_id] == null) return []; //if unknown
    new_game.tour = this.nextTour(game.tour, game.users);
    if (new_game.data.models[model_id].cube_number == 0) return []; //if deleted

    if (dest_model != null) new_game.data.models[dest_model.id].cube_number = 0;

    new_game.data.models[model_id].cube_number = cube_number;

    return new_game;
  },
  checkDefeat(game, uid) {
    var mat = true;
    let my_fig = this.getMyModels(game, uid);
    for (let cn in my_fig) {
      //if (my_fig[cn].cube_number != 0) {
      let fw = this.figureWays[my_fig[cn].figure](game, my_fig[cn].cube_number);

      for (let m in fw.war) {
        let new_game = this.checkRiskiness(game, fw.war[m], my_fig[cn].id);
        let chks = this.check_king_security(new_game, uid);
        if (chks.result == true) mat = false;
      }
      for (let m in fw.move) {
        let new_game = this.checkRiskiness(game, fw.move[m], my_fig[cn].id);
        let chks = this.check_king_security(new_game, uid);
        if (chks.result == true) mat = false;
      }

      //}
    }
    return mat;
  },

  checkemptygame: function (game) {
    var live_user = 0;
    for (var uid in game.users) {
      if (game.users[uid].role != "robot" && game.users[uid].status == 1) {
        //The game play only robots!, remove game
        live_user++;
      }
    }
    if (game.game_type == "multy") {
      if (live_user < 2) {
        this.the_users.sendToGameClients(game, {
          action: "game_over",
          map: game.data,
        });
        delete tools.games[game.game_id];
        delete game;
        return false;
      } else {
        return true;
      }
    } else {
      //single game
      if (live_user == 0) {
        delete tools.games[game.game_id];
        delete game;
        return false;
      } else {
        return true;
      }
    }
  },

  checkGameStatus: function (game) {
    this.checkBattleRoyal(game);

    the_users = this.the_users;
    if (this.checkemptygame(game) == false) {
      return false;
    }

    var figures = {};
    for (let id in game.data.models) {
      if (game.data.models[id].cube_number != 0) {
        if (typeof figures[game.data.models[id].uid] == "undefined")
          figures[game.data.models[id].uid] = {};
        figures[game.data.models[id].uid][game.data.models[id].cube_number] = {
          id: id,
          figure: game.data.models[id].figure,
        };
      }
    }

    for (let uid in figures) {
      var shah_my = this.check_king_security(game, uid);
      if (shah_my.result == false) {
        game.users[uid].shah = "_is_shah";
      } else if (
        typeof game.users[uid] != "undefined" &&
        typeof game.users[uid].shah != "undefined"
      ) {
        delete game.users[uid].shah;
        if (game.users[uid].shahSent != undefined)
          delete game.users[uid].shahSent;
        //check if move possible
      }
      var mat = this.checkDefeat(game, uid);
      if (mat) {
        game.users[uid].mat = "_is_mat";
        //game.status = 0;
        this.end_game(game, "_is_mat");
        return false;
      }
    }
    return true;
  },

  getCubeExts(cubesExist, x, y, z) {
    if (typeof cubesExist[x] == "undefined") return false;
    if (typeof cubesExist[x][y] == "undefined") return false;
    if (typeof cubesExist[x][y][z] == "undefined") return false;
    return cubesExist[x][y][z];
  },

  checkBattleRoyal(game) {
    let mins = [];
    let maxs = [];

    let cubesExist = {};
    let cubesToRemove = {
      xy: { min: [], max: [] },
      xz: { min: [], max: [] },
      yz: { min: [], max: [] },
    };
    let empty = {
      xy: { min: true, max: true },
      xz: { min: true, max: true },
      yz: { min: true, max: true },
    };

    for (let w in game.data.world) {
      let cube = game.data.world[w].split(":");
      for (let i = 0; i < 3; i++) {
        cube[i] = parseInt(cube[i]);
      }
      if (typeof cubesExist[cube[0]] == "undefined") cubesExist[cube[0]] = {};
      if (typeof cubesExist[cube[0]][cube[1]] == "undefined")
        cubesExist[cube[0]][cube[1]] = {};
      if (typeof cubesExist[cube[0]][cube[1]][cube[2]] == "undefined")
        cubesExist[cube[0]][cube[1]][cube[2]] = game.data.world[w];

      for (let i = 0; i < 3; i++) {
        if (typeof mins[i] == "undefined" || cube[i] < mins[i])
          mins[i] = cube[i];
        if (typeof maxs[i] == "undefined" || cube[i] > maxs[i])
          maxs[i] = cube[i];
      }
    }

    for (let x = mins[0]; x <= maxs[0]; x++) {
      for (let y = mins[1]; y <= maxs[1]; y++) {
        let cubeMin = this.getCubeExts(cubesExist, x, y, mins[2]);
        if (cubeMin != false) {
          if (this.getModel(game, cubeMin, "cube") != null) {
            empty.xy.min = false;
          } else {
            cubesToRemove.xy.min.push(cubeMin);
          }
        }

        let cubeMax = this.getCubeExts(cubesExist, x, y, maxs[2]);
        if (cubeMax != false) {
          if (this.getModel(game, cubeMax, "cube") != null) {
            empty.xy.max = false;
          } else {
            cubesToRemove.xy.max.push(cubeMax);
          }
        }
      }
    }

    //test xz
    for (let x = mins[0]; x <= maxs[0]; x++) {
      for (let z = mins[2]; z <= maxs[2]; z++) {
        let cubeMin = this.getCubeExts(cubesExist, x, mins[1], z);
        if (cubeMin != false) {
          if (this.getModel(game, cubeMin, "cube") != null) {
            empty.xz.min = false;
          } else {
            cubesToRemove.xz.min.push(cubeMin);
          }
        }

        let cubeMax = this.getCubeExts(cubesExist, x, maxs[1], z);
        if (cubeMax != false) {
          if (this.getModel(game, cubeMax, "cube") != null) {
            empty.xz.max = false;
          } else {
            cubesToRemove.xz.max.push(cubeMax);
          }
        }
      }
    }
    //test yz
    for (let y = mins[1]; y <= maxs[1]; y++) {
      for (let z = mins[2]; z <= maxs[2]; z++) {
        let cubeMin = this.getCubeExts(cubesExist, mins[0], y, z);
        if (cubeMin != false) {
          if (this.getModel(game, cubeMin, "cube") != null) {
            empty.yz.min = false;
          } else {
            cubesToRemove.yz.min.push(cubeMin);
          }
        }

        let cubeMax = this.getCubeExts(cubesExist, maxs[0], y, z);
        if (cubeMax != false) {
          if (this.getModel(game, cubeMax, "cube") != null) {
            empty.yz.max = false;
          } else {
            cubesToRemove.yz.max.push(cubeMax);
          }
        }
      }
    }
    let removeCubes = [];
    const parts = [
      ["xy", "min"],
      ["xy", "max"],
      ["xz", "min"],
      ["xz", "max"],
      ["yz", "min"],
      ["yz", "max"],
    ];
    for (let p in parts) {
      //empty.yz.max
      if (empty[parts[p][0]][parts[p][1]]) {
        removeCubes = removeCubes.concat(
          cubesToRemove[parts[p][0]][parts[p][1]]
        );
      }
    }

    if (removeCubes.length > 0) {
      //clear from world
      let newWorld = [];
      for (let w in game.data.world) {
        if (removeCubes.includes(game.data.world[w]) == false) {
          newWorld.push(game.data.world[w]);
        }
      }
      this.games[game.game_id].data.world = newWorld;

      this.the_users.sendToGameClients(game, {
        action: "remove_cubes",
        world: game.data.world,
        cubes: removeCubes,
      });
    }
  },

  selectfiguremarkers: function (game, active_model) {
    var markers = [];
    //var active_model = tools.getModel(game, model_id, 'id');
    if (active_model == "null" || active_model.cube_number == 0) return;
    cube_number = active_model.cube_number;

    markers.push({ color: "blue", cube_number: cube_number, flag: 0 });

    var ways = this.figureWays[active_model.figure](game, cube_number);

    for (var p in ways.move) {
      var model = this.getModel(game, ways.move[p], "cube");
      if (model == null) {
        markers.push({ color: "yellow", cube_number: ways.move[p], flag: 1 });
      }
    }

    for (var w in ways.war) {
      var model = this.getModel(game, ways.war[w], "cube");
      if (
        model != null &&
        model.cube_number != 0 &&
        model.uid != active_model.uid
      ) {
        markers.push({ color: "red", cube_number: ways.war[w], flag: 1 });
      }
    }
    return markers;
  },

  getOtherModels(game, myUid) {
    if (typeof myUid == "undefined") myUid = game.tour;
    var models = [];
    for (let id in game.data.models) {
      if (
        game.data.models[id].uid != myUid &&
        game.data.models[id].cube_number != 0
      ) {
        models.push(game.data.models[id]);
      }
    }
    return models;
  },
  getMyModels(game, myUid) {
    if (typeof myUid == "undefined") myUid = game.tour;
    var models = [];
    for (let id in game.data.models) {
      if (
        game.data.models[id].uid == myUid &&
        game.data.models[id].cube_number != 0
      ) {
        models.push(game.data.models[id]);
      }
    }
    return models;
  },

  shuffle: function (array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },

  checkBookingGames: function () {
    //send waiting game to active
    for (const w in this.bookingGames) {
      if (
        this.bookingGames[w].players <=
        Object.keys(this.bookingGames[w].users).length
      ) {
        this.startGame(w);
      }
    }
  },

  now: function () {
    return Math.floor(new Date() / 1000);
  },

  getActiveGame: function (user_id) {
    const user = this.glob.the_users.usersConnected[user_id];
    if (typeof user == "undefined") return false;

    if (
      typeof user.game_key == "undefined" ||
      typeof this.games[user.game_key] == "undefined"
    ) {
      if (typeof user.socket != "undefined")
        user.socket.send(
          JSON.stringify({ status: 0, action: "redirect2home" })
        );
      return false;
    }
    const game = this.games[user.game_key];
    if (game.status == 0) {
      this.glob.the_users.sendToGameClient(user_id, game, {
        action: "game_over",
        world: game.data.world,
      });
      return false;
    }

    return game;
  },

  botService() {
    tools = this;
    for (var w in tools.games) {
      var game = tools.games[w];
      if (game.status == 0 && game.end_time < day_before) {
        //delete old game
        delete tools.games[w];
      } else if (
        game.status == 1 &&
        game.game_type == "single" &&
        game.users[game.tour].role == "robot"
      ) {
        tools.glob.bot.botAction(game, w); //bot go single game
      }
    }
  },
};
