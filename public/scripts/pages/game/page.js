"use strict";
import lang from "/scripts/lang/en.js";
import GAME from "./game.js";
import { uk } from "/scripts/helper.js";

class game_options extends React.Component {
  constructor(props) {
    super(props);
    var user_options = localStorage.getItem("user_options");
    this.defaultPlayersColors = ["#7F00FF", "#00FF55", "#FF552A", "#557FFF"];

    if (user_options == null) {
      var user_options = {
        theme: "0",
        nosound: false,
        vr: false,
        colors: this.defaultPlayersColors,
        line_color: "#0000FF",
      };
      localStorage.setItem("user_options", JSON.stringify(user_options));
    } else {
      user_options = JSON.parse(user_options);
    }

    this.state = {};
    this.state.user_options = user_options;
    this.state.show = 0;

    this.state.userColors = {};
    this.ucolorRefs = {};
    this.lineColorRef = React.createRef();

    Game_UI.game_options = this;
  }

  addMissingColors() {
    var usersCount = Object.keys(Game_UI.users).length;

    if (this.state.user_options.colors.length < usersCount) {
      for (var u in this.defaultPlayersColors) {
        if (
          this.state.user_options.colors.includes(
            this.defaultPlayersColors[u]
          ) == false
        ) {
          this.state.user_options.colors.push(this.defaultPlayersColors[u]);
          if (this.state.user_options.colors.length == usersCount) break;
        }
      }
      localStorage.setItem(
        "user_options",
        JSON.stringify(this.state.user_options)
      );
      this.setState(this.state);
    }
    //
  }

  componentDidUpdate() {
    for (var i in this.ucolorRefs) {
      if (this.ucolorRefs[i].current != null)
        new jscolor(this.ucolorRefs[i].current);
    }
    if (this.lineColorRef.current != null)
      new jscolor(this.lineColorRef.current);
  }

  handleChange(name, value) {
    this.state.user_options[name] = value;
  }

  applyChanges() {
    //get colors from jscolor elements
    this.state.user_options.colors = [];
    for (var uid in this.ucolorRefs) {
      this.state.userColors[uid] = this.ucolorRefs[uid].current.value;
      this.state.user_options.colors.push(
        "#" + this.ucolorRefs[uid].current.value
      );
    }
    this.state.user_options.line_color = "#" + this.lineColorRef.current.value;
    localStorage.setItem(
      "user_options",
      JSON.stringify(this.state.user_options)
    );
    window.reload();
  }
  exit_game() {
    if (confirm(lang.wanna_leave_game)) {
      Game_UI.send2({ action: "exit_game" });
      setTimeout(function () {
        redirect("/");
      }, 300);
    }
  }

  renderColorPicker(uid) {
    this.ucolorRefs[uid] = React.createRef();
    this.state.userColors[uid] = Game_UI.user_color(uid);
    return e(
      "input",
      {
        className: "jscolor {valueElement:'color" + uid + "'}",
        key: "color" + uid,
        id: "color" + uid,
        name: "color" + uid,
        defaultValue: this.state.userColors[uid],
        uid: uid,
        ref: this.ucolorRefs[uid],
      },
      null
    );
  }

  render() {
    if (this.state.show == 0) return null;

    this.addMissingColors();
    var colors = [e("label", { key: uk() }, lang.player_colors)];
    colors.push(this.renderColorPicker(Game_UI.user_id));
    for (var uid in Game_UI.users) {
      if (uid != Game_UI.user_id) colors.push(this.renderColorPicker(uid));
    }
    return e(
      "div",
      { id: "game_options", key: uk() },
      e("div", { key: uk() }, colors),
      e(
        "div",
        { key: uk() },
        e("label", null, lang.line_color + ":"),
        e(
          "input",
          {
            className: "jscolor {valueElement:'line_color'}",
            name: "line_color",
            key: uk(),
            id: "line_color",
            defaultValue: this.state.user_options.line_color,
            ref: this.lineColorRef,
          },
          null
        )
      ),
      e(
        "button",
        { onClick: () => this.applyChanges(), key: uk() },
        lang.apply_changes
      ),
      e(
        "button",
        { id: "exit_game_btn", onClick: () => this.exit_game(), key: uk() },
        lang.leave_game
      )
    );
  }
}

