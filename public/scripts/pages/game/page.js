"use strict";
import lang from "/scripts/lang/en.js";
import GAME from "./game.js";
import Abstract from "/scripts/abstract.js";

class gameOptions extends Abstract {
  constructor(props) {
    super(props);
    UI.gameOptions = this;
    this.state = {};
    this.state.userOptions = UI.GAME.getUserOptions();
    this.state.show = 0;

    this.state.userColors = {};
    this.ucolorRefs = {};
    this.lineColorRef = React.createRef();
  }

  addMissingColors() {
    var usersCount = Object.keys(UI.users).length;

    if (this.state.userOptions.colors.length < usersCount) {
      for (var u in this.defaultPlayersColors) {
        if (
          this.state.userOptions.colors.includes(
            this.defaultPlayersColors[u]
          ) == false
        ) {
          this.state.userOptions.colors.push(this.defaultPlayersColors[u]);
          if (this.state.userOptions.colors.length == usersCount) break;
        }
      }
      UI.GAME.setUserOptions(this.state.userOptions);
      this.setState(this.state);
    }
    //
  }

  handleChange(name, value) {
    this.state.userOptions[name] = value;
  }

  applyChanges() {
    //get colors from jscolor elements
    this.state.userOptions.colors = [];

    for (var uid in this.ucolorRefs) {
      this.state.userColors[uid] = this.ucolorRefs[uid].current.value;
      this.state.userOptions.colors.push(this.ucolorRefs[uid].current.value);
    }
    this.state.userOptions.line_color = this.lineColorRef.current.value;
    localStorage.setItem("userOptions", JSON.stringify(this.state.userOptions));
    UI.GAME.setUserOptions(this.state.userOptions);
    window.location.reload();
  }
  exit_game() {
    if (confirm(lang.wanna_leave_game)) {
      UI.send2({ action: "exit_game" });
      setTimeout(() => {
        this.redirect("/");
      }, 300);
    }
  }

