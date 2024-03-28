"use strict";
import lang from "/scripts/lang/en.js";
import { uk } from "/scripts/helper.js";

var e = React.createElement;

class StatusTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      count_connected: 0,
      count_waiting_users: "0",
      count_active_games: 0,
      count_active_users: 0,
    };
    UI.StatusTable = this;
  }

  chg(data) {
    this.state = {
      count_connected: data.count_connected,
      count_waiting_users: data.count_waiting_users,
      count_active_games: data.count_active_games,
      count_active_users: data.count_active_users,
    };

    this.setState(this.state);
  }

  render() {
    return e(
      "div",
      { id: "status_table", key: uk() },
      e(
        "a",
        {
          href: "mailto:paradoxchess@gmail.com",
          style: { float: "left", color: "white", textDecoration: "none" },
          key: "status_table_email",
        },
        "paradoxchess@gmail.com"
      ),

      e(
        "span",
        { id: "connected_nonauth", key: uk() },
        e("label", { key: "status_table_users_now" }, lang.users_now + ": "),
        e(
          "span",
          { id: "count_connected2", key: uk() },
          this.state.count_connected
        ),
        e(
          "label",
          { className: "hide_on_mobile", key: uk() },
          "  " + lang.in_game + ": "
        ),
        e(
          "span",
          {
            id: "count_active_players",
            className: "hide_on_mobile",
            key: uk(),
          },
          this.state.count_active_users
        ),
        e(
          "span",
          { className: "hide_on_mobile", key: uk() },
          "  " + lang.games_now + ": ",
          e(
            "span",
            { id: "count_active_games", key: uk() },
            this.state.count_active_games
          )
        )
      )
    );
  }
}

class Parent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user,
    };
  }

  render() {
    return [
      e(
        "h1",
        { className: "main_title", key: uk() },
        e("font", { className: "l1", key: uk() }, "P"),
        e("font", { className: "l2", key: uk() }, "A"),
        e("font", { className: "l3", key: uk() }, "R"),
        e("font", { className: "l4", key: uk() }, "A"),
        e("font", { className: "l5", key: uk() }, "D"),
        e("font", { className: "l6", key: uk() }, "O"),
        e("font", { className: "l7", key: uk() }, "X"),
        e("font", { key: uk() }, "Chess")
      ),
      e("div", { className: "scrollable", key: uk() }, e(WaitGameForm)),
      e(
        "span",
        {
          id: "menu_toggle",
          key: uk(),
          onClick: () => UI.left_menu.left_menu_toggle(),
        },
        lang.menu
      ),
      e(left_menu, { key: uk() }),
      e(StatusTable, { key: uk() }),
    ];
  }
}

class left_menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show_mem: 0, show: 0 };
    UI.left_menu = this;
  }
  left_menu_toggle() {
    this.state.show = this.state.show == 0 ? 1 : 0;
    this.setState(this.state);
  }
  chg(data) {
    if (data.role == "guest") this.state.show_mem = 0;
    else this.state.show_mem = 1;
    this.setState(this.state);
  }

  render() {
    var menu = [];

    menu.push(e("a", { href: `/guide/`, key: uk() }, lang.how_to_play));
    menu.push(e("a", { href: `/rules/`, key: uk() }, lang.game_rules));
    menu.push(
      e(
        "a",
        { href: "mailto:paradoxchess@gmail.com?subject=Bug", key: uk() },
        lang.report_bug
      )
    );

    if (lang.url != "") menu.push(e("a", { href: "/", key: uk() }, "English"));

    return e(
      "div",
      {
        id: "left_menu",
        className: this.state.show == 0 ? "" : "menu_open",
        key: uk(),
      },
      menu
    );
  }
}

