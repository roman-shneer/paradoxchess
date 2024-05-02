//define(['react','reactdom','lang'],function (React, ReactDOM, lang) {
"use strict";
import lang from "/scripts/lang/en.js";
import Abtract from "/scripts/abstract.js";
const e = React.createElement;

class guidePage extends Abtract {
  render() {
    return [
      e(
        "a",
        {
          href: "/",
          title: lang.to_main_page,
          className: "back",
          key: this.uk(),
        },
        lang.back
      ),
      e("h1", { className: "h1", key: this.uk() }, lang.guide_title),
      e(
        "div",
        { className: "info", key: this.uk() },
        e("h2", { className: "h2", key: this.uk() }, lang.game_ui),
        e(
          "div",
          { className: "row", key: this.uk() },
          lang.game_ui_1,
          e("br", { key: this.uk() }),
          lang.game_ui_2,
          e("br", { key: this.uk() }),
          lang.game_ui_3,
          e("img", { src: "/images/guide/b0.png", key: this.uk() })
        ),
        e("h2", { className: "h2", key: this.uk() }, lang.how_control_board),
        e(
          "p",
          { key: this.uk() },
          lang.how_control_board_1,
          e("br", { key: this.uk() }),
          e("br", { key: this.uk() }),
          lang.how_control_board_2,
          e("br", { key: this.uk() }),
          e("br", { key: this.uk() }),
          lang.how_control_board_3
        ),
        e("h2", { className: "h2", key: this.uk() }, lang.how_to_play),
        e(
          "div",
          { className: "row", key: this.uk() },
          e("img", { src: "/images/guide/b2.png", key: this.uk() }),
          lang.how_to_play_1,
          e("br", { key: this.uk() }),
          lang.how_to_play_2,
          e("br", { key: this.uk() }),
          e("br", { key: this.uk() }),
          lang.how_to_play_3,
          e("br", { key: this.uk() }),
          lang.how_to_play_4,
          e("br", { key: this.uk() }),
          e("br", { key: this.uk() }),
          lang.how_to_play_5,
          e("br", { key: this.uk() })
        )
      ),
    ];
  }
}
var Start = function () {
  console.log("Start");
  const root = ReactDOM.createRoot(document.querySelector("#main"));
  root.render(React.createElement(guidePage, { key: "guide_page" }));
};

export { Start };
