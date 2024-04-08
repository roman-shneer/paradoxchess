module.exports = {
  glob: null,

  botAction: function (game, game_id) {
    let my_figures = [];
    let myModels = this.glob.tools.getMyModels(game);
    for (let id in myModels) {
      this.botCheckPaths(my_figures, game, myModels[id]);
    }

    if (my_figures.length > 0) {
      my_figures.sort((a, b) => {
        if (a[2] > b[2]) {
          return -1;
        }
        if (a[2] < b[2]) {
          return 1;
        }
        return 0;
      });

      let bestWay = my_figures[0];
      this.prepareAction(game, bestWay[0], bestWay[1]);
    } else {
      //bad way
      console.log("Im Lose!");
      this.glob.tools.end_game(game, "No way");
    }
  },

  botCheckCellSecured(game, cell, model) {
    let guards = this.botGetCellGuardsPrice(game, cell, model.id);
    let otherModels = this.glob.tools.getOtherModels(game);
    let riskFiguresPrice = 0;
    for (let id in otherModels) {
      var fw = this.glob.tools.figureWays[otherModels[id].figure](
        game,
        otherModels[id].cube_number
      );
      if (fw.war.indexOf(cell) > -1) return false;
    }
    return true;
  },

  prepareAction(game, my_model, cell) {
    var markers = this.glob.tools.selectfiguremarkers(game, my_model);
    this.glob.the_users.sendToGameClients(game, {
      action: "select_figure",
      select_markers: markers,
    });
    setTimeout(() => {
      this.executeAction(game, my_model.cube_number, cell);
    }, 1000);
  },

  botCheckPaths(my_figures, game, model) {
    const ways = this.glob.tools.figureWays[model.figure](
      game,
      model.cube_number
    );
    for (let w in ways.war) {
      let perm = this.glob.tools.chkMovePermission(
        game,
        ways.war[w],
        model.cube_number
      );
      if (
        perm.result == true &&
        this.checkMoveRisk(game, model.id, ways.war[w])
      ) {
        let targetModel = this.glob.tools.getModel(game, ways.war[w], "cube");
        if (targetModel != null) {
          my_figures.push([model, ways.war[w], targetModel.price, "war"]);
        }
      }
    }
    for (let m in ways.move) {
      let perm = this.glob.tools.chkMovePermission(
        game,
        ways.move[m],
        model.cube_number
      );
      if (
        perm.result == true &&
        this.checkMoveRisk(game, model.id, ways.move[m])
      ) {
        my_figures.push([model, ways.move[m], 0, "move"]);
      }
    }
  },

  checkMoveRisk(game, fromModeId, cube) {
    let new_game = this.glob.tools.checkRiskiness(game, cube, fromModeId);
    const riskFiguresNow = this.getFiguresInRisk(game);
    const riskFiguresAfter = this.getFiguresInRisk(new_game);
    let riskPriceNow = 0;
    let riskPriceAfter = 0;
    for (let r in riskFiguresNow) {
      riskPriceNow += riskFiguresNow[r].price;
    }
    for (let r in riskFiguresAfter) {
      riskPriceAfter += riskFiguresAfter[r].price;
    }
    let targetModel = this.glob.tools.getModel(game, cube, "cube");
    if ((targetModel = null)) {
      riskPriceAfter += targetModel.price;
    }
    if (riskPriceAfter > riskPriceNow) return false;
    else return true;
  },

  getFiguresInRisk(game) {
    let myModels = this.glob.tools.getMyModels(game);
    let myCubeNumber = [];
    let myModelsPerCube = {};
    let riskModels = [];
    for (let m in myModels) {
      myModelsPerCube[myModels[m].cube_number] = myModels[m];
      myCubeNumber.push(myModels[m].cube_number);
    }
    let otherModels = this.glob.tools.getOtherModels(game);
    for (let m in otherModels) {
      let otherWays = this.glob.tools.figureWays[otherModels[m].figure](
        game,
        otherModels[m].cube_number
      );
      for (let ow in otherWays.war) {
        if (typeof myModelsPerCube[otherWays.war[ow]] != "undefined") {
          let myGuards = this.botGetCellGuardsPrice(
            game,
            otherWays.war[ow],
            myModelsPerCube[otherWays.war[ow]].id
          );
          if (myGuards.price == 0) {
            riskModels.push([
              myModelsPerCube[otherWays.war[ow]],
              otherModels[m],
            ]);
          }
        }
      }
    }
    riskModels.sort((a, b) => {
      if (a[0].price > b[0].price) {
        return -1;
      }
      if (a[0].price < b[0].price) {
        return 1;
      }
      return 0;
    });
    return game;
  },

  checkFiguresInRiskBefore(game) {
    const riskModels = this.getFiguresInRisk(game);
    if (riskModels.length > 0) {
      for (let r in riskModels) {
        //its risk place
        let guards = this.botGetCellGuardsPrice(
          game,
          riskModels[r][1].cube_number,
          riskModels[r][1].id
        );
        if (guards.price) {
          //we can kill him
          let mGuards = this.priceSort(guards.models, false);
          for (let g in mGuards) {
            if (mGuards[g].price < riskModels[r][1].price) {
              //make sense to kill
              console.log(
                "RISK FOR " +
                  riskModels[r][0].figure +
                  " FROM " +
                  riskModels[r][0].figure +
                  " LETS KILL"
              );
              let perm = this.glob.tools.chkMovePermission(
                game,
                riskModels[r][1].cube_number,
                mGuards[g].cube_number
              );
              if (perm.result == true) {
                this.prepareAction(
                  game,
                  mGuards[g],
                  riskModels[r][1].cube_number
                );
                return true;
              }
            }
          }
        } else {
          //we cannot kill - need move
          let markers = this.glob.tools.selectfiguremarkers(
            game,
            riskModels[r][0]
          );
          for (let m in markers) {
            let nextGuards = this.botGetCellGuardsPrice(
              game,
              markers[m].cube_number,
              riskModels[r][0].id
            );
            if (nextGuards.price) {
              console.log(
                "RISK FOR " +
                  riskModels[r][0].figure +
                  " FROM " +
                  riskModels[r][0].figure +
                  " LETS LEAVE"
              );
              let perm = this.glob.tools.chkMovePermission(
                game,
                riskModels[r][0].cube_number,
                markers[m].cube_number
              );
              if (perm.result) {
                this.prepareAction(
                  game,
                  riskModels[r][0],
                  markers[m].cube_number
                );
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  },

  priceSort(models, bigger) {
    if (bigger) {
      models.sort((a, b) => {
        if (a.price > b.price) {
          return -1;
        }
        if (a.price < b.price) {
          return 1;
        }
        return 0;
      });
    } else {
      models.sort((a, b) => {
        if (a.price > b.price) {
          return 1;
        }
        if (a.price < b.price) {
          return -1;
        }
        return 0;
      });
    }
    return models;
  },

  botGetCellGuardsPrice(game, cell, exclude_model_id) {
    let guardFigures = [];
    let guardFiguresCount = 0;
    let myModels = this.glob.tools.getMyModels(game);
    for (let id in myModels) {
      let model = myModels[id];
      if (model.id != exclude_model_id) {
        let ways = this.glob.tools.figureWays[model.figure](
          game,
          model.cube_number
        );
        if (ways.war.indexOf(cell) > -1) {
          guardFigures.push(model);
          guardFiguresCount += model.price;
        }
      }
    }
    return { models: guardFigures, price: guardFiguresCount };
  },

  executeAction: function (game, active_cube, action_cube) {
    var move_res = this.glob.tools.move(active_cube, action_cube, game);
    if (move_res.result == true) {
      this.glob.tools.checkGameStatus(game);
      this.glob.the_users.sendToGameClients(game, {
        action: "move",
        move: {
          from: active_cube,
          to: action_cube,
          kill_model: move_res.kill_model,
          active_model: move_res.active_model,
        },
      });
      return;
    }
  },
};