class game_menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_chat: 0,
      messages: [],
      unselect_show: 0,
      chat_button_color: "chatbtn_green",
    };
    Game_UI.game_menu = this;
    this.GAME = Game_UI.GAME;
  }

  unselect() {
    this.GAME.clear_marked_cubes();
    Game_UI.send2({ action: "select_none" });
  }

  render() {
    return e(
      "div",
      { id: "game_menu" },
      this.state.unselect_show == 1
        ? e(
            "button",
            { id: "unselect_btn", key: uk(), onClick: () => this.unselect() },
            lang.unselect
          )
        : null
    );
  }
}

//menu toggle button
class menu_toggle extends React.Component {
  toggle_game_options() {
    if (Game_UI.game_options.state.show == 0) {
      Game_UI.game_options.state.show = 1;
      Game_UI.game_options.setState(Game_UI.game_options.state);
    } else {
      Game_UI.game_options.state.show = 0;
      Game_UI.game_options.setState(Game_UI.game_options.state);
    }
    //
  }
  render() {
    return e("img", {
      src: "/images/menu.png",
      id: "game_options_button",
      key: "menu_toggle",
      onClick: () => this.toggle_game_options(),
    });
  }
}

class Log extends React.Component {
  constructor() {
    super();
    this.state = { log: {} };
    Game_UI.Log = this;
  }
  add(arg) {
    this.state.log = arg;
    this.setState(this.state);
  }
  render() {
    if (Object.keys(this.state.log).length == 0) return null;

    var dLogs = [];
    var span1 = e(
      "span",
      { style: { background: this.state.log.from_color }, key: "log1" },
      e("img", {
        src: "/images/icons/" + this.state.log.from_figure + ".png",
        width: 20,
      }),
      "(" + this.state.log.from + ")"
    );
    if (
      typeof this.state.log.to_uid != "undefined" &&
      this.state.log.to_uid != null
    ) {
      var span2 = e(
        "span",
        { style: { background: this.state.log.to_color }, key: "log2" },
        e("img", {
          src: "/images/icons/" + this.state.log.to_figure + ".png",
          width: 20,
        }),
        "(" + this.state.log.to + ")"
      );
    } else {
      var span2 = e("span");
    }
    dLogs.push(e("div", { className: "log_row", key: "log3" }, span1, span2));
    return e("div", { id: "log", key: "log4" }, dLogs);
  }
}

class WaitingClock extends React.Component {
  constructor() {
    super();
    this.state = { show: 0 };
    Game_UI.WaitingClock = this;
  }
  render() {
    if (this.state.show == 0) return null;

    return e("img", {
      src: "/images/timer.gif",
      id: "timer",
      key: "WaitingClock",
    });
  }
}
class Parent extends React.Component {
  constructor() {
    super();
    this.canvasRef = React.createRef();
    Game_UI.Parent = this;
  }

  render() {
    return e("div", { key: uk() }, [
      e(WaitingClock, { key: "WaitingClock" }),
      e("div", { id: "bar", key: uk() }, e(game_menu)),
      e(Log, { key: uk() }),
      e("div", { id: "game_bar", key: uk() }),
      e(menu_toggle, { key: uk() }),
      e(game_options, { key: uk() }),
      e("canvas", { id: "canvas", ref: this.canvasRef, key: uk() }),
    ]);
  }
}

const e = React.createElement;

class game_page extends React.Component {
  constructor() {
    super();
    this.GAME = window.GAME;

    window.mdkey = getUserKey();

    if (typeof window.mdkey == "undefined") {
      window.mdkey = makeid(16);
      saveUserKey(window.mdkey);
    }
    this.init_status = 0;
    this.data = {};
    window.Game_UI = this;

    this.config = get_config();
    this.mdkey = window.mdkey;

    this.init_sockets();
  }

