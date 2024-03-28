//define(['react','reactdom','lang'],function (React, ReactDOM, lang) {
'use strict';
import lang from "/scripts/lang/en.js";
import { uk } from "/scripts/helper.js";
const e = React.createElement;


class guide_page extends React.Component {
    render() {
        return [
            e('a', { 'href': '/', 'title': lang.to_main_page, 'className': 'back', key: uk() }, lang.back),
            e('h1', { 'className': 'h1', key: uk() }, lang.guide_title),
            e('div', { 'className': 'info', key: uk() },
                e('h2', { 'className': 'h2', key: uk() }, lang.game_ui),
                e('div', { 'className': 'row', key: uk() },
                    lang.game_ui_1,
                    e('br', { key: uk() }),
                    lang.game_ui_2,
                    e('br', { key: uk() }),
                    lang.game_ui_3,
                    e('img', { 'src': '/images/guide/b0.png', key: uk() })
                ),
                e('h2', { 'className': 'h2', key: uk() }, lang.how_control_board),
                e('p', { key: uk() }, lang.how_control_board_1, e('br', { key: uk() }), e('br', { key: uk() }),
                    lang.how_control_board_2, e('br', { key: uk() }), e('br', { key: uk() }), lang.how_control_board_3),
                e('h2', { 'className': 'h2', key: uk() }, lang.how_to_play),
                e('div', { 'className': 'row', key: uk() },
                    e('img', { 'src': '/images/guide/b2.png', key: uk() }),
                    lang.how_to_play_1, e('br', { key: uk() }),
                    lang.how_to_play_2, e('br', { key: uk() }), e('br', { key: uk() }),
                    lang.how_to_play_3, e('br', { key: uk() }),
                    lang.how_to_play_4, e('br', { key: uk() }), e('br', { key: uk() }),
                    lang.how_to_play_5, e('br', { key: uk() })
                )
            )
        ];
    }
}
var Start = function () {
    const root = ReactDOM.createRoot(document.querySelector('#main'));
    root.render(React.createElement(guide_page, { key: 'guide_page' }));
};

export { Start };