  renderColorPicker(uid) {
    this.ucolorRefs[uid] = React.createRef();
    this.state.userColors[uid] = UI.GAME.getUserColor(uid);
    return e(
      "input",
      {
        //className: "jscolor {valueElement:'color" + uid + "'}",
        type: "color",
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
    var colors = [e("label", { key: this.uk() }, lang.player_colors)];
    colors.push(this.renderColorPicker(UI.GAME.getUserId()));
    for (var uid in UI.users) {
      if (uid != UI.GAME.getUserId()) colors.push(this.renderColorPicker(uid));
    }
    return e(
      "div",
      { id: "game_options", key: this.uk() },
      e("div", { key: this.uk() }, colors),
      e(
        "div",
        { key: this.uk() },
        e("label", null, lang.line_color + ":"),
        e(
          "input",
          {
            //   className: "jscolor {valueElement:'line_color'}",
            type: "color",
            name: "line_color",
            key: this.uk(),
            id: "line_color",
            defaultValue: this.state.userOptions.line_color,
            ref: this.lineColorRef,
          },
          null
        )
      ),
      e(
        "button",
        { onClick: () => this.applyChanges(), key: this.uk() },
        lang.apply_changes
      ),
      e(
        "button",
        {
          id: "exit_game_btn",
          onClick: () => this.exit_game(),
          key: this.uk(),
        },
        lang.leave_game
      )
    );
  }
}

class game_menu extends Abstract {
  constructor(props) {
    super(props);
    this.state = {
      show_chat: 0,
      messages: [],
      unselect_show: 0,
      chat_button_color: "chatbtn_green",
    };

    UI.game_menu = this;
    //this.GAME = Game_UI.GAME;
  }

  updateUnselectShow(value) {
    this.state.unselect_show = value;
    this.setState(this.state);
  }

  unselect() {
    UI.GAME.clearMarkedCubes();
    UI.send2({ action: "select_none" });
  }

  render() {
    return e(
      "div",
      { id: "game_menu" },
      this.state.unselect_show == 1
        ? e(
            "button",
            {
              id: "unselect_btn",
              key: this.uk(),
              onClick: () => this.unselect(),
            },
            lang.unselect
          )
        : null
    );
  }
}

//menu toggle button
class menu_toggle extends Abstract {
  constructor(props) {
    super(props);
  }
  toggleGameOptions() {
    UI.gameOptions.state.show = UI.gameOptions.state.show == 0 ? 1 : 0;
    UI.gameOptions.setState(UI.gameOptions.state);
  }
  render() {
    return e("img", {
      src: "/images/menu.png",
      id: "game_options_button",
      key: "menu_toggle",
      onClick: () => this.toggleGameOptions(),
    });
  }
}

class Log extends Abstract {
  constructor(props) {
    super(props);
    this.state = { log: {} };
    UI.Log = this;
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

class WaitingClock extends Abstract {
  constructor() {
    super();
    this.state = { show: 0 };
    UI.WaitingClock = this;
  }
  hide() {
    this.setState({ show: 0 });
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

class Parent extends Abstract {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    UI.Parent = this;
  }

  render() {
    return e("div", { key: this.uk() }, [
      e(WaitingClock, { key: "WaitingClock" }),
      e("div", { id: "bar", key: this.uk() }, e(game_menu)),
      e(Log, { key: this.uk() }),
      e("div", { id: "game_bar", key: this.uk() }),
      e(menu_toggle, { key: this.uk() }),
      e(gameOptions, { key: this.uk() }),
      e("canvas", { id: "canvas", ref: this.canvasRef, key: this.uk() }),
    ]);
  }
}

const e = React.createElement;
var UI;
class gamePage extends Abstract {
  constructor(props) {
    super(props);
    UI = this;
    this.GAME = new GAME();

    this.mdkey = this.getUserKey();

    if (this.mdkey == null) {
      this.mdkey = this.makeid(16);
      this.saveUserKey(this.mdkey);
    }
    this.initStatus = false;
    this.data = {};

    this.config = this.getConfig();
    this.init_sockets();
    this.initHandlers();
  }

  initHandlers() {
    document.addEventListener("send2", (e) => {
      this.send2(e.detail);
    });

    document.addEventListener("send2ui", (e) => {
      this[e.detail.name][e.detail.method](e.detail.value);
    });
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

        if (typeof data.winner != "undefined") {
          this.winner = data.winner;
        }

        if (this.initStatus) {
          this.update(data);
        }
        if (typeof data.action != "undefined") {
          this["action_" + data.action](data);
        }

        if (typeof data.error != "undefined" && data.error.length > 0) {
          this.alert(data.error);
        }
      });
    });
    window.socket = socket;
  }

  render() {
    return e(Parent);
  }

  start(info) {
    this.initStatus = true;
    this.GAME.init({
      name: "init",
      cube_size: this.cube_size,
      world: this.world,
      info: info,
      models: this.models,
      canvas: this.Parent.canvasRef.current,
      lineColor: this.gameOptions.state.userOptions.line_color,
      users: this.users,
      userId: UI.GAME.getUserId(),
    });
  }

  update(data) {
    if (["select_figure"].includes(data.action) == false) {
      if (typeof data.info != "undefined") {
        this.GAME.draw_info({ message: data.info });
      }
    }
  }

  action_remove_cubes(data) {
    for (let c in data.cubes) {
      this.GAME.flyCube({ cube: data.cubes[c] });
    }
    this.world = data.world;
  }

  send2(args) {
    args.page = "game";
    args.mdkey = this.mdkey;
    if (typeof args.action_cube != "undefined") {
      args.active_cube = UI.GAME.active_cube;
    }

    window.socket.emit("message", JSON.stringify(args));
  }

  action_game_over(data) {
    this.GAME.finish_game({
      message: data.winner == UI.GAME.userId ? lang.you_win : lang.you_lose,
      world: data,
    });
    this.WaitingClock.setState({ show: 0 });
  }

  action_redirect2home(data) {
    this.redirect("/");
  }

  action_load_data(data) {
    this.game_id = data.game_id;
    this.cube_size = data.cube_size;
    this.game_type = data.game_type;
    this.world = data.world;

    this.models = data.models;
    //this.tour = data.tour;
    UI.GAME.setTour(data.tour);
    UI.GAME.setUserId(data.user_id);
    this.users = data.users;

    if (typeof data.info != "undefined") {
      var message = data.info;
    } else {
      var message = false;
    }
    this.start(message);
  }

  action_set_key(data) {
    this.mdkey = data.key;
    this.saveUserKey(this.mdkey);
  }

  action_select_green(data) {
    console.log(data);
    this.GAME.select_green_slave({
      cube_number: data.cube_number,
    });
  }

  action_select_none(data) {
    this.GAME.clearMarkedCubes();
  }

  action_select_figure(data) {
    this.GAME.select_figure_and_mark({ markers: data.select_markers });
  }

  action_move(data) {
    this.GAME.move_figure({
      data: data.move,
    });
    if (data.tour != undefined) {
      UI.GAME.setTour(data.tour);
    }
  }
  action_reload_map(data) {
    this.GAME.reload_figures({ data: data });
  }
  action_reload(data) {
    window.location.reload();
  }
  action_time_warning(data) {
    this.WaitingClock.state.show = 1;
    this.WaitingClock.setState(this.WaitingClock.state);
  }
  toString() {
    return JSON.stringify(this);
  }
}

var Start = function () {
  const root = ReactDOM.createRoot(document.getElementById("main"));
  root.render(React.createElement(gamePage));
};

export { Start, GAME };
