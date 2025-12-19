app.get("/item", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=4fde47b4bc0f7308672c0af4bf060dc5&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send("Error Fething Data");
    }
    try {
      let responseData = {};
      let data = body;
      let a = data.data.camp_list;
      let team1 = role_sorter(a[0].player_list, playerList);
      let team2 = role_sorter(a[1].player_list, playerList);
      
      //team1exp
      for (let i = 0; i < 5; i++) {
        responseData[`exp${i + 1}`] = team1[i].exp.toLocaleString() || "";
      }

      //team2exp
      for (let i = 0; i < 5; i++) {
        responseData[`exp${i + 6}`] = team2[i].exp.toLocaleString() || "";
      }
      
      //team1players Emblems
      for (let x = 0; x < 5; x++) {
        for (let i = 0; i < 3; i++) {
          responseData[`p${x + 1}Emblem${i + 1}`] =
            `${formData.emblemPath}${team1[x].rune_map[i + 1]}.png` || "";
        }
      }
      
      //team2players Emblem
      for (let x = 0; x < 5; x++) {
        for (let i = 0; i < 3; i++) {
          responseData[`p${x + 6}Emblem${i + 1}`] =
            `${formData.emblemPath}${team2[x].rune_map[i + 1]}.png` || "";
        }
      }
      
      //Team2spells
      for (let i = 0; i < 5; i++) {
        responseData[`custom${i + 1}`] =
          `${formData.emblemPath}${team1[i].rune_id}.png` || "";
      }
      for (let i = 0; i < 5; i++) {
        responseData[`custom${i + 6}`] =
          `${formData.emblemPath}${team2[i].rune_id}.png` || "";
      }

      //playerNames
      responseData.playerName1 =
        name_finder(team1[0].roleid, playerList) || team1[0].name;
      responseData.playerName2 =
        name_finder(team1[1].roleid, playerList) || team1[1].name;
      responseData.playerName3 =
        name_finder(team1[2].roleid, playerList) || team1[2].name;
      responseData.playerName4 =
        name_finder(team1[3].roleid, playerList) || team1[3].name;
      responseData.playerName5 =
        name_finder(team1[4].roleid, playerList) || team1[4].name;

      responseData.playerName6 =
        name_finder(team2[0].roleid, playerList) || team2[0].name;
      responseData.playerName7 =
        name_finder(team2[1].roleid, playerList) || team2[1].name;
      responseData.playerName8 =
        name_finder(team2[2].roleid, playerList) || team2[2].name;
      responseData.playerName9 =
        name_finder(team2[3].roleid, playerList) || team2[3].name;
      responseData.playerName10 =
        name_finder(team2[4].roleid, playerList) || team2[4].name;
      
      //gold
      responseData.gold1 = team1[0].gold.toLocaleString() || "";
      responseData.gold2 = team1[1].gold.toLocaleString() || "";
      responseData.gold3 = team1[2].gold.toLocaleString() || "";
      responseData.gold4 = team1[3].gold.toLocaleString() || "";
      responseData.gold5 = team1[4].gold.toLocaleString() || "";

      responseData.gold6 = team2[0].gold.toLocaleString() || "";
      responseData.gold7 = team2[1].gold.toLocaleString() || "";
      responseData.gold8 = team2[2].gold.toLocaleString() || "";
      responseData.gold9 = team2[3].gold.toLocaleString() || "";
      responseData.gold10 = team2[4].gold.toLocaleString() || "";

      //goldshort
      responseData.goldShort1 =
        team1[0].gold >= 1000
          ? (team1[0].gold / 1000).toFixed(1) + "k"
          : team1[0].gold.toString();
      responseData.goldShort2 =
        team1[1].gold >= 1000
          ? (team1[1].gold / 1000).toFixed(1) + "k"
          : team1[1].gold.toString();
      responseData.goldShort3 =
        team1[2].gold >= 1000
          ? (team1[2].gold / 1000).toFixed(1) + "k"
          : team1[2].gold.toString();
      responseData.goldShort4 =
        team1[3].gold >= 1000
          ? (team1[3].gold / 1000).toFixed(1) + "k"
          : team1[3].gold.toString();
      responseData.goldShort5 =
        team1[4].gold >= 1000
          ? (team1[4].gold / 1000).toFixed(1) + "k"
          : team1[4].gold.toString();

      responseData.goldShort6 =
        team2[0].gold >= 1000
          ? (team2[0].gold / 1000).toFixed(1) + "k"
          : team2[0].gold.toString();
      responseData.goldShort7 =
        team2[1].gold >= 1000
          ? (team2[1].gold / 1000).toFixed(1) + "k"
          : team2[1].gold.toString();
      responseData.goldShort8 =
        team2[2].gold >= 1000
          ? (team2[2].gold / 1000).toFixed(1) + "k"
          : team2[2].gold.toString();
      responseData.goldShort9 =
        team2[3].gold >= 1000
          ? (team2[3].gold / 1000).toFixed(1) + "k"
          : team2[3].gold.toString();
      responseData.gold1Short0 =
        team2[4].gold >= 1000
          ? (team2[4].gold / 1000).toFixed(1) + "k"
          : team2[4].gold.toString();

      //Team1spells
      for (let i = 0; i < 5; i++) {
        responseData[`spell${i + 1}`] =
          `${formData.spellPath}${team1[i].skillid}.png` || "";
      }

      //Team2spells
      for (let i = 0; i < 5; i++) {
        responseData[`spell${i + 6}`] =
          `${formData.spellPath}${team2[i].skillid}.png` || "";
      }
      
      //heroes
      responseData.hero1 = `${formData.itemHeroPath}${team1[0].heroid}.png`;
      responseData.hero2 = `${formData.itemHeroPath}${team1[1].heroid}.png`;
      responseData.hero3 = `${formData.itemHeroPath}${team1[2].heroid}.png`;
      responseData.hero4 = `${formData.itemHeroPath}${team1[3].heroid}.png`;
      responseData.hero5 = `${formData.itemHeroPath}${team1[4].heroid}.png`;

      responseData.hero6 = `${formData.itemHeroPath}${team2[0].heroid}.png`;
      responseData.hero7 = `${formData.itemHeroPath}${team2[1].heroid}.png`;
      responseData.hero8 = `${formData.itemHeroPath}${team2[2].heroid}.png`;
      responseData.hero9 = `${formData.itemHeroPath}${team2[3].heroid}.png`;
      responseData.hero10 = `${formData.itemHeroPath}${team2[4].heroid}.png`;

      //Embroles
      responseData.rolePng1 = `C://data/emblem/role/${role_finder(team1[0].roleid, playerList)}.png`
      responseData.rolePng2 = `C://data/emblem/role/${role_finder(team1[1].roleid, playerList)}.png`
      responseData.rolePng3 = `C://data/emblem/role/${role_finder(team1[2].roleid, playerList)}.png`
      responseData.rolePng4 = `C://data/emblem/role/${role_finder(team1[3].roleid, playerList)}.png`
      responseData.rolePng5 = `C://data/emblem/role/${role_finder(team1[4].roleid, playerList)}.png`

      responseData.rolePng6 = `C://data/emblem/role/${role_finder(team2[0].roleid, playerList)}.png`
      responseData.rolePng7 = `C://data/emblem/role/${role_finder(team2[1].roleid, playerList)}.png`
      responseData.rolePng8 = `C://data/emblem/role/${role_finder(team2[2].roleid, playerList)}.png`
      responseData.rolePng9 = `C://data/emblem/role/${role_finder(team2[3].roleid, playerList)}.png`
      responseData.rolePng10 = `C://data/emblem/role/${role_finder(team2[4].roleid, playerList)}.png`

      //EMBLEM HERO
      responseData.EmblemHero1 = `C://data/emblem/hero/${team1[0].heroid}.png`;
      responseData.EmblemHero2 = `C://data/emblem/hero/${team1[1].heroid}.png`;
      responseData.EmblemHero3 = `C://data/emblem/hero/${team1[2].heroid}.png`;
      responseData.EmblemHero4 = `C://data/emblem/hero/${team1[3].heroid}.png`;
      responseData.EmblemHero5 = `C://data/emblem/hero/${team1[4].heroid}.png`;

      responseData.EmblemHero6 = `C://data/emblem/hero/${team2[0].heroid}.png`;
      responseData.EmblemHero7 = `C://data/emblem/hero/${team2[1].heroid}.png`;
      responseData.EmblemHero8 = `C://data/emblem/hero/${team2[2].heroid}.png`;
      responseData.EmblemHero9 = `C://data/emblem/hero/${team2[3].heroid}.png`;
      responseData.EmblemHero10 = `C://data/emblem/hero/${team2[4].heroid}.png`;

      //goldDiff Hero
      responseData.goldDiffHero1 = `${formData.goldDiffHeroPath}${team1[0].heroid}.png`;
      responseData.goldDiffHero2 = `${formData.goldDiffHeroPath}${team1[1].heroid}.png`;
      responseData.goldDiffHero3 = `${formData.goldDiffHeroPath}${team1[2].heroid}.png`;
      responseData.goldDiffHero4 = `${formData.goldDiffHeroPath}${team1[3].heroid}.png`;
      responseData.goldDiffHero5 = `${formData.goldDiffHeroPath}${team1[4].heroid}.png`;

      responseData.goldDiffHero6 = `${formData.goldDiffHeroPath}${team2[0].heroid}.png`;
      responseData.goldDiffHero7 = `${formData.goldDiffHeroPath}${team2[1].heroid}.png`;
      responseData.goldDiffHero8 = `${formData.goldDiffHeroPath}${team2[2].heroid}.png`;
      responseData.goldDiffHero9 = `${formData.goldDiffHeroPath}${team2[3].heroid}.png`;
      responseData.goldDiffHero10 = `${formData.goldDiffHeroPath}${team2[4].heroid}.png`;

      //led Hero
      responseData.ledHeroes1 = `C://data/led/item/hero/${team1[0].heroid}.png`;
      responseData.ledHeroes2 = `C://data/led/item/hero/${team1[1].heroid}.png`;
      responseData.ledHeroes3 = `C://data/led/item/hero/${team1[2].heroid}.png`;
      responseData.ledHeroes4 = `C://data/led/item/hero/${team1[3].heroid}.png`;
      responseData.ledHeroes5 = `C://data/led/item/hero/${team1[4].heroid}.png`;

      responseData.ledHeroes6 = `C://data/led/item/hero/${team2[0].heroid}.png`;
      responseData.ledHeroes7 = `C://data/led/item/hero/${team2[1].heroid}.png`;
      responseData.ledHeroes8 = `C://data/led/item/hero/${team2[2].heroid}.png`;
      responseData.ledHeroes9 = `C://data/led/item/hero/${team2[3].heroid}.png`;
      responseData.ledHeroes10 = `C://data/led/item/hero/${team2[4].heroid}.png`;

      //vs heroes
      for (let i = 0; i < 5; i++) {
        responseData[
          `vshero${i + 1}`
        ] = `C://data/vs/hero/${team1[i].heroid}.png`;
        responseData[
          `vsPlayer${i + 1}`
        ] = `C://data/vs/player/1/${team1[i].roleid}.png`;
      }
      for (let i = 0; i < 5; i++) {
        responseData[
          `vshero${i + 6}`
        ] = `C://data/vs/hero/${team2[i].heroid}.png`;
        responseData[
          `vsPlayer${i + 6}`
        ] = `C://data/vs/player/2/${team2[i].roleid}.png`;
      }

      //items ----------------------------------------------------------------------------------------------------------
      //P1Items
      for (let i = 0; i < 6; i++) {
        responseData[`p1Item${i + 1}`] =
          team1[0].equip_list == null
            ? `${formData.itemPath}0.png`
            : `${formData.itemPath}${team1[0].equip_list[i] || 0}.png`;
      }

      //P2Items
      for (let i = 0; i < 6; i++) {
        responseData[`p2Item${i + 1}`] =
          team1[1].equip_list == null
            ? `${formData.itemPath}0.png`
            : `${formData.itemPath}${team1[1].equip_list[i] || 0}.png`;
      }

      //P3Items
      for (let i = 0; i < 6; i++) {
        responseData[`p3Item${i + 1}`] =
          team1[2].equip_list == null
            ? `${formData.itemPath}0.png`
            : `${formData.itemPath}${team1[2].equip_list[i] || 0}.png`;
      }

      //P4Items
      for (let i = 0; i < 6; i++) {
        responseData[`p4Item${i + 1}`] =
          team1[3].equip_list == null
            ? `${formData.itemPath}0.png`
            : `${formData.itemPath}${team1[3].equip_list[i] || 0}.png`;
      }

      //P5Items
      for (let i = 0; i < 6; i++) {
        responseData[`p5Item${i + 1}`] =
          team1[4].equip_list == null
            ? `${formData.itemPath}0.png`
            : `${formData.itemPath}${team1[4].equip_list[i] || 0}.png`;
      }

      //P6Items
      for (let i = 0; i < 6; i++) {
        responseData[`p6Item${i + 1}`] =
          team2[0].equip_list == null
            ? `${formData.itemPath}0.png`
            : `${formData.itemPath}${team2[0].equip_list[i] || 0}.png`;
      }

      //P7Items
      for (let i = 0; i < 6; i++) {
        responseData[`p7Item${i + 1}`] =
          team2[1].equip_list == null
            ? `${formData.itemPath}0.png`
            : `${formData.itemPath}${team2[1].equip_list[i] || 0}.png`;
      }

      //P8Items
      for (let i = 0; i < 6; i++) {
        responseData[`p8Item${i + 1}`] =
          team2[2].equip_list == null
            ? `${formData.itemPath}0.png`
            : `${formData.itemPath}${team2[2].equip_list[i] || 0}.png`;
      }

      //P9Items
      for (let i = 0; i < 6; i++) {
        responseData[`p9Item${i + 1}`] =
          team2[3].equip_list == null
            ? `${formData.itemPath}0.png`
            : `${formData.itemPath}${team2[3].equip_list[i] || 0}.png`;
      }

      //P10Items
      for (let i = 0; i < 6; i++) {
        responseData[`p10Item${i + 1}`] =
          team2[4].equip_list == null
            ? `${formData.itemPath}0.png`
            : `${formData.itemPath}${team2[4].equip_list[i] || 0}.png`;
      }

      //kda
      for (let i = 0; i < 5; i++) {
        responseData[
          `kda${i + 1}`
        ] = `${team1[i].kill_num} / ${team1[i].dead_num} / ${team1[i].assist_num}`;
      }

      for (let i = 0; i < 5; i++) {
        responseData[
          `kda${i + 6}`
        ] = `${team2[i].kill_num} / ${team2[i].dead_num} / ${team2[i].assist_num}`;
      }

      // //P6item
      // responseData.p5Item1=team1[4].equip_list==null?formData.itemPath+'0.png':formData.itemPath+(team1[4].equip_list[0]||0)+'.png'
      // responseData.p5Item2=team1[4].equip_list==null?formData.itemPath+'0.png':formData.itemPath+(team1[4].equip_list[1]||0)+'.png'

      //team1GoldDiff
      for (let i = 0; i < 5; i++) {
        const goldDiff = team1[i].gold - team2[i].gold;
        responseData[`team1GoldDiff${i + 1}`] =
          goldDiff > 0
            ? goldDiff >= 1000
              ? (goldDiff / 1000).toFixed(1) + "k"
              : goldDiff.toString()
            : "";
      }

      //team2GoldDiff
      for (let i = 0; i < 5; i++) {
        const goldDiff = team2[i].gold - team1[i].gold;
        responseData[`team2GoldDiff${i + 1}`] =
          goldDiff > 0
            ? goldDiff >= 1000
              ? (goldDiff / 1000).toFixed(1) + "k"
              : goldDiff.toString()
            : "";
      }

      //goldDiffPng
      for (let i = 0; i < 5; i++) {
        const team1Gold = team1[i].gold;
        const team2Gold = team2[i].gold;

        const goldDiffPct = (team2Gold / (team1Gold + team2Gold)) * 100;
        const goldDiffPng = `${goldDiffPct.toFixed(0)}.png`;

        responseData[`goldDiffPng${i + 1}`] =
          formData.goldIconPngPath + goldDiffPng;
      }

      let jsonData = { data: [responseData] };
      res.send(jsonData);
    } catch (e) {
      console.error("Error processing data:", e);
      res.status(500).send("Error processing data");
    }
  });
});