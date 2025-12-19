app.get("/hud", async (req, res) => {
  try {
    const battleData =
      "http://esportsdata-sg.mobilelegends.com/battledata?authkey=4fde47b4bc0f7308672c0af4bf060dc5&battleid=" +
      id +
      "&dataid=1";
    const { response, body } = await makeRequest(battleData);
    if (response.statusCode !== 200) {
      return res.status(500).send("Request to external API failed");
    }

    let responseData = {};
    let a = body.data.camp_list;
    let data = body.data;
    let gameTime = body.data.game_time;
    let team1 = a[0];
    let team2 = a[1];

    //teamLogo
    responseData.state = data.state
    responseData.team1Name = formData.team1_name || team1.team_name;
    responseData.team2Name = formData.team2_name || team2.team_name;

    responseData.team1ShortName =
      formData.team1_shortName || team1.team_simple_name;
    responseData.team2ShortName =
      formData.team2_shortName || team2.team_simple_name;

    responseData.team1Logo = `${formData.hudLogoPath}${
      formData.team1_shortName || team1.team_simple_name
    }.png`;
    responseData.team2Logo = `${formData.hudLogoPath}RIGHT/${
      formData.team2_shortName || team2.team_simple_name
    }.png`;

    //game time
    responseData.gameTime = formatTime(gameTime);
    responseData.gameTime2 = formatTime(displayGameTime);
    //team gold
    responseData.team1Gold =
      a[0].total_money > 10000
        ? `${(a[0].total_money / 1000).toFixed(1)}k`
        : a[0].total_money;
    responseData.team2Gold =
      a[1].total_money > 10000
        ? `${(a[1].total_money / 1000).toFixed(1)}k`
        : a[1].total_money;

    //gold diff
    responseData.goldDiff1 =
      a[0].total_money > a[1].total_money
        ? `+${((a[0].total_money - a[1].total_money) / 1000).toFixed(1)}k`
        : "";
    responseData.goldDiff2 =
      a[1].total_money > a[0].total_money
        ? `+${((a[1].total_money - a[0].total_money) / 1000).toFixed(1)}k`
        : "";

    //gold diff png
    responseData.goldDiffPng1 =
      a[0].total_money > a[1].total_money
        ? `${formData.goldLogo}1.png`
        : `${formData.goldLogo}0.png`;
    responseData.goldDiffPng2 =
      a[1].total_money > a[0].total_money
        ? `${formData.goldLogo}2.png`
        : `${formData.goldLogo}0.png`;

    //TurtleKill
    responseData.TurtleKill1 = team1.kill_tortoise;
    responseData.TurtleKill2= team2.kill_tortoise;

    //lordKill
    responseData.LordKill1 = team1.kill_lord;
    responseData.LordKill2 = team2.kill_lord;

    //totalKill
    for (let i = 0; i < 2; i++) {
      const team = a[i];
      responseData[`TotalKill${i + 1}`] = team.score;
    }

    //TowerDestory
    for (let i = 0; i < 2; i++) {
      const team = a[i];
      responseData[`Tower${i + 1}`] = team.kill_tower;
    }

    //turtle kill
    let turtleKill =
      data.incre_event_list == null
        ? []
        : data.incre_event_list.filter(
            (e) => e.event_type == "kill_boss" && e.boss_name == "tortoise"
          );
    //lord kill
    let lordKill =
      data.incre_event_list == null
        ? []
        : data.incre_event_list.filter((e) => {
            return e.event_type == "kill_boss" && e.boss_name == "lord";
          });
    // first blood
    let firstBlood =
      data.incre_event_list == null
        ? []
        : data.incre_event_list.filter((e) => {
            return (
              e.event_type == "kill_hero" && e.extra_param == "first_blood"
            );
          });

    //tripleKill
    let tripleKill =
      data.incre_event_list == null
        ? []
        : data.incre_event_list.filter((e) => {
            return (
              e.event_type == "kill_hero" && e.extra_param == "triple_kill"
            );
          });
    //miniac
    // let miniac =
    //   data.incre_event_list == null
    //     ? []
    //     : data.incre_event_list.filter((e) => {
    //         return (
    //           e.event_type == "kill_hero" && e.extra_param == "quadra_kill"
    //         );
    //       });
    let miniac = !data.incre_event_list
      ? []
      : data.incre_event_list.filter((e) => {
          return (
            e.event_type === "kill_hero" &&
            Array.isArray(e.extra_param) &&
            e.extra_param.includes("quadra_kill")
          );
        });

    // console.log(miniac)
    //savage
    // let savage =
    //   data.incre_event_list == null
    //     ? []
    //     : data.incre_event_list.filter((e) => {
    //         return e.event_type == "kill_hero" && e.extra_param == "penta_kill";
    //       });
    let savage = !data.incre_event_list
      ? []
      : data.incre_event_list.filter((e) => {
          return (
            e.event_type === "kill_hero" &&
            Array.isArray(e.extra_param) &&
            e.extra_param.includes("penta_kill")
          );
        });

    if (savage.length > 0) {
      let lastsavage = savage[savage.length - 1];
      responseData.savagePlayerTeamName =
        lastsavage.campid == 1
          ? formData.team1_name || team1.team_name
          : formData.team2_name || team2.team_name;
      responseData.savagePlayerName = name_finder(
        lastsavage.killer_id,
        playerList
      );
      responseData.savagePlayerPic = `C://data/firstblood/${lastsavage.killer_id}.png`;
      responseData.savagePlayerPicTeamLogo =
        lastsavage.campid == 1
          ? `${formData.bossKillerLogoPath}${formData.team1_shortName}.png`
          : `${formData.bossKillerLogoPath}${formData.team2_shortName}.png`;
    } else {
      responseData.savagePlayerName = "";
      responseData.savagePlayerPic = `C://data/firstblood/0.png`;
      responseData.savagePlayerTeamName = "";
      responseData.savagePlayerPicTeamLogo = "";
    }

    if (miniac.length > 0) {
      let lastMiniac = miniac[miniac.length - 1];
      responseData.miniacPlayerTeamName =
        lastMiniac.campid == 1
          ? formData.team1_name || team1.team_name
          : formData.team2_name || team2.team_name;
      responseData.miniacPlayerName = name_finder(
        lastMiniac.killer_id,
        playerList
      );
      responseData.miniacPlayerPic = `C://data/firstblood/${lastMiniac.killer_id}.png`;
      responseData.miniacPlayerPicTeamLogo =
        lastMiniac.campid == 1
          ? `${formData.bossKillerLogoPath}${formData.team1_shortName}.png`
          : `${formData.bossKillerLogoPath}${formData.team2_shortName}.png`;
    } else {
      responseData.miniacPlayerName = "";
      responseData.miniacPlayerPic = `C://data/firstblood/0.png`;
      responseData.miniacPlayerTeamName = "";
      responseData.miniacPlayerPicTeamLogo = "";
    }

    if (tripleKill.length > 0) {
      let lasttripleKill = tripleKill[tripleKill.length - 1];
      responseData.tripleKillPlayerTeamName =
        lasttripleKill.campid == 1
          ? formData.team1_name || team1.team_name
          : formData.team2_name || team2.team_name;
      responseData.tripleKillPlayerName = name_finder(
        lasttripleKill.killer_id,
        playerList
      );
      responseData.tripleKillPlayerPic = `C://data/firstblood/${lasttripleKill.killer_id}.png`;
      responseData.tripleKillPlayerPicTeamLogo =
        lasttripleKill.campid == 1
          ? `${formData.bossKillerLogoPath}${formData.team1_shortName}.png`
          : `${formData.bossKillerLogoPath}${formData.team2_shortName}.png`;
    } else {
      responseData.tripleKillPlayerName = "";
      responseData.tripleKillPlayerPic = `C://data/firstblood/0.png`;
      responseData.tripleKillPlayerTeamName = "";
      responseData.tripleKillPlayerPicTeamLogo = "";
    }

    //FB
    if (firstBlood.length > 0) {
      let lastfirstBlood = firstBlood[firstBlood.length - 1];
      responseData.firstBloodPlayerTeamName =
        lastfirstBlood.campid == 1
          ? formData.team1_name || team1.team_name
          : formData.team2_name || team2.team_name;
      responseData.firstBloodPlayerName =
        name_finder(lastfirstBlood.killer_id, playerList) ||
        lastfirstBlood.killer_name;
      // responseData.firstBloodPlayerPic = `${formData.bossKillerPath}${lastfirstBlood.killer_id}.png`;
      responseData.firstBloodPlayerPic = `C://data/firstblood/${lastfirstBlood.killer_id}.png`;
      responseData.firstBloodPlayerPicTeamLogo =
        lastfirstBlood.campid == 1
          ? `${formData.bossKillerLogoPath}${formData.team1_shortName}.png`
          : `${formData.bossKillerLogoPath}${formData.team2_shortName}.png`;
    } else {
      responseData.firstBloodPlayerName = "";
      responseData.firstBloodPlayerPic = `${formData.bossKillerPath}0.png`;
      responseData.firstBloodPlayerTeamName = "";
      responseData.firstBloodPlayerPicTeamLogo = "";
    }
    //
    if (turtleKill.length > 0) {
      let lastTurtleKillEvent = turtleKill[turtleKill.length - 1];
      responseData.turtleKillTeamName =
        lastTurtleKillEvent.campid == 1
          ? formData.team1_name || team1.team_name
          : formData.team2_name || team2.team_name;

      responseData.turtleKillPlayer = `${formData.bossKillerPath}${lastTurtleKillEvent.killer_id}.png`;
      responseData.turtleKillPlayerName = name_finder(
        lastTurtleKillEvent.killer_id,
        playerList
      );
      responseData.turtleKillPlayerTeamLogo =
        lastTurtleKillEvent.campid == 1
          ? `${formData.bossKillerLogoPath}${formData.team1_shortName}.png`
          : `${formData.bossKillerLogoPath}${formData.team2_shortName}.png`;
    } else {
      responseData.turtleKillTeamName = "";
      responseData.turtleKillPlayer = `${formData.bossKillerPath}0.png`;
      responseData.turtleKillPlayerName = "";
      responseData.turtleKillPlayerTeamLogo = "";
    }

    // Count turtle kills per team
    let team1TurtleKills = turtleKill.filter(
      (e) => e.campid == 1 || e.killer_camp == 1
    ).length;
    let team2TurtleKills = turtleKill.filter(
      (e) => e.campid == 2 || e.killer_camp == 2
    ).length;

    responseData.totalTurtleKilled = team1TurtleKills + team2TurtleKills;

    //
    if (lordKill.length > 0) {
      let lastLordKillEvent = lordKill[lordKill.length - 1];
      responseData.lordKillTeamName =
        lastLordKillEvent.campid == 1
          ? formData.team1_name || team1.team_name
          : formData.team2_name || team2.team_name;

      responseData.lordKillPlayer = `${formData.bossKillerPath}${lastLordKillEvent.killer_id}.png`;
      responseData.lordKillPlayerName = name_finder(
        lastLordKillEvent.killer_id,
        playerList
      );
      responseData.lordKillPlayerTeamLogo =
        lastLordKillEvent.campid == 1
          ? `${formData.bossKillerLogoPath}${formData.team1_shortName}.png`
          : `${formData.bossKillerLogoPath}${formData.team2_shortName}.png`;
    } else {
      responseData.lordKillTeamName = "";
      responseData.lordKillPlayer = `${formData.bossKillerPath}0.png`;
      responseData.lordKillPlayerName = "";
      responseData.lordKillPlayerTeamLogo = "";
    }

    let jsonData = { data: [responseData] };
    res.send(jsonData);
  } catch (err) {
    return res.status(500).send(err);
  }
});