class WaitGameForm extends React.Component {
  constructor(props) {
    super(props);
    this.ownGames = [];

    this.state = {
      game_type: 0,
      cube_size: 0,
      players_count: "2",
      with_user: 0,
      gameOffers: {},
      gameOffersCount: 0,
      count_connected: 0,
      own_games: {},
    };
    UI.WaitGameForm = this;
  }
  chg(data) {
    if (typeof data.bookingGames != "undefined") {
      this.ownGames = [];

      this.state.gameOffers = {};
      this.state.gameOffersCount = 0;
      for (let k in data.bookingGames) {
        var cubeSize = data.bookingGames[k].cube_size;
        var players = data.bookingGames[k].players;
        if (typeof data.bookingGames[k].users[window.user_id] != "undefined")
          this.ownGames.push(data.bookingGames[k].cube_size);

        if (typeof this.state.gameOffers[cubeSize] == "undefined")
          this.state.gameOffers[cubeSize] = { players: {}, count: 0 };

        var usersCount = Object.keys(data.bookingGames[k].users).length;

        this.state.gameOffers[cubeSize].players[players] = usersCount;
        this.state.gameOffers[cubeSize].count += usersCount;
        this.state.gameOffersCount += usersCount;
      }
      this.state.count_connected = parseInt(data.count_connected);

      var ownGames = Object.keys(data.own_games);
      this.state.own_games = {};
      for (var w in ownGames) {
        var ow = ownGames[w].split(":::");
        if (typeof this.state.own_games[ow[0]] == "undefined")
          this.state.own_games[ow[0]] = {};
        this.state.own_games[ow[0]][ow[1]] = 1;
      }

      this.setState(this.state);
    }
  }
  chg_menu(what, val) {
    this.state[what] = val;
    if (what == "cube_size" && this.multiplayers_possible()) {
      this.state.players_count = 2;
    }
    this.setState(this.state);
  }
  startGame(cube_size, game_type) {
    this.state.players_count = 2;
    this.state.cube_size = cube_size;
    this.state.game_type = game_type;
    this.setState(this.state);
    this.register_game();
  }
  back() {
    this.chg_menu("game_type", "");
    this.chg_menu("with_user", 0);
  }
  back2() {
    this.chg_menu("cube_size", 0);
  }
  requestGame(extra) {
    var args = {
      action: "want_to_play",
      cube_size: this.state.cube_size,
      players_count: this.state.players_count,
      game_type: this.state.game_type,
    };
    for (var e in extra) args[e] = extra[e];

    UI.send2(args);

    this.state.cube_size = 0;
    this.state.players_count = 0;
    this.state.game_type = 0;
  }
  multiplayers_possible() {
    return false;
    if (["4", "41"].indexOf(this.state.cube_size) != -1) return false;
    else return true;
  }
  register_game() {
    UI.WaitGameForm.requestGame(
      this.state.with_user != 0 ? { user_id: this.state.with_user } : null
    );
    this.back();
  }
  chg_players_count(players_count) {
    this.chg_menu("players_count", players_count);
  }
  cancel(e) {
    UI.send2({
      gkey: e,
      action: "want_to_cancel",
    });
  }
  render() {
    var result = [];
    var form = [];
    var gameType = this.state.game_type;
    var cubeSize = this.state.cube_size;
    var playersCount = this.state.players_count;
    result.push(
      e(
        "div",
        { className: "form_row1", key: uk() },
        e("img", {
          src: `/images/logo.png`,
          width: 100,
          style: { float: "left", key: uk() },
        }),
        lang.greeting_1,
        e("br", { key: uk() }),
        e("br", { key: uk() }),
        lang.greeting_3,
        e("br", { key: uk() }),
        e("br", { key: uk() }),
        e(
          "div",
          { className: "form_row1", key: uk() },
          this.state.count_connected < 2
            ? e(
                "span",
                { className: "no_users", key: uk() },
                lang.no_users_online
              )
            : null
        ),
        e("br"),
        e("br")
      )
    );

    if (this.state.count_connected > 1) {
      let rows1 = [
        e(
          "label",
          { className: "form_label2", key: uk() },
          `Play online (${this.state.count_connected} online)`
        ),
      ];
      for (let i in UI.gameTypes) {
        let id = UI.gameTypes[i].id;

        rows1.push(
          e(
            "span",
            {
              className:
                "form_row_opt3 " +
                (this.state.own_games[id] != undefined ? "own" : ""),
              key: `cube_span${i}`,
              name: "cube_size",
              val: id,
              onClick: (e) =>
                this.chg_menu("cube_size", e.target.getAttribute("val")),
            },
            UI.gameTypes[i].title,
            e("img", {
              src: `/images/game_types/${UI.gameTypes[i].id}.gif`,
              key: `cube_img${i}`,
              val: UI.gameTypes[i].id,
              onClick: (e) =>
                this.startGame(e.target.getAttribute("val"), "multy"),
            }),
            this.ownGames.indexOf(id) != -1
              ? e(
                  "button",
                  {
                    className: "cancel_btn",
                    key: `cube_cancel${i}`,
                    style: { float: "none" },
                    gkey: id + ":::2",
                    onClick: (e) => this.cancel(e.target.getAttribute("gkey")),
                  },
                  lang.cancel
                )
              : null,
            this.ownGames.indexOf(id) == -1 &&
              typeof this.state.gameOffers[id] != "undefined"
              ? e(
                  "span",
                  { className: "offer", key: `cube_offer${i}` },
                  this.state.gameOffers[id].count + " " + lang.offers
                )
              : null
          )
        );
      }
      form.push(e("div", { className: "select_board", key: uk() }, rows1));
    }
    let rows = [
      e("label", { className: "form_label2", key: uk() }, "Play with computer"),
    ];
    for (let i in UI.gameTypes) {
      let id = UI.gameTypes[i].id;
      rows.push(
        e(
          "span",
          {
            className:
              "form_row_opt3 " +
              (gameType == "multy" && this.state.own_games[id] != undefined
                ? "own"
                : ""),
            name: "cube_size",
            key: `cube_size${i}`,
            val: id,
            onClick: (e) =>
              this.chg_menu("cube_size", e.target.getAttribute("val")),
          },
          UI.gameTypes[i].title,
          e("img", {
            src: `/images/game_types/${id}.gif`,
            val: id,
            key: `cube_size_image${i}`,
            onClick: (e) =>
              this.startGame(e.target.getAttribute("val"), "single"),
          }),

          gameType == "multy" && this.state.gameOffers[id] != undefined
            ? e(
                "span",
                { className: "offer", key: `cube_size_offser${i}` },
                this.state.gameOffers[id].count + " " + lang.offers
              )
            : null
        )
      );
    }
    form.push(e("div", { className: "select_board", key: uk() }, rows));

    result.push(e("div", { className: "form_row1", key: uk() }, form));
    //  }
    //return result;
    return e("div", { id: "wait_game_form", key: uk() }, result);
  }
}

