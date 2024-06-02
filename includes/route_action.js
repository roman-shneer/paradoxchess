module.exports = {
  glob: null,

  start_load: function (data) {
    this.glob.the_users.sendToStartClients();
  },
  start_want_to_play_too: function (data) {
    this.glob.tools.acceptBookingGame(data.user_id, data.message.gkey);
    this.glob.the_users.sendToStartClients();
    this.glob.tools.checkBookingGames();
  },

  start_want_to_play: function (data) {
    message = data.message;
    if (message.game_type == "multy")
      this.glob.tools.bookingGame(
        data.user_id,
        message.cube_size,
        message.players_count,
        typeof message.user_id != "undefined" ? message.user_id : 0
      );
    if (message.game_type == "single")
      this.glob.tools.startSingleGame(
        data.user_id,
        message.cube_size,
        message.players_count
      );
    this.glob.the_users.sendToStartClients();
    this.glob.tools.checkBookingGames();
  },

  start_want_to_cancel: function (data) {
    tools = this.glob.tools;
    this.glob.tools.cancelBoookingGame(data.user_id, data.message.gkey);
  },

  //game routes
  game_select_figure: function (data) {
    const game = this.glob.tools.getActiveGame(data.user_id);

    if (game == false) return false;
    message = data.message;

    let myModel = this.glob.tools.getModel(game, message.model_id, "id");
    var markers = this.glob.tools.selectfiguremarkers(game, myModel);
    this.glob.the_users.sendToGameClients(game, {
      action: "select_figure",
      select_markers: markers,
    });
  },

  game_exit_game: function (data) {
    game = this.glob.tools.getActiveGame(data.user_id);
    if (game == false) return false;
    this.glob.tools.leave_game(data.user_id, game, "Leaved game");
  },

  game_select_green: function (data) {
    game = this.glob.tools.getActiveGame(data.user_id);
    if (game == false) return false;
    console.log("xxxx", data);
    message = data.message;
    this.glob.the_users.sendToGameClients(game, {
      action: "select_green",
      cube_number: message.cube_number,
    });
  },

  game_select_none: function (data) {
    let game = this.glob.tools.getActiveGame(data.user_id);
    if (game == false) return false;
    this.glob.the_users.sendToGameClients(data.user_id, game, {
      action: "select_none",
    });
  },

  game_move: function (data) {
    const game = this.glob.tools.getActiveGame(data.user_id);
    if (game == false) return false;
    message = data.message;
    if (game.tour != data.user_id) {
      return;
    }
    var move_res = this.glob.tools.move(
      message.active_cube,
      message.action_cube,
      game
    );
    if (move_res.result == true) {
      this.glob.tools.checkGameStatus(game);
      var answer = {
        action: "move",
        move: {
          from: message.active_cube,
          to: message.action_cube,
          kill_model: move_res.kill_model,
          active_model: move_res.active_model,
        },
      };

      this.glob.the_users.sendToGameClients(game, answer, true);
      if (game.game_type == "single") {
        this.glob.tools.botService();
      }
      return;
    } else {
      this.glob.the_users.sendToGameClient(data.user_id, game, {
        info: move_res.error,
      });
      return;
    }
  },
  /*
    game_debug:function (data){
        console.log(data);
    },
    other_debug:function (data){
        console.log(data.data);
    },
*/
};
