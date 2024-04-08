module.exports = {
  figure_positions: {
    4: [
      //player 0
      [
        ["pawn", "2:1:2"],
        ["pawn", "3:1:2"],
        ["pawn", "1:1:2"],
        ["pawn", "4:1:2"],

        ["pawn", "1:2:2"],
        ["pawn", "2:2:2"],
        ["pawn", "3:2:2"],
        ["pawn", "4:2:2"],

        ["castle", "4:1:1"],
        ["king", "2:1:1"],
        ["queen", "3:1:1"],
        ["castle", "1:1:1"],

        ["elephant", "1:2:1"],
        ["knight", "2:2:1"],
        ["knight", "3:2:1"],
        ["elephant", "4:2:1"],
      ], //player 1

      [
        ["castle", "1:4:4", 1],
        ["queen", "3:4:4", 1],
        ["king", "2:4:4", 1],
        ["castle", "4:4:4", 1],

        ["elephant", "1:3:4", 1],
        ["knight", "2:3:4", 1],
        ["knight", "3:3:4", 1],
        ["elephant", "4:3:4", 1],

        ["pawn", "1:4:3"],
        ["pawn", "2:4:3"],
        ["pawn", "3:4:3"],
        ["pawn", "4:4:3"],

        ["pawn", "1:3:3"],
        ["pawn", "2:3:3"],
        ["pawn", "3:3:3"],
        ["pawn", "4:3:3"],
      ],
    ],

    5: [
      //player 0
      [
        ["pawn", "2:1:2"],
        ["pawn", "3:1:2"],
        ["pawn", "1:1:2"],
        ["pawn", "4:1:2"],
        ["pawn", "5:1:2"],

        ["pawn", "1:2:2"],
        ["pawn", "2:2:2"],
        ["pawn", "3:2:2"],
        ["pawn", "4:2:2"],
        ["pawn", "5:2:2"],

        ["castle", "5:1:1"],
        ["knight", "4:1:1"],
        ["king", "3:1:1"],
        ["knight", "2:1:1"],
        //["queen", "3:1:1"],
        ["castle", "1:1:1"],

        ["elephant", "1:2:1"],
        ["pawn", "2:2:1"],
        ["queen", "3:2:1"],
        ["pawn", "4:2:1"],
        ["elephant", "5:2:1"],
      ], //player 1

      [
        ["castle", "1:5:5", 1],
        //["queen", "4:5:5", 1],
        ["knight", "2:5:5", 1],
        ["king", "3:5:5", 1],
        ["knight", "4:5:5", 1],
        ["castle", "5:5:5", 1],

        ["elephant", "1:4:5", 1],
        ["pawn", "2:4:5"],
        ["queen", "3:4:5", 1],
        ["pawn", "4:4:5"],
        ["elephant", "5:4:5", 1],

        ["pawn", "1:5:4"],
        ["pawn", "2:5:4"],
        ["pawn", "3:5:4"],
        ["pawn", "4:5:4"],
        ["pawn", "5:5:4"],

        ["pawn", "1:4:4"],
        ["pawn", "2:4:4"],
        ["pawn", "3:4:4"],
        ["pawn", "4:4:4"],
        ["pawn", "5:4:4"],
      ],
    ],

    6: [
      //player 0
      [
        ["pawn", "1:2:2"],
        ["pawn", "2:2:2"],
        ["pawn", "3:2:2"],
        ["pawn", "4:2:2"],
        ["pawn", "5:2:2"],
        ["pawn", "6:2:2"],

        ["castle", "6:1:1"],
        ["elephant", "5:1:1"],
        ["queen", "4:1:1"],
        ["king", "3:1:1"],
        ["elephant", "2:1:1"],
        ["castle", "1:1:1"],

        ["pawn", "1:2:1"],
        ["knight", "2:2:1"],
        ["pawn", "3:2:1"],
        ["pawn", "4:2:1"],
        ["knight", "5:2:1"],
        ["pawn", "6:2:1"],
      ],

      //player 1
      [
        ["castle", "1:6:6"],
        ["elephant", "2:6:6", 1],
        ["king", "3:6:6", 1],
        ["queen", "4:6:6"],
        ["elephant", "5:6:6", 1],
        ["castle", "6:6:6"],

        ["pawn", "1:5:6"],
        ["knight", "2:5:6", 1],
        ["pawn", "3:5:6"],
        ["pawn", "4:5:6"],
        ["knight", "5:5:6", 1],
        ["pawn", "6:5:6"],

        ["pawn", "1:5:5"],
        ["pawn", "2:5:5"],
        ["pawn", "3:5:5"],
        ["pawn", "4:5:5"],
        ["pawn", "5:5:5"],
        ["pawn", "6:5:5"],
      ],
    ],
  },

  get_world: function (cube_size) {
    world = this;
    const total_lines = [];
    for (let z = 1; z <= cube_size; z += 1) {
      for (let y = 1; y <= cube_size; y += 1) {
        for (let x = 1; x <= cube_size; x += 1) {
          total_lines.push(x + ":" + y + ":" + z);
        }
      }
    }

    return total_lines;
  },

  get_figure_positions: function (users, cube_type) {
    world = this;

    const cube_size = cube_type[0];
    let result = { world: this.get_world(cube_size), models: {}, history: [] };
    const player = world.figure_positions[cube_type.toString()];

    var id = 1;
    var ind2uid = Object.keys(users);
    for (let p in player) {
      for (let r in player[p]) {
        result.models[id] = {
          figure: player[p][r][0],
          price: this.figurePrice(player[p][r][0]),
          id: id,
          uid: ind2uid[p],
          cube_number: player[p][r][1],
          dir: typeof player[p][r][2] != "undefined" ? player[p][r][2] : 0,
        };

        id++;
      }
    }

    return result;
  },

  figurePrice(figure) {
    let price;
    switch (figure) {
      case "king":
        price = 11;
        break;
      case "queen":
        price = 11;
        break;
      case "castle":
        price = 10;
        break;
      case "elephant":
        price = 4;
        break;
      case "knight":
        price = 3;
        break;
      case "pawn":
        price = 1;
        break;
    }
    return price;
  },
};