  init_sockets() {
    // Create WebSocket connection.
    var socket = io();
    socket.auth = {
      token: this.mdkey,
      page: "game",
    };
    socket.on("connect", () => {
      socket.on("message", (data) => {
        data = JSON.parse(data);

        if (typeof data.winner != "undefined") this.winner = data.winner;

        if (this.init_status == 1) this.update(data);
        if (typeof data.action != "undefined")
          this["action_" + data.action](data);

        if (typeof data.error != "undefined" && data.error.length > 0) {
          message_alert(data.error);
        }
      });
    });
    window.socket = socket;
  }
  send2(args) {
    args.page = "game";
    args.mdkey = window.mdkey;

    window.socket.emit("message", JSON.stringify(args));
  }
  render() {
    return e(Parent);
  }
  start(info) {
    window.send2 = Game_UI.send2;
    Game_UI.init_status = 1;
    this.GAME.init(Game_UI.cube_size, Game_UI.world, info);
  }

  update(data) {
    if (["select_figure"].includes(data.action) == false) {
      if (typeof data.info != "undefined") {
        this.GAME.draw_info(data.info);
      }
    }
  }
  action_remove_cubes(data) {
    for (let c in data.cubes) {
      this.GAME.flyCube(data.cubes[c]);
    }
    Game_UI.world = data.world;
  }
  send2(args) {
    args.page = "game";
    args.mdkey = Game_UI.mdkey;
    if (typeof args.action_cube != "undefined") {
      args.active_cube = window.active_cube;
      delete window.action_cube;
    }

    window.socket.emit("message", JSON.stringify(args));
  }
  action_game_over(data) {
    this.GAME.finish_game(
      data.winner == Game_UI.user_id ? lang.you_win : lang.you_lose,
      data
    );
    Game_UI.WaitingClock.setState({ show: 0 });
  }

  action_redirect2home(data) {
    redirect("/");
  }

  action_load_data(data) {
    Game_UI.game_id = data.game_id;
    Game_UI.cube_size = data.cube_size;
    Game_UI.game_type = data.game_type;
    Game_UI.world = data.world;

    Game_UI.models = data.models;
    Game_UI.tour = data.tour;
    Game_UI.user_id = data.user_id;
    Game_UI.users = data.users;

    if (typeof data.info != "undefined") {
      var message = data.info;
    } else {
      var message = false;
    }
    Game_UI.start(message);
  }

  action_set_key(data) {
    window.mdkey = this.mdkey = data.key;
    saveUserKey(window.mdkey);
  }

  play_sound(sound) {
    if (Game_UI.game_options.state.nosound == 0) {
      switch (sound) {
        case "start":
          Game_UI.sounds.myRef.current.play();
          break;
        case "click":
          break;
        case "shah":
          Game_UI.sounds.myRef.current.play();
          break;
        case "killme":
          Game_UI.sounds.myRef.current.play();
          break;
        case "ikill":
          break;
        case "killother":
          Game_UI.sounds.myRef.current.play();
          break;
        case "move":
          break;
      }
    }
  }
  user_color(uid) {
    return Game_UI.game_options.state.user_options.colors[
      Object.keys(Game_UI.users).indexOf(uid.toString())
    ];
  }

  action_select_green(data) {
    this.GAME.select_green_slave(data, data.cube_number);
  }

  action_select_none(data) {
    this.GAME.clear_marked_cubes();
  }

  action_select_figure(data) {
    this.GAME.select_figure_and_mark(data, data.select_markers);
  }

  action_move(data) {
    this.GAME.move_figure(data.move);
    if (data.tour != undefined) Game_UI.tour = data.tour;
  }
  action_reload_map(data) {
    this.GAME.reload_figures(data);
  }
  action_reload(data) {
    reload();
  }
  action_time_warning(data) {
    Game_UI.WaitingClock.state.show = 1;
    Game_UI.WaitingClock.setState(Game_UI.WaitingClock.state);
  }
  toString() {
    return JSON.stringify(this);
  }
}

var Start = function (GAME, ROOTPATH) {
  window.ROOTPATH = ROOTPATH;
  window.GAME = new GAME();
  const root = ReactDOM.createRoot(document.getElementById("main"));
  root.render(React.createElement(game_page));
};

export { Start, GAME };