class start_page extends React.Component {
  constructor(prop) {
    super();

    window.mdkey = getUserKey();

    if (typeof window.mdkey == "undefined") {
      window.mdkey = makeid(16);
      saveUserKey(window.mdkey);
    }

    window.UI = this;
    window.UI.config = get_config();
    window.UI.mdkey = window.mdkey;
    this.init_sockets();
    this.gameTypes = [
      { id: "4", title: "4^3 = 64 cells", players: "(2 " + lang.players + ")" },
      {
        id: "6",
        title: "6^3 = 216 cells",
        players: "(2 " + lang.players + ")",
      },
    ];
  }
  init_sockets() {
    // Create WebSocket connection.
    var socket = io();
    socket.auth = {
      token: this.mdkey,
      page: "start",
    };

    socket.on("connect", () => {
      console.log("Socket open", socket);
      this.send2({ action: "load" });
      socket.on("message", (data) => {
        data = JSON.parse(data);
        console.log("message ", data);
        this.user_id = data.uid;

        if (
          typeof data.action != "undefined" &&
          data.action == "redirect2game"
        ) {
          redirect("/game/");
          return;
        }
        this.update(data);
      });
    });
    window.socket = socket;
  }
  action_set_key(data) {
    console.log("action_set_key", data.key);
    window.mdkey = this.mdkey = data.key;
    saveUserKey(window.mdkey);
  }

  send2(args) {
    args.page = "start";
    args.mdkey = window.mdkey;
    console.log("send2", args);
    window.socket.emit("message", JSON.stringify(args));
  }

  iwantplay_too(gkey) {
    this.send2({
      action: "want_to_play_too",
      gkey: gkey,
    });
  }

  update(data) {
    this.data = data;
    UI.StatusTable.chg(data);
    UI.WaitGameForm.chg(data);
    UI.left_menu.chg(data);
    if (
      typeof data.action != "undefiend" &&
      typeof UI["action_" + data.action] == "function"
    ) {
      UI["action_" + data.action](data);
    }
  }
  render() {
    window.mdkey = getUserKey();

    if (typeof window.mdkey == "undefined") {
      window.mdkey = makeid(16);
      saveUserKey(window.mdkey);
    }
    return [e(Parent, { key: uk() })];
  }
}

var Start = function () {
  const root = ReactDOM.createRoot(document.querySelector("#main"));
  root.render(React.createElement(start_page));
};

export { Start };
