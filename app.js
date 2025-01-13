const request = require("request");
const express = require("express");
const fs = require("fs");
const { error } = require("console");
const app = express();

app.use(express.json());
app.use(express.urlencoded());

// Define global variables //254770134480685102
let playerList;
let formData;
let id;
let token;

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    request({ url: url, json: true }, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve({ response, body });
      }
    });
  });
}

// Function to read and update global variables
function readAndUpdateGlobalVariables() {
  fs.readFile("playerList.json", "utf8", (err, playerListData) => {
    if (err) {
      console.error("Error reading playerList.json:", err);
      return;
    }

    fs.readFile("pathData.json", "utf8", (err, pathData) => {
      if (err) {
        console.error("Error reading pathData.json:", err);
        return;
      }

      fs.readFile("pass.json", "utf8", (err, passData) => {
        if (err) {
          console.error("Error reading pass.json:", err);
          return;
        }

        // Parse JSON data and update global variables
        playerList = JSON.parse(playerListData);
        formData = JSON.parse(pathData);
        id = formData.battleid;
        token = JSON.parse(passData).token;

        // // You can now use these global variables anywhere in your script
        // console.log('Player List:', playerList);
        // console.log('Form Data:', formData);
        // console.log('Token:', token);

        // Call functions or perform other operations that depend on these variables
        // ...
      });
    });
  });
}

// Call the function to read and update global variables
readAndUpdateGlobalVariables();

// delete require.cache[require.resolve('./playerList.json')];
// delete require.cache[require.resolve('./pathData.json')];
// delete require.cache[require.resolve('./pass.json')];

// //581722252141704640 // 256264473860831638
// let playerList = require('./playerList.json');
// let formData = require('./pathData.json')
// let id = formData.battleid
// let token = require('./pass.json').token

const formatTime = (number) => {
  const hours = Math.floor(number / 60);
  const minutes = number % 60;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
};

function roles_letter(letter) {
  const roleMap = {
    gold: 1,
    roam: 2,
    mid: 3,
    jg: 4,
    exp: 5,
  };
  return roleMap[letter] || 0;
}

// Example role_sorter function
function role_sorter(array, playerList) {
  // Iterate through the array and assign c_role based on playerList data
  for (const player of array) {
    if (playerList && playerList[player.roleid]) {
      player.c_role = playerList[player.roleid].role;
    } else {
      player.c_role = "undefined";
    }
  }

  // Sort the array based on c_role
  array.sort((a, b) => roles_letter(a.c_role) - roles_letter(b.c_role));

  return array;
}

function name_finder(roleid, playerList) {
  if (playerList[roleid]) {
    return playerList[roleid].name;
  } else {
    return null;
  }
}

function getPickRate(heroid) {
  const rateObj = rate.find((item) => item.id === heroid);

  if (rateObj) {
    return rateObj.pick;
  }

  return null;
}

function getBanRate(heroid) {
  const rateObj = rate.find((item) => item.id === heroid);

  if (rateObj) {
    return rateObj.ban;
  }

  return null;
}

function getWinRate(heroid) {
  const rateObj = rate.find((item) => item.id === heroid);

  if (rateObj) {
    return rateObj.winrate;
  }

  return null;
}

//0874e8b4de7bcdecf0abaddee9b279e2
// let battleData = 'http://esportsdata.mobilelegends.com:30260/battledata?authkey=ee3af4c1a0963e7f052754e66bcb7b6f&battleid=' + id + '&dataid=1';
// let postData = 'http://esportsdata.mobilelegends.com:30260/postdata?authkey=ee3af4c1a0963e7f052754e66bcb7b6f&battleid=' + id;
const roleList = {
  mid: [68803090, 223230224, 483831473, 774330503],
  exp: [94049667, 73886849, 397274893, 188967162],
  gold: [209758451, 65230628, 314791724, 1356202800],
  jungle: [29280266, 78879183, 165882875, 238782140],
  roam: [95662347, 231789508, 198130240, 415045935],
};

const playerNames = {
  68803090: "ACK",
  223230224: "Rinz Wong",
  94049667: "Ying",
  73886849: "Gobs Wong",
  209758451: "Kafuu",
  65230628: "Bunny",
  29280266: "Policy",
  78879183: "ldok",
  95662347: "Gugun",
  231789508: "Tychon",
  165882875: "Ange",
  198130240: "Burman Esports",
  483831473: "TOM",
  397274893: "Wiboy",
  314791724: "UN 7",
  188967162: "Tyke",
  774330503: "Suplax",
  1356202800: "Sweet Coffee",
  415045935: "Yann",
  238782140: "LanShin",
};

// const rate = { 122 : {pick : "77x", ban : "99x", winrate : "100%" } }
const rate = [
  { id: 1, pick: "4x", ban: "0x", winrate: 0.5 },
  { id: 2, pick: "0x", ban: "0x", winrate: 0 },
  { id: 3, pick: "0x", ban: "0x", winrate: 0 },
  { id: 4, pick: "10x", ban: "5x", winrate: 0.6 },
  { id: 5, pick: "0x", ban: "0x", winrate: 0 },
  { id: 6, pick: "19x", ban: "31x", winrate: 0.37 },
  { id: 7, pick: "0x", ban: "0x", winrate: 0 },
  { id: 8, pick: "0x", ban: "0x", winrate: 0 },
  { id: 9, pick: "0x", ban: "0x", winrate: 0 },
  { id: 10, pick: "0x", ban: "0x", winrate: 0 },
  { id: 11, pick: "2x", ban: "0x", winrate: 0 },
  { id: 12, pick: "9x", ban: "4x", winrate: 0.33 },
  { id: 13, pick: "0x", ban: "0x", winrate: 0 },
  { id: 14, pick: "0x", ban: "0x", winrate: 1 },
  { id: 15, pick: "0x", ban: "0x", winrate: 0 },
  { id: 16, pick: "0x", ban: "0x", winrate: 0 },
  { id: 17, pick: "6x", ban: "28x", winrate: 0.5 },
  { id: 18, pick: "0x", ban: "0x", winrate: 0 },
  { id: 19, pick: "11x", ban: "7x", winrate: 0.36 },
  { id: 20, pick: "7x", ban: "10x", winrate: 0.71 },
  { id: 21, pick: "19x", ban: "6x", winrate: 0.63 },
  { id: 22, pick: "0x", ban: "0x", winrate: 0 },
  { id: 23, pick: "0x", ban: "0x", winrate: 0 },
  { id: 24, pick: "0x", ban: "0x", winrate: 0 },
  { id: 25, pick: "0x", ban: "0x", winrate: 0 },
  { id: 26, pick: "14x", ban: "16x", winrate: 0.43 },
  { id: 27, pick: "0x", ban: "0x", winrate: 0 },
  { id: 28, pick: "16x", ban: "10x", winrate: 0.31 },
  { id: 29, pick: "20x", ban: "18x", winrate: 0.35 },
  { id: 30, pick: "0x", ban: "0x", winrate: 0 },
  { id: 31, pick: "34x", ban: "10x", winrate: 0.35 },
  { id: 32, pick: "0x", ban: "0x", winrate: 0 },
  { id: 33, pick: "0x", ban: "0x", winrate: 0 },
  { id: 34, pick: "0x", ban: "0x", winrate: 0 },
  { id: 35, pick: "0x", ban: "0x", winrate: 0 },
  { id: 36, pick: "12x", ban: "6x", winrate: 0.58 },
  { id: 37, pick: "0x", ban: "0x", winrate: 0 },
  { id: 38, pick: "16x", ban: "12x", winrate: 0.63 },
  { id: 39, pick: "31x", ban: "0x", winrate: 0.45 },
  { id: 40, pick: "2x", ban: "0x", winrate: 0 },
  { id: 41, pick: "25x", ban: "20x", winrate: 0.68 },
  { id: 42, pick: "0x", ban: "0x", winrate: 0 },
  { id: 43, pick: "5x", ban: "0x", winrate: 0.8 },
  { id: 44, pick: "8x", ban: "10x", winrate: 0.38 },
  { id: 45, pick: "0x", ban: "0x", winrate: 0 },
  { id: 46, pick: "0x", ban: "0x", winrate: 0 },
  { id: 47, pick: "3x", ban: "2x", winrate: 0.67 },
  { id: 48, pick: "0x", ban: "0x", winrate: 0 },
  { id: 49, pick: "24x", ban: "35x", winrate: 0.42 },
  { id: 50, pick: "24x", ban: "13x", winrate: 0.63 },
  { id: 51, pick: "0x", ban: "0x", winrate: 0 },
  { id: 52, pick: "0x", ban: "0x", winrate: 0 },
  { id: 53, pick: "0x", ban: "0x", winrate: 0 },
  { id: 54, pick: "7x", ban: "5x", winrate: 0.57 },
  { id: 55, pick: "12x", ban: "24x", winrate: 0.5 },
  { id: 56, pick: "0x", ban: "0x", winrate: 0 },
  { id: 57, pick: "0x", ban: "0x", winrate: 0 },
  { id: 58, pick: "0x", ban: "0x", winrate: 0 },
  { id: 59, pick: "0x", ban: "0x", winrate: 0 },
  { id: 60, pick: "2x", ban: "3x", winrate: 0 },
  { id: 61, pick: "0x", ban: "0x", winrate: 0 },
  { id: 62, pick: "0x", ban: "0x", winrate: 0 },
  { id: 63, pick: "0x", ban: "0x", winrate: 0 },
  { id: 64, pick: "0x", ban: "0x", winrate: 0 },
  { id: 65, pick: "12x", ban: "4x", winrate: 0.5 },
  { id: 66, pick: "0x", ban: "0x", winrate: 0 },
  { id: 67, pick: "0x", ban: "0x", winrate: 0 },
  { id: 68, pick: "10x", ban: "13x", winrate: 0.7 },
  { id: 69, pick: "3x", ban: "4x", winrate: 0.33 },
  { id: 70, pick: "3x", ban: "0x", winrate: 0.67 },
  { id: 71, pick: "0x", ban: "0x", winrate: 0 },
  { id: 72, pick: "0x", ban: "0x", winrate: 0 },
  { id: 73, pick: "34x", ban: "34x", winrate: 0.62 },
  { id: 74, pick: "0x", ban: "2x", winrate: 1 },
  { id: 75, pick: "0x", ban: "0x", winrate: 0 },
  { id: 76, pick: "9x", ban: "20x", winrate: 0.56 },
  { id: 77, pick: "0x", ban: "0x", winrate: 0 },
  { id: 78, pick: "9x", ban: "9x", winrate: 0.56 },
  { id: 79, pick: "0x", ban: "0x", winrate: 0 },
  { id: 80, pick: "0x", ban: "0x", winrate: 0 },
  { id: 81, pick: "0x", ban: "0x", winrate: 1 },
  { id: 82, pick: "17x", ban: "8x", winrate: 0.47 },
  { id: 83, pick: "2x", ban: "0x", winrate: 0.5 },
  { id: 84, pick: "22x", ban: "22x", winrate: 0.55 },
  { id: 85, pick: "3x", ban: "0x", winrate: 0.67 },
  { id: 86, pick: "3x", ban: "2x", winrate: 0.33 },
  { id: 87, pick: "0x", ban: "0x", winrate: 0 },
  { id: 88, pick: "0x", ban: "0x", winrate: 0 },
  { id: 89, pick: "7x", ban: "6x", winrate: 0.29 },
  { id: 90, pick: "0x", ban: "0x", winrate: 0 },
  { id: 91, pick: "0x", ban: "0x", winrate: 0 },
  { id: 92, pick: "2x", ban: "3x", winrate: 1 },
  { id: 93, pick: "0x", ban: "0x", winrate: 0 },
  { id: 94, pick: "0x", ban: "0x", winrate: 0 },
  { id: 95, pick: "0x", ban: "0x", winrate: 0 },
  { id: 96, pick: "8x", ban: "11x", winrate: 0.38 },
  { id: 97, pick: "0x", ban: "0x", winrate: 0 },
  { id: 98, pick: "21x", ban: "14x", winrate: 0.52 },
  { id: 99, pick: "0x", ban: "0x", winrate: 0 },
  { id: 100, pick: "0x", ban: "0x", winrate: 0 },
  { id: 101, pick: "9x", ban: "5x", winrate: 0.44 },
  { id: 102, pick: "19x", ban: "31x", winrate: 0.42 },
  { id: 103, pick: "0x", ban: "0x", winrate: 0 },
  { id: 104, pick: "0x", ban: "0x", winrate: 0 },
  { id: 105, pick: "0x", ban: "0x", winrate: 0 },
  { id: 106, pick: "26x", ban: "41x", winrate: 0.58 },
  { id: 107, pick: "16x", ban: "10x", winrate: 0.5 },
  { id: 108, pick: "0x", ban: "0x", winrate: 0 },
  { id: 109, pick: "0x", ban: "0x", winrate: 0 },
  { id: 110, pick: "24x", ban: "4x", winrate: 0.46 },
  { id: 111, pick: "29x", ban: "22x", winrate: 0.48 },
  { id: 112, pick: "0x", ban: "0x", winrate: 0 },
  { id: 113, pick: "0x", ban: "0x", winrate: 0 },
  { id: 114, pick: "0x", ban: "0x", winrate: 0 },
  { id: 115, pick: "0x", ban: "0x", winrate: 0 },
  { id: 116, pick: "7x", ban: "11x", winrate: 0.57 },
  { id: 117, pick: "0x", ban: "0x", winrate: 0 },
  { id: 118, pick: "0x", ban: "0x", winrate: 0 },
  { id: 119, pick: "3x", ban: "0x", winrate: 0.33 },
  { id: 120, pick: "13x", ban: "11x", winrate: 0.54 },
  { id: 121, pick: "0x", ban: "0x", winrate: 0 },
  { id: 122, pick: "27x", ban: "6x", winrate: 0.44 },
  { id: 123, pick: "8x", ban: "0x", winrate: 0.5 },
  { id: 124, pick: "7x", ban: "68x", winrate: 0.57 },
  { id: 125, pick: "20x", ban: "34x", winrate: 0.6 },
  { id: 126, pick: "7x", ban: "0x", winrate: 0.57 },
];

const heroNames = {
  1: "MIYA",
  2: "BALMOND",
  3: "SABER",
  4: "ALICE",
  5: "NANA",
  6: "TIGREAL",
  7: "ALUCARD",
  8: "KARINA",
  9: "AKAI",
  10: "FRANCO",
  11: "BANE",
  12: "BRUNO",
  13: "CLINT",
  14: "RAFAELA",
  15: "EUDORA",
  16: "ZILONG",
  17: "FANNY",
  18: "LAYLA",
  19: "MINOTAUR",
  20: "LOLITA",
  21: "HAYABUSA",
  22: "FREYA",
  23: "GORD",
  24: "NATALIA",
  25: "KAGURA",
  26: "CHOU",
  27: "SUN",
  28: "ALPHA",
  29: "RUBY",
  30: "YI SUN-SHIN",
  31: "MOSKOV",
  32: "JOHNSON",
  33: "CYCLOPS",
  34: "ESTES",
  35: "HILDA",
  36: "AURORA",
  37: "LAPU-LAPU",
  38: "VEXANA",
  39: "ROGER",
  40: "KARRIE",
  41: "GATOTKACA",
  42: "HARLEY",
  43: "IRITHEL",
  44: "GROCK",
  45: "ARGUS",
  46: "ODETTE",
  47: "LANCELOT",
  48: "DIGGIE",
  49: "HYLOS",
  50: "ZHASK",
  51: "HELCURT",
  52: "PHARSA",
  53: "LESLEY",
  54: "JAWHEAD",
  55: "ANGELA",
  56: "GUSION",
  57: "VALIR",
  58: "MARTIS",
  59: "URANUS",
  60: "HANABI",
  61: "CHANG'E",
  62: "KAJA",
  63: "SELENA",
  64: "ALDOUS",
  65: "CLAUDE",
  66: "VALE",
  67: "LEOMORD",
  68: "LUNOX",
  69: "HANZO",
  70: "BELERICK",
  71: "KIMMY",
  72: "THAMUZ",
  73: "HARITH",
  74: "MINSITTHAR",
  75: "KADITA",
  76: "FARAMIS",
  77: "BADANG",
  78: "KHUFRA",
  79: "GRANGER",
  80: "GUINEVERE",
  81: "ESMERALDA",
  82: "TERIZLA",
  83: "X.BORG",
  84: "LING",
  85: "DYRROTH",
  86: "LYLIA",
  87: "BAXIA",
  88: "MASHA",
  89: "WANWAN",
  90: "SILVANNA",
  91: "CECILION",
  92: "CARMILLA",
  93: "ATLAS",
  94: "POPOL AND KUPA",
  95: "YU ZHONG",
  96: "LUO YI",
  97: "BENEDETTA",
  98: "KHALEED",
  99: "BARATS",
  100: "BRODY",
  101: "YVE",
  102: "MATHILDA",
  103: "PAQUITO",
  104: "GLOO",
  105: "BEATRIX",
  106: "PHOVEUS",
  107: "NATAN",
  108: "AULUS",
  109: "AAMON",
  110: "VALENTINA",
  111: "EDITH",
  112: "FLORYN",
  113: "YIN",
  114: "MELISSA",
  115: "XAVIER",
  116: "JULIAN",
  117: "FREDRINN",
  118: "JOY",
  119: "NOVARIA",
  120: "ARLOTT",
  121: "IXIA",
  122: "NOLAN",
  123: "CICI",
  124: "CHIP",
  125: "ZHUXIN",
  126: "SUYOU",
};

// app.get('/token', (req, res) => {
//     res.sendFile(__dirname + '/public/token.html')
// })

// app.post('/tokenup', (req, res) => {
//     const data = req.body.token
//     if (data) {
//         let tokenData = {}
//         tokenData.token = data
//         const jsonFormData = JSON.stringify(tokenData, null, 2)

//         fs.writeFile('pass.json', jsonFormData, (err) => {
//             if (err) {
//                 console.error('Error saving Form data:', err);
//             }
//         })
//         res.status(200).send('Token data Received successfully')
//     } else {
//         res.status(400).send('Invalid data provided.');
//     }
// })

app.get("/reverse", (req, res) => {
  res.sendFile(__dirname + "/public/reverse.html");
});

app.get("/milisecond", (req, res) => {
  res.sendFile(__dirname + "/public/msecond.html");
});

app.get("/timer", (req, res) => {
  res.sendFile(__dirname + "/public/timer.html");
});

app.get("/playerList", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/path", (req, res) => {
  res.sendFile(__dirname + "/public/path.html");
});

app.post("/pathupdate", (req, res) => {
  let newData = req.body;
  if (newData.pass === token) {
    if (newData) {
      const jsonFormData = JSON.stringify(newData, null, 2);

      fs.writeFile("pathData.json", jsonFormData, (err) => {
        if (err) {
          console.error("Error saving Form data:", err);
        }
      });
      readAndUpdateGlobalVariables();
      res.status(200).send("Form data Received successfully");
    } else {
      res.status(400).send("Invalid data provided.");
    }
  } else {
    res.status(400).send("Wrong token.");
  }
});

app.get("/getFormData", (req, res) => {
  fs.readFile("pathData.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading Path data:", err);
      return res.status(500).json({ error: "Error reading playerList data." });
    }

    try {
      const formListData = JSON.parse(data);
      return res.status(200).json(formListData);
    } catch (error) {
      console.error("Error parsing form data:", error);
      return res.status(500).json({ error: "Error parsing form data." });
    }
  });
});

app.post("/up", (req, res) => {
  let newData = req.body;
  if (newData) {
    const fileData = JSON.stringify(newData, null, 2);
    fs.writeFile("playerList.json", fileData, (err) => {
      if (err) {
        console.error("Error saving playerList data:", err);
        //return res.status(500).send('Error saving playerList data.');
      }
    });
    console.log(playerList); // Log the player list data
    readAndUpdateGlobalVariables();
    res.status(200).send("Player list received successfully."); // Respond to the client
  } else {
    res.status(400).send("Invalid data provided.");
  }
});

app.get("/code", (req, res) => {
  res.send({
    code: id,
    playerList,
    formData,
  });
});

app.get("/getplayers", (req, res) => {
  // Read data from playerList.json file
  fs.readFile("playerList.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading playerList data:", err);
      return res.status(500).json({ error: "Error reading playerList data." });
    }

    try {
      // Parse the JSON data into a JavaScript object
      const playerListData = JSON.parse(data);

      // Create a response object with "playerList" key
      const response = {
        playerList: playerListData,
      };

      // Send the response as JSON
      return res.status(200).json(response);
    } catch (parseError) {
      console.error("Error parsing playerList data:", parseError);
      return res.status(500).json({ error: "Error parsing playerList data." });
    }
  });
});

app.get("/stats", (req, res) => {
  // const battleData =
  //   "http://esportsdata.mobilelegends.com:30260/battledata?authkey=0874e8b4de7bcdecf0abaddee9b279e2&battleid=" +
  //   id +
  //   "&dataid=1";
  const postData =
    "http://esportsdata.mobilelegends.com:30260/postdata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
    id;
  request({ url: postData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }
    try {
      let responseData = {};
      let data = body;
      let a = data.data.hero_list;
      let rawTeam1 = a.filter((team) => team.campid == 1);
      let team1 = role_sorter(rawTeam1, playerList);
      let rawTeam2 = a.filter((team) => team.campid == 2);
      let team2 = role_sorter(rawTeam2, playerList);
      let camp1 = data.data.camp_list[0];
      let camp2 = data.data.camp_list[1];
      //find firstblood
      let firstBlood =
        data.data.event_list == null
          ? []
          : data.data.event_list.filter((e) => {
              return (
                e.event_type == "kill_hero" && e.extra_param == "first_blood"
              );
            });
      let firstBloodPlayer = firstBlood[0].roleid;

      //players team 1
      for (let i = 0; i < 5; i++) {
        responseData[`pick${i + 1}`] = heroNames[`${team1[i].heroid}`];
        responseData[`Level${i + 1}`] = team1[i].level;
        responseData[`Kill${i + 1}`] = team1[i].kill_num;
        responseData[`Dead${i + 1}`] = team1[i].dead_num;
        responseData[`Assist${i + 1}`] = team1[i].assist_num;
        responseData[`Gold${i + 1}`] = team1[i].total_money;
        responseData[`GPM${i + 1}`] = team1[i].min_money;
        responseData[`XPM${i + 1}`] = team1[i].xpm;
        responseData[`Damage${i + 1}`] = team1[i].total_damage;
        responseData[`DamageTaken${i + 1}`] = team1[i].total_hurt;
        responseData[`TeamFight${i + 1}`] = null;
        responseData[`kda${i + 1}`] = (
          (team1[i].kill_num + team1[i].assist_num) /
          (team1[i].dead_num + 1)
        ).toFixed(1);
        responseData[`FirstBlood${i + 1}`] =
          team1[i].roleid == firstBloodPlayer ? 1 : 0;
        responseData[`DoubleKill${i + 1}`] = 0;
        responseData[`TripleKill${i + 1}`] = 0;
        responseData[`Miniac${i + 1}`] = 0;
        responseData[`Savage${i + 1}`] = 0;
        responseData[`HealingDone${i + 1}`] = team1[i].total_heal;
        responseData[`Player${i + 1}ID`] = team1[i].roleid;
        responseData[`Player${i + 1}Name`] = name_finder(
          team1[i].roleid,
          playerList
        );
        responseData[`DamageToTower${i + 1}`] = team1[i].total_damage_tower;
      }

      //players team 2
      for (let i = 0; i < 5; i++) {
        responseData[`pick${i + 6}`] = heroNames[`${team2[i].heroid}`];
        responseData[`Level${i + 6}`] = team2[i].level;
        responseData[`Kill${i + 6}`] = team2[i].kill_num;
        responseData[`Dead${i + 6}`] = team2[i].dead_num;
        responseData[`Assist${i + 6}`] = team2[i].assist_num;
        responseData[`Gold${i + 6}`] = team2[i].total_money;
        responseData[`GPM${i + 6}`] = team2[i].min_money;
        responseData[`XPM${i + 6}`] = team2[i].xpm;
        responseData[`Damage${i + 6}`] = team2[i].total_damage;
        responseData[`DamageTaken${i + 6}`] = team2[i].total_hurt;
        responseData[`TeamFight${i + 6}`] = null;
        responseData[`kda${i + 6}`] = (
          (team2[i].kill_num + team2[i].assist_num) /
          (team2[i].dead_num + 1)
        ).toFixed(1);
        responseData[`FirstBlood${i + 6}`] =
          team2[i].roleid == firstBloodPlayer ? 1 : 0;
        responseData[`DoubleKill${i + 6}`] = 0;
        responseData[`TripleKill${i + 6}`] = 0;
        responseData[`Miniac${i + 6}`] = 0;
        responseData[`Savage${i + 6}`] = 0;
        responseData[`HealingDone${i + 6}`] = team2[i].total_heal;
        responseData[`Player${i + 6}ID`] = team2[i].roleid;
        responseData[`Player${i + 6}Name`] = name_finder(
          team2[i].roleid,
          playerList
        );
        responseData[`DamageToTower${i + 6}`] = team2[i].total_damage_tower;
      }

      //lordTurtle
      responseData.Team1Lord = camp1.kill_lord;
      responseData.Team1Turtle = camp1.kill_totoise;
      responseData.Team1Tower = camp1.kill_tower;
      responseData.Team1Damage = camp1.total_damage;
      responseData.Team1Gold = camp1.total_money;
      responseData.Team1RedBuff = camp1.red_buff_num;
      responseData.Team1BlueBuff = camp1.blue_buff_num;
      responseData.Team1Crab = camp1.crab_kill_num;

      responseData.Team2Lord = camp2.kill_lord;
      responseData.Team2Turtle = camp2.kill_totoise;
      responseData.Team2Tower = camp2.kill_tower;
      responseData.Team2Damage = camp2.total_damage;
      responseData.Team2Gold = camp2.total_money;
      responseData.Team2RedBuff = camp2.red_buff_num;
      responseData.Team2BlueBuff = camp2.blue_buff_num;
      responseData.Team2Crab = camp2.crab_kill_num;

      // team2BanHeroList
      responseData.team1BanHeroList = camp1.ban_hero_list.map(
        (hero) => heroNames[hero]
      );
      responseData.team2BanHeroList = camp2.ban_hero_list.map(
        (hero) => heroNames[hero]
      );
      responseData.gameTime = formatTime(data.data.game_time);
      res.send(responseData);
    } catch (e) {
      res.status(500).send(e);
    }
  });
});

app.get("/post-data", (req, res) => {
  const postData =
    "http://esportsdata.mobilelegends.com:30260/postdata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
    id;
  request({ url: postData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }
    try {
      let responseData = {};
      let team1 = body.data.hero_list.filter((player) => player.campid == 1);
      let team2 = body.data.hero_list.filter((player) => player.campid == 2);
      // let team1CampForBan = body.data.camp_list.fileData((camp) => camp.campid == 1);
      // let team2CampForBan = body.data.camp_list.fileData((camp) => camp.campid == 2);
      role_sorter(team1, playerList);
      role_sorter(team2, playerList);

      //team1Score
      let team1TotalKill = 0;
      let team2TotalKill = 0;
      // for (let i = 0; i < 2; i++) {
      //   let team = i == 0 ? team1 : team2;
      //   let teamKill = i == 0 ? team1TotalKill : team2TotalKill;
      //   team.map((player) => (teamKill = teamKill + player.kill_num));
      //   responseData[`team${i + 1}TotalKil`] = teamKill;
      // }

      for (let i = 0; i < 2; i++) {
        let team = i == 0 ? team1 : team2;
        let teamKill = i == 0 ? team1TotalKill : team2TotalKill;
        team.map((player) => (teamKill += player.kill_num));
        responseData[`team${i + 1}TotalKill`] = teamKill; // Corrected key name
      }

      // Calculate the combined total kills of both teams
      let combinedTotalKill =
        responseData.team1TotalKill + responseData.team2TotalKill;
      responseData["combinedTotalKill"] = combinedTotalKill;

      // Check if the combined total kill is even or odd
      if (combinedTotalKill % 2 === 0) {
        responseData["combinedTotalKillStatus"] = "Even";
      } else {
        responseData["combinedTotalKillStatus"] = "Odd";
      }

      // Team1Bars
      const arrayC = team1.concat(team2);
      const highestDamageArr = arrayC.sort(
        (a, b) => b.total_damage - a.total_damage
      );
      const highestDamage = highestDamageArr[0].total_damage;
      arrayC.sort((a, b) => a.campid - b.campid);
      role_sorter(arrayC, playerList);
      arrayC.sort((a, b) => a.campid - b.campid);
      for (let i = 0; i < 10; i++) {
        responseData[`DamageBar${i + 1}`] =
          "C://data/result1/damageBar/" +
          arrayC[i].campid +
          "/" +
          ((arrayC[i].total_damage / highestDamage) * 100).toFixed(0) +
          ".png";
        responseData[`DamageBarName${i + 1}`] = arrayC[i].name;
        responseData[`Damage${i + 1}`] =
          (arrayC[i].total_damage / 1000).toFixed(1) + "K";
      }
      // console.log(highestDamageArr)

      //team1Bans

      //team1Kda
      let team1Kill = 0;
      let team1Dead = 0;
      let team1Assist = 0;
      team1.forEach((player) => {
        team1Kill += player.kill_num;
        team1Dead += player.dead_num;
        team1Assist += player.assist_num;
      });
      let team1KDA = `${team1Kill}/${team1Dead}/${team1Assist}`;
      responseData.team1KDA = team1KDA;

      // team2Kda
      let team2Kill = 0;
      let team2Dead = 0;
      let team2Assist = 0;
      team2.forEach((player) => {
        team2Kill += player.kill_num;
        team2Dead += player.dead_num;
        team2Assist += player.assist_num;
      });
      let team2KDA = `${team2Kill}/${team2Dead}/${team2Assist}`;
      responseData.team2KDA = team2KDA;

      //victory
      responseData.team1Victory =
        body.data.win_camp == 1
          ? "C://data/result/status/1.png"
          : "C://data/result/status/0.png";
      responseData.team2Victory =
        body.data.win_camp == 1
          ? "C://data/result/status/0.png"
          : "C://data/result/status/1.png";
      //teamName
      for (let i = 0; i < 2; i++) {
        responseData[`team${i + 1}Name`] =
          formData[`team${i + 1}_name`] || body.data.camp_list[i].team_name;
      }
      //teamShortName
      for (let i = 0; i < 2; i++) {
        responseData[`team${i + 1}ShortName`] =
          formData[`team${i + 1}_shortName`] ||
          body.data.camp_list[i].team_simple_name;
      }
      //teamLogo
      for (let i = 0; i < 2; i++) {
        responseData[`team${i + 1}Logo`] = `${formData.post1Logo}${
          formData[`team${i + 1}_shortName`] ||
          body.data.camp_list[i].team_simple_name
        }.png`;
      }
      //team1PlayerKDA
      for (let i = 0; i < 5; i++) {
        responseData[
          `team1Player${i + 1}KDA`
        ] = `${team1[i].kill_num} / ${team1[i].dead_num} / ${team1[i].assist_num}`;
      }
      //team2PlayerKDA
      for (let i = 0; i < 5; i++) {
        responseData[
          `team2Player${i + 1}KDA`
        ] = `${team2[i].kill_num} / ${team2[i].dead_num} / ${team2[i].assist_num}`;
      }
      //team1PlayerGold
      for (let i = 0; i < 5; i++) {
        responseData[`team1Player${i + 1}Gold`] = team1[i].total_money;
      }
      //team2Playergold
      for (let i = 0; i < 5; i++) {
        responseData[`team2Player${i + 1}Gold`] = team2[i].total_money;
      }
      //team1PlayerLvl
      for (let i = 0; i < 5; i++) {
        responseData[`team1Player${i + 1}Level`] = team1[i].level;
      }
      //team2PlayerLvl
      for (let i = 0; i < 5; i++) {
        responseData[`team2Player${i + 1}Level`] = team2[i].level;
      }
      //team1PlayerHero
      for (let i = 0; i < 5; i++) {
        responseData[
          `team1Hero${i + 1}`
        ] = `${formData.post1Hero}${team1[i].heroid}.png`;
      }
      //team2PlayerHero
      for (let i = 0; i < 5; i++) {
        responseData[
          `team2Hero${i + 1}`
        ] = `${formData.post1Hero}${team2[i].heroid}.png`;
      }
      //team1PlayerHero2
      for (let i = 0; i < 5; i++) {
        responseData[
          `team1Post2Hero${i + 1}`
        ] = `${formData.post2Hero}${team1[i].heroid}.png`;
      }
      //team2PlayerHero2
      for (let i = 0; i < 5; i++) {
        responseData[
          `team2Post2Hero${i + 1}`
        ] = `${formData.post2Hero}${team2[i].heroid}.png`;
      }
      //team1HeroName
      for (let i = 0; i < 5; i++) {
        responseData[`team1HeroName${i + 1}`] = heroNames[team1[i].heroid];
      }
      //team1HeroName
      for (let i = 0; i < 5; i++) {
        responseData[`team2HeroName${i + 1}`] = heroNames[team2[i].heroid];
      }
      //team1Items
      for (let i = 0; i < 5; i++) {
        for (let n = 0; n < 6; n++) {
          responseData[`team1Player${i + 1}Item${n + 1}`] = `${
            formData.post1ItemPath
          }${team1[i].equip_list[n] == null ? 0 : team1[i].equip_list[n]}.png`;
        }
      }
      //team2Items
      for (let i = 0; i < 5; i++) {
        for (let n = 0; n < 6; n++) {
          responseData[`team2Player${i + 1}Item${n + 1}`] = `${
            formData.post1ItemPath
          }${team2[i].equip_list[n] == null ? 0 : team2[i].equip_list[n]}.png`;
        }
      }
      //team1Name
      for (let i = 0; i < 5; i++) {
        responseData[`player${i + 1}Name`] =
          name_finder(team1[i].roleid, playerList) || team1[i].name;
      }
      //team2Name
      for (let i = 0; i < 5; i++) {
        responseData[`player${i + 6}Name`] =
          name_finder(team2[i].roleid, playerList) || team2[i].name;
      }
      //team1PlayerPic
      for (let i = 0; i < 5; i++) {
        responseData[
          `player${i + 1}Photo`
        ] = `${formData.resultPlayer}${team1[i].roleid}.png`;
      }
      //team2PlayerPic
      for (let i = 0; i < 5; i++) {
        responseData[
          `player${i + 6}Photo`
        ] = `${formData.resultPlayer}${team2[i].roleid}.png`;
      }
      //team1Spell
      for (let i = 0; i < 5; i++) {
        responseData[
          `player${i + 1}Spell`
        ] = `${formData.resultSpell}${team1[i].skillid}.png`;
      }
      //team2Spell
      for (let i = 0; i < 5; i++) {
        responseData[
          `player${i + 6}Spell`
        ] = `${formData.resultSpell}${team2[i].skillid}.png`;
      }
      //team1Emblem
      for (let i = 0; i < 5; i++) {
        for (let n = 0; n < 3; n++) {
          responseData[`player${i + 1}Emblem${n + 1}`] = `${
            formData.resultEmblem
          }${team1[i].rune_map[n + 1] || 0}.png`;
        }
      }
      //team2Emblem
      for (let i = 0; i < 5; i++) {
        for (let n = 0; n < 3; n++) {
          responseData[`player${i + 6}Emblem${n + 1}`] = `${
            formData.resultEmblem
          }${team2[i].rune_map[n + 1] || 0}.png`;
        }
      }
      //team1MainEmblem
      for (let i = 0; i < 5; i++) {
        responseData[
          `player${i + 1}MainEmblem`
        ] = `${formData.MainEmblem}${team1[i].runeid}.png`;
      }
      //team2MainEmblem
      for (let i = 0; i < 5; i++) {
        responseData[
          `player${i + 6}MainEmblem`
        ] = `${formData.MainEmblem}${team2[i].runeid}.png`;
      }
      //teamData
      let camp1 = body.data.camp_list[0];
      let camp2 = body.data.camp_list[1];

      //gold
      for (let i = 0; i < 2; i++) {
        let camp = i == 0 ? camp1 : camp2;
        responseData[`team${i + 1}TotalGold`] =
          camp.total_money.toLocaleString();
      }
      //goldShort
      for (let i = 0; i < 2; i++) {
        let camp = i == 0 ? camp1 : camp2;
        responseData[`team${i + 1}GoldShort`] = `${(
          camp.total_money / 1000
        ).toFixed(1)}k`;
      }
      //tower
      for (let i = 0; i < 2; i++) {
        let camp = i == 0 ? camp1 : camp2;
        responseData[`team${i + 1}Tower`] = camp.kill_tower;
      }
      //lord
      for (let i = 0; i < 2; i++) {
        let camp = i == 0 ? camp1 : camp2;
        responseData[`team${i + 1}Lord`] = camp.kill_lord;
      }
      //turtle
      for (let i = 0; i < 2; i++) {
        let camp = i == 0 ? camp1 : camp2;
        responseData[`team${i + 1}Turtle`] = camp.kill_totoise;
      }
      //red
      for (let i = 0; i < 2; i++) {
        let camp = i == 0 ? camp1 : camp2;
        responseData[`team${i + 1}RedBuff`] = camp.red_buff_num;
      }
      //blue
      for (let i = 0; i < 2; i++) {
        let camp = i == 0 ? camp1 : camp2;
        responseData[`team${i + 1}BlueBuff`] = camp.blue_buff_num;
      }
      //timer
      responseData.gameTime = formatTime(body.data.game_time);
      //Total Damage
      for (let i = 0; i < 2; i++) {
        let camp = i == 0 ? camp1 : camp2;
        responseData[`team${i + 1}TotalDamage`] =
          camp.total_damage.toLocaleString();
      }
      //ddbar
      responseData.toTalDamageBar = `${formData.totalDamageBar}${(
        (camp1.total_damage / (camp1.total_damage + camp2.total_damage)) *
        100
      ).toFixed(0)}.png`;
      //Damage Taken
      for (let i = 0; i < 2; i++) {
        let team = i == 0 ? team1 : team2;
        let totalHurt = 0;
        team.map((player) => (totalHurt = totalHurt + player.total_hurt));
        responseData[`team${i + 1}TotalDamageTaken`] =
          totalHurt.toLocaleString();
      }
      let team1TotalDamageTaken = 0;
      team1.map((player) => (team1TotalDamageTaken += player.total_hurt));
      let team2TotalDamageTaken = 0;
      team2.map((player) => (team2TotalDamageTaken += player.total_hurt));
      //DTBar
      responseData.damageTakenBar = `${formData.totalDamageTakenBar}${(
        (team1TotalDamageTaken /
          (team1TotalDamageTaken + team2TotalDamageTaken)) *
        100
      ).toFixed(0)}.png`;
      //Tower Damage
      for (let i = 0; i < 2; i++) {
        let team = i == 0 ? team1 : team2;
        let totalTowerDamage = 0;
        team.map(
          (player) =>
            (totalTowerDamage = totalTowerDamage + player.total_damage_tower)
        );
        responseData[`team${i + 1}TowerDamage`] =
          totalTowerDamage.toLocaleString();
      }
      let team1TowerDamage = 0;
      team1.map((player) => (team1TowerDamage += player.total_damage_tower));
      let team2TowerDamage = 0;
      team2.map((player) => (team2TowerDamage += player.total_damage_tower));
      //towerBar
      responseData.totalTowerDamageBar = `${formData.totalTowerDamageBar}${(
        (team2TowerDamage / (team1TowerDamage + team2TowerDamage)) *
        100
      ).toFixed(0)}.png`;
      //LTT
      for (let i = 0; i < 2; i++) {
        let camp = i == 0 ? camp1 : camp2;
        responseData[
          `team${i + 1}TurtleLordTurret`
        ] = `${camp.kill_totoise} / ${camp.kill_lord} / ${camp.kill_tower}`;
      }
      let team1Ltt = camp1.kill_lord + camp1.kill_totoise + camp1.kill_tower;
      let team2Ltt = camp2.kill_lord + camp2.kill_totoise + camp2.kill_tower;
      //lttbar
      responseData.TurtleLordTurretBar = `${formData.TurtleLordTurretBar}${(
        (team1Ltt / (team1Ltt + team2Ltt)) *
        100
      ).toFixed(0)}.png`;
      //HightestGold
      let hightestGoldPlayer;
      let hightestDamagePlayer;
      let hightestDamageTaken;
      let hightestAssist;
      let allData = body.data.hero_list;
      allData.sort((a, b) => b.total_money - a.total_money);
      hightestGoldPlayer = allData[0];
      allData.sort((a, b) => b.total_damage - a.total_damage);
      hightestDamagePlayer = allData[0];
      allData.sort((a, b) => b.total_hurt - a.total_hurt);
      hightestDamageTaken = allData[0];
      allData.sort((a, b) => b.assist_num - a.assist_num);
      hightestAssist = allData[0];
      // console.log(hightestGoldPlayer.name)
      // console.log(hightestDamagePlayer.name)
      // console.log(hightestDamageTaken.name)
      // console.log(hightestAssist.name);
      //gold
      responseData.hightestGoldPlayer =
        name_finder(hightestGoldPlayer.roleid, playerList) ||
        hightestGoldPlayer.name;
      responseData.hightestGoldPlayerPic = `${formData.hightest}${hightestGoldPlayer.roleid}.png`;
      responseData.hightestGold = hightestGoldPlayer.min_money;
      //damage
      responseData.hightestDamagePlayer =
        name_finder(hightestDamagePlayer.roleid, playerList) ||
        hightestDamagePlayer.name;
      responseData.hightestDamagePlayerPic = `${formData.hightest}${hightestDamagePlayer.roleid}.png`;
      responseData.hightestDamage =
        hightestDamagePlayer.total_damage.toLocaleString();
      //damageTaken
      responseData.hightestDamageTakenPlayer =
        name_finder(hightestDamageTaken.roleid, playerList) ||
        hightestDamageTaken.name;
      responseData.hightestDamageTakenPlayerPic = `${formData.hightest}${hightestDamageTaken.roleid}.png`;
      responseData.hightestDamageTaken =
        hightestDamageTaken.total_hurt.toLocaleString();
      //mostAssist
      responseData.hightestAssistPlayer =
        name_finder(hightestAssist.roleid, playerList) || hightestAssist.name;
      responseData.hightestAssistPlayerPic = `${formData.hightest}${hightestAssist.roleid}.png`;
      responseData.hightestAssist = hightestAssist.assist_num;

      let jsonData = { data: [responseData] };
      res.send(jsonData);
    } catch (e) {
      res.status(500).send(e);
    }
  });
});

app.get("/mvp", (req, res) => {
  const postData =
    "http://esportsdata.mobilelegends.com:30260/postdata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
    id;
  request({ url: postData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }

    try {
      let responseData = {};
      let winner = body.data.win_camp;
      let mvpPlayer = body.data.hero_list.find(
        (player) => player.campid === winner && player.mvp === true
      );

      let winnerPlayers = body.data.hero_list.filter(
        (player) => player.campid === winner
      );
      let totalKill = 0;
      winnerPlayers.map((player) => (totalKill += player.kill_num));

      // responseData.winnerTeamName = formData[`team${winner}_name`] || mvpPlayer.team_name;
      responseData.winnerTeamName =
        winner == 1
          ? formData.team1_name
          : formData.team2_name || mvpPlayer.team_name;
      responseData.ShortName =
        winner == 1
          ? formData.team1_shortName
          : formData.team2_shortName || mvpPlayer.team_simple_name;
      responseData.teamLogo =
        winner == 1
          ? `${formData.mvpLogoPath}${formData.team1_shortName}.png`
          : `${formData.mvpLogoPath}${formData.team2_shortName}.png`;
      responseData.mvpPlayerName =
        name_finder(mvpPlayer.roleid, playerList) || mvpPlayer.name;
      responseData.mvpPlayerPic = `${formData.mvpPlayerPath}${mvpPlayer.roleid}.png`;
      responseData.heroName = heroNames[mvpPlayer.heroid];
      responseData.heroPic = `${formData.mvpHeroPath}${mvpPlayer.heroid}.png`;
      responseData.BattleSpell = `${formData.mvpPlayerSpellPath}${mvpPlayer.skillid}.png`;

      for (let i = 0; i < 3; i++) {
        responseData[`emblem${i + 1}`] = `${formData.mvpEmblemPath}${
          mvpPlayer.rune_map[i + 1]
        }.png`;
      }
      //customemblem
      responseData.emblem4 = `${formData.mvpEmblemPath}${mvpPlayer.runeid}.png`;

      //items
      for (let i = 0; i < 6; i++) {
        responseData[`item${i + 1}`] = `${formData.mvpPlayerItemPath}${
          mvpPlayer.equip_list[i] == null ? 0 : mvpPlayer.equip_list[i]
        }.png`;
      }

      responseData.kda = `${mvpPlayer.kill_num}/${mvpPlayer.dead_num}/${mvpPlayer.assist_num}`;
      responseData.gpm = mvpPlayer.min_money;
      // console.log(totalKill);

      responseData.kp = `${(
        ((mvpPlayer.kill_num + mvpPlayer.assist_num) / totalKill) *
        100
      ).toFixed(0)}%`;
      responseData.level = mvpPlayer.level;
      let jsonData = { data: [responseData] };
      res.send(jsonData);
    } catch (e) {
      res.status(500).send(e);
    }
  });
});

app.get("/damageRanking", (req, res) => {
  const battleData =
    "http://esportsdata.mobilelegends.com:30260/battledata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }

    try {
      let a = body.data.camp_list;
      const selectedCamps = a.filter(
        (camp) => camp.campid === 1 || camp.campid === 2
      );
      const players = selectedCamps
        .map((camp) => camp.player_list)
        .flat()
        .map((player) => {
          return {
            team: player.campid,
            id: player.roleid,
            name: name_finder(player.roleid, playerList) || player.name,
            damage: player.total_damage,
            damageShort: `${(player.total_damage / 1000).toFixed(1)}k`,
            hero: `${formData.damageRankingHeroPath}${player.heroid}.png`,
          };
        });
      players.sort((a, b) => b.damage - a.damage);
      let hightestDamage = players[0].damage;

      players.forEach((player, index) => {
        const percent = ((player.damage / hightestDamage) * 100).toFixed(0);
        player.percentPng = `${formData.damagePercentPngPath}${player.team}/${
          index === 0 ? "100" : percent === "100" ? "99" : percent
        }.png`;
      });
      res.send(players);
    } catch (e) {
      return res.status(500).send(e);
    }
  });
});

app.get("/goldRanking", (req, res) => {
  const battleData =
    "http://esportsdata.mobilelegends.com:30260/battledata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }

    try {
      let a = body.data.camp_list;
      const selectedCamps = a.filter(
        (camp) => camp.campid === 1 || camp.campid === 2
      );
      const players = selectedCamps
        .map((camp) => camp.player_list)
        .flat()
        .map((player) => {
          return {
            team: player.campid,
            id: player.roleid,
            name: name_finder(player.roleid, playerList) || player.name,
            gold: player.gold,
            goldShort: `${(player.gold / 1000).toFixed(1)}k`,
            hero: `${formData.goldRankingHeroPath}${player.heroid}.png`,
          };
        });
      players.sort((a, b) => b.gold - a.gold);
      let highestGold = players[0].gold;

      players.forEach((player, index) => {
        const percent = ((player.gold / highestGold) * 100).toFixed(0);
        player.percentPng = `${formData.goldPercentPngPath}${player.team}/${
          index === 0 ? "100" : percent === "100" ? "99" : percent
        }.png`;
      });
      res.send(players);
    } catch (e) {
      return res.status(500).send(e);
    }
  });
});

app.get("/hud", async (req, res) => {
  try {
    const battleData =
      "http://esportsdata.mobilelegends.com:30260/battledata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
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
    responseData.team1TurtleKill = team1.kill_tortoise;
    responseData.team2TurtleKill = team2.kill_tortoise;

    //lordKill
    responseData.team1LordKill = team1.kill_lord;
    responseData.team2LordKill = team2.kill_lord;

    //totalKill
    for (let i = 0; i < 2; i++) {
      const team = a[i];
      responseData[`team${i + 1}TotalKill`] = team.score;
    }

    //TowerDestory
    for (let i = 0; i < 2; i++) {
      const team = a[i];
      responseData[`team${i + 1}TowerDestoryed`] = team.kill_tower;
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
    let miniac =
      data.incre_event_list == null
        ? []
        : data.incre_event_list.filter((e) => {
            return (
              e.event_type == "kill_hero" && e.extra_param == "quadra_kill"
            );
          });

    //savage
    let savage =
      data.incre_event_list == null
        ? []
        : data.incre_event_list.filter((e) => {
            return e.event_type == "kill_hero" && e.extra_param == "penta_kill";
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
      responseData.savagePlayerPic = `${formData.bossKillerPath}${lastsavage.killer_id}.png`;
      responseData.savagePlayerPicTeamLogo =
        lastsavage.campid == 1
          ? `${formData.bossKillerLogoPath}${formData.team1_shortName}.png`
          : `${formData.bossKillerLogoPath}${formData.team2_shortName}.png`;
    } else {
      responseData.savagePlayerName = "";
      responseData.savagePlayerPic = `${formData.bossKillerPath}0.png`;
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
      responseData.miniacPlayerPic = `${formData.bossKillerPath}${lastMiniac.killer_id}.png`;
      responseData.miniacPlayerPicTeamLogo =
        lastMiniac.campid == 1
          ? `${formData.bossKillerLogoPath}${formData.team1_shortName}.png`
          : `${formData.bossKillerLogoPath}${formData.team2_shortName}.png`;
    } else {
      responseData.miniacPlayerName = "";
      responseData.miniacPlayerPic = `${formData.bossKillerPath}0.png`;
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
      responseData.tripleKillPlayerPic = `${formData.bossKillerPath}${lasttripleKill.killer_id}.png`;
      responseData.tripleKillPlayerPicTeamLogo =
        lasttripleKill.campid == 1
          ? `${formData.bossKillerLogoPath}${formData.team1_shortName}.png`
          : `${formData.bossKillerLogoPath}${formData.team2_shortName}.png`;
    } else {
      responseData.tripleKillPlayerName = "";
      responseData.tripleKillPlayerPic = `${formData.bossKillerPath}0.png`;
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
      responseData.firstBloodPlayerName = name_finder(
        lastfirstBlood.killer_id,
        playerList
      );
      responseData.firstBloodPlayerPic = `${formData.bossKillerPath}${lastfirstBlood.killer_id}.png`;
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
    }

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
    }

    let jsonData = { data: [responseData] };
    res.send(jsonData);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.get("/emblem", (req, res) => {
  const battleData =
    "http://esportsdata.mobilelegends.com:30260/battledata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send("Error Fething Data");
    }
    try {
      let responseData = {};
      let a = body.data.camp_list;

      let team1 = role_sorter(a[0].player_list, playerList);
      let team2 = role_sorter(a[1].player_list, playerList);

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
      //Team2spells
      for (let i = 0; i < 5; i++) {
        responseData[`custom${i + 1}`] =
          `${formData.emblemPath}${team1[i].rune_id}.png` || "";
      }
      for (let i = 0; i < 5; i++) {
        responseData[`custom${i + 6}`] =
          `${formData.emblemPath}${team2[i].rune_id}.png` || "";
      }

      let jsonData = { data: [responseData] };
      res.send(jsonData);
    } catch (e) {
      console.error("Error processing data:", e);
      res.status(500).send("Error processing data");
    }
  });
});

app.get("/draft", (req, res) => {
  const battleData =
    "http://esportsdata.mobilelegends.com:30260/battledata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }
    let responseData = {};
    let data = body;
    let a = data.data.camp_list;
    let team1 = a[0].player_list;
    let team2 = a[1].player_list;
    // let team1 = role_sorter(a[0].player_list, playerList);
    // let team2 = role_sorter(a[1].player_list, playerList);
    // const team1 = role_sorter(a[0].player_list, playerList)
    // const team2 = role_sorter(a[1].player_list, playerList)
    //team Name
    responseData.team1playerlogo = `C://data/draft/playerlogo/${
      formData.team1_shortName || a[0].team_simple_name
    }.png`;
    responseData.team2playerlogo = `C://data/draft/playerlogo/${
      formData.team2_shortName || a[1].team_simple_name
    }.png`;
    responseData.team1Name =
      formData.team1_name || data.data.camp_list[0].team_name;
    responseData.team2Name =
      formData.team2_name || data.data.camp_list[1].team_name;
    //teamShortName
    responseData.team1ShortName =
      formData.team1_shortName || a[0].team_simple_name;
    responseData.team2ShortName =
      formData.team2_shortName || a[1].team_simple_name;
    //team Logo
    responseData.team1Logo =
      formData.draft_logo_path +
      (formData.team1_shortName || a[0].team_simple_name) +
      ".png";
    responseData.team2Logo =
      formData.draft_logo_path +
      (formData.team2_shortName || a[1].team_simple_name) +
      ".png";
    //playerNames
    responseData.player1Name =
      name_finder(a[0].player_list[0].roleid, playerList) ||
      a[0].player_list[0].name;
    responseData.player2Name =
      name_finder(a[0].player_list[1].roleid, playerList) ||
      a[0].player_list[1].name;
    responseData.player3Name =
      name_finder(a[0].player_list[2].roleid, playerList) ||
      a[0].player_list[2].name;
    responseData.player4Name =
      name_finder(a[0].player_list[3].roleid, playerList) ||
      a[0].player_list[3].name;
    responseData.player5Name =
      name_finder(a[0].player_list[4].roleid, playerList) ||
      a[0].player_list[4].name;

    responseData.player6Name =
      name_finder(a[1].player_list[0].roleid, playerList) ||
      a[1].player_list[0].name;
    responseData.player7Name =
      name_finder(a[1].player_list[1].roleid, playerList) ||
      a[1].player_list[1].name;
    responseData.player8Name =
      name_finder(a[1].player_list[2].roleid, playerList) ||
      a[1].player_list[2].name;
    responseData.player9Name =
      name_finder(a[1].player_list[3].roleid, playerList) ||
      a[1].player_list[3].name;
    responseData.player10Name =
      name_finder(a[1].player_list[4].roleid, playerList) ||
      a[1].player_list[4].name;

    //pics
    responseData.player1Pic =
      `${formData.draft_player_pic}${a[0].player_list[0].roleid}.png` || "";
    responseData.player2Pic =
      `${formData.draft_player_pic}${a[0].player_list[1].roleid}.png` || "";
    responseData.player3Pic =
      `${formData.draft_player_pic}${a[0].player_list[2].roleid}.png` || "";
    responseData.player4Pic =
      `${formData.draft_player_pic}${a[0].player_list[3].roleid}.png` || "";
    responseData.player5Pic =
      `${formData.draft_player_pic}${a[0].player_list[4].roleid}.png` || "";

    responseData.player6Pic =
      `${formData.draft_player_pic}${a[1].player_list[0].roleid}.png` || "";
    responseData.player7Pic =
      `${formData.draft_player_pic}${a[1].player_list[1].roleid}.png` || "";
    responseData.player8Pic =
      `${formData.draft_player_pic}${a[1].player_list[2].roleid}.png` || "";
    responseData.player9Pic =
      `${formData.draft_player_pic}${a[1].player_list[3].roleid}.png` || "";
    responseData.player10Pic =
      `${formData.draft_player_pic}${a[1].player_list[4].roleid}.png` || "";

    //ledPlayers
    for (let i = 0; i < 5; i++) {
      responseData[
        `ledplayerPic${i + 1}`
      ] = `${formData.LedPlayerPicYes}led/${team1[i].roleid}.png`;
    }
    for (let i = 0; i < 5; i++) {
      responseData[
        `ledplayerPic${i + 6}`
      ] = `${formData.LedPlayerPicYes}led/${team2[i].roleid}.png`;
    }

    //pickrate
    // responseData.pickrate1 = rate[a[0].player_list[0].heroid].pick || "0"

    //pickrate
    for (let i = 0; i < 5; i++) {
      responseData[`pickrate${i + 1}`] = getPickRate(
        a[0].player_list[i].heroid
      );
    }

    for (let i = 0; i < 5; i++) {
      responseData[`pickrate${i + 6}`] = getPickRate(
        a[1].player_list[i].heroid
      );
    }

    //banrate
    for (let i = 0; i < 5; i++) {
      responseData[`banrate${i + 1}`] = getBanRate(a[0].player_list[i].heroid);
    }

    for (let i = 0; i < 5; i++) {
      responseData[`banrate${i + 6}`] = getBanRate(a[1].player_list[i].heroid);
    }

    //winrate
    for (let i = 0; i < 5; i++) {
      responseData[`winrate${i + 1}`] =
        (getWinRate(a[0].player_list[i].heroid) * 100).toFixed(0) + "%";
    }

    for (let i = 0; i < 5; i++) {
      responseData[`winrate${i + 6}`] =
        (getWinRate(a[1].player_list[i].heroid) * 100).toFixed(0) + "%";
    }

    //pickHeroName
    responseData.pick1Name = heroNames[a[0].player_list[0].heroid] || "";
    responseData.pick2Name = heroNames[a[0].player_list[1].heroid] || "";
    responseData.pick3Name = heroNames[a[0].player_list[2].heroid] || "";
    responseData.pick4Name = heroNames[a[0].player_list[3].heroid] || "";
    responseData.pick5Name = heroNames[a[0].player_list[4].heroid] || "";

    responseData.pick6Name = heroNames[a[1].player_list[0].heroid] || "";
    responseData.pick7Name = heroNames[a[1].player_list[1].heroid] || "";
    responseData.pick8Name = heroNames[a[1].player_list[2].heroid] || "";
    responseData.pick9Name = heroNames[a[1].player_list[3].heroid] || "";
    responseData.pick10Name = heroNames[a[1].player_list[4].heroid] || "";

    //pickversion2
    for (let i = 0; i < 5; i++) {
      responseData[`pickHero${i + 1}`] =
        "C://data/draft/pick/" + team1[i].heroid + ".png";
      responseData[`spell${i + 1}`] =
        "C://data/draft/spell/" + team1[i].skillid + ".png";
    }

    for (let i = 0; i < 5; i++) {
      responseData[`pickHero${i + 6}`] =
        "C://data/draft/pick/" + team2[i].heroid + ".png";
      responseData[`spell${i + 6}`] =
        "C://data/draft/spell/" + team2[i].skillid + ".png";
    }

    //arrow
    responseData.arrow1 = `C://data/draft/arrow/0.png`;
    responseData.arrow2 = `C://data/draft/arrow/0.png`;

    //team1Arrow
    if (
      a[0].player_list[0].picking == true ||
      a[0].player_list[0].banning == true
    ) {
      responseData.arrow1 = `C://data/draft/arrow/1.png`;
    } else if (
      a[0].player_list[1].picking == true ||
      a[0].player_list[1].banning == true
    ) {
      responseData.arrow1 = `C://data/draft/arrow/1.png`;
    } else if (
      a[0].player_list[2].picking == true ||
      a[0].player_list[2].banning == true
    ) {
      responseData.arrow1 = `C://data/draft/arrow/1.png`;
    } else if (
      a[0].player_list[3].picking == true ||
      a[0].player_list[3].banning == true
    ) {
      responseData.arrow1 = `C://data/draft/arrow/1.png`;
    } else if (
      a[0].player_list[4].picking == true ||
      a[0].player_list[4].banning == true
    ) {
      responseData.arrow1 = `C://data/draft/arrow/1.png`;
    } else {
      responseData.arrow1 = `C://data/draft/arrow/2.png`;
    }

    // //team2Arrow
    // if (a[1].player_list[0].picking == true || a[1].player_list[0].banning == true) {
    //   responseData.arrow2 = `C://data/draft/arrow/2.png`
    // } else if (a[1].player_list[1].picking == true || a[1].player_list[1].banning == true) {
    //   responseData.arrow2 = `C://data/draft/arrow/2.png`
    // } else if (a[1].player_list[2].picking == true || a[1].player_list[2].banning == true) {
    //   responseData.arrow2 = `C://data/draft/arrow/2.png`
    // } else if (a[1].player_list[3].picking == true || a[1].player_list[3].banning == true) {
    //   responseData.arrow2 = `C://data/draft/arrow/2.png`
    // } else if(a[1].player_list[4].picking == true || a[1].player_list[4].banning == true) {
    //   responseData.arrow2 = `C://data/draft/arrow/2.png`
    // } else {
    //   responseData.arrow2 = `C://data/draft/arrow/0.png`
    // }

    //picked1
    responseData.picking1 = 0;
    responseData.picked1 = 0;
    responseData.border1 = "C://data/draft/border/0.png";
    if (a[0].player_list[0].picking == true) {
      responseData.picking1 = 1;
      responseData.border1 = "C://data/draft/border/1.png";
    } else if (
      a[0].player_list[0].picking == false &&
      a[0].player_list[0].heroid !== 0
    ) {
      responseData.picking1 = 1;
      responseData.picked1 = 1;
    }

    //picked2
    responseData.picking2 = 0;
    responseData.picked2 = 0;
    responseData.border = "C://data/draft/border/0.png";
    if (a[0].player_list[1].picking == true) {
      responseData.picking2 = 1;
      responseData.border2 = "C://data/draft/border/1.png";
    } else if (
      a[0].player_list[1].picking == false &&
      a[0].player_list[1].heroid !== 0
    ) {
      responseData.picking2 = 1;
      responseData.picked2 = 1;
    }

    //picked3
    responseData.picking3 = 0;
    responseData.picked3 = 0;
    responseData.border3 = "C://data/draft/border/0.png";
    if (a[0].player_list[2].picking == true) {
      responseData.picking3 = 1;
      responseData.border3 = "C://data/draft/border/1.png";
    } else if (
      a[0].player_list[2].picking == false &&
      a[0].player_list[2].heroid !== 0
    ) {
      responseData.picking3 = 1;
      responseData.picked3 = 1;
    }

    //picked4
    responseData.picking4 = 0;
    responseData.picked4 = 0;
    responseData.border4 = "C://data/draft/border/0.png";
    if (a[0].player_list[3].picking == true) {
      responseData.picking4 = 1;
      responseData.border4 = "C://data/draft/border/1.png";
    } else if (
      a[0].player_list[3].picking == false &&
      a[0].player_list[3].heroid !== 0
    ) {
      responseData.picking4 = 1;
      responseData.picked4 = 1;
    }

    //picked5
    responseData.picking5 = 0;
    responseData.picked5 = 0;
    responseData.border5 = "C://data/draft/border/0.png";
    if (a[0].player_list[4].picking == true) {
      responseData.picking5 = 1;
      responseData.border5 = "C://data/draft/border/1.png";
    } else if (
      a[0].player_list[4].picking == false &&
      a[0].player_list[4].heroid !== 0
    ) {
      responseData.picking5 = 1;
      responseData.picked5 = 1;
    }

    //picked6
    responseData.picking6 = 0;
    responseData.picked6 = 0;
    responseData.border6 = "C://data/draft/border/0.png";
    if (a[1].player_list[0].picking == true) {
      responseData.picking6 = 1;
      responseData.border6 = "C://data/draft/border/1.png";
    } else if (
      a[1].player_list[0].picking == false &&
      a[1].player_list[0].heroid !== 0
    ) {
      responseData.picking6 = 1;
      responseData.picked6 = 1;
    }

    //picked7
    responseData.picking7 = 0;
    responseData.picked7 = 0;
    responseData.border7 = "C://data/draft/border/0.png";
    if (a[1].player_list[1].picking == true) {
      responseData.picking7 = 1;
      responseData.border7 = "C://data/draft/border/1.png";
    } else if (
      a[1].player_list[1].picking == false &&
      a[1].player_list[1].heroid !== 0
    ) {
      responseData.picking7 = 1;
      responseData.picked7 = 1;
    }

    //picked8
    responseData.picking8 = 0;
    responseData.picked8 = 0;
    responseData.border8 = "C://data/draft/border/0.png";
    if (a[1].player_list[2].picking == true) {
      responseData.picking8 = 1;
      responseData.border8 = "C://data/draft/border/1.png";
    } else if (
      a[1].player_list[2].picking == false &&
      a[1].player_list[2].heroid !== 0
    ) {
      responseData.picking8 = 1;
      responseData.picked8 = 1;
    }

    //picked9
    responseData.picking9 = 0;
    responseData.picked9 = 0;
    responseData.border9 = "C://data/draft/border/0.png";
    if (a[1].player_list[3].picking == true) {
      responseData.picking9 = 1;
      responseData.border9 = "C://data/draft/border/1.png";
    } else if (
      a[1].player_list[3].picking == false &&
      a[1].player_list[3].heroid !== 0
    ) {
      responseData.picking9 = 1;
      responseData.picked9 = 1;
    }

    //picked10
    responseData.picking10 = 0;
    responseData.picked10 = 0;
    responseData.border10 = "C://data/draft/border/0.png";
    if (a[1].player_list[4].picking == true) {
      responseData.picking10 = 1;
      responseData.border10 = "C://data/draft/border/1.png";
    } else if (
      a[1].player_list[4].picking == false &&
      a[1].player_list[4].heroid !== 0
    ) {
      responseData.picking10 = 1;
      responseData.picked10 = 1;
    }
    //banForResutl
    for (let i = 0; i < 5; i++) {
      responseData[`banPicForResult${i + 1}`] =
        "C://data/result1/ban/" + team1[i].ban_heroid + ".png";
    }

    for (let i = 0; i < 5; i++) {
      responseData[`banPicForResult${i + 6}`] =
        "C://data/result1/ban/" + team2[i].ban_heroid + ".png";
    }

    //team1Player1Banning
    if (a[0].player_list[0].banning == true) {
      responseData.ban1 = formData.banning || "";
      // responseData.ledPic1 = formData.draftLedDefault || "";
    }
    //aferBanning
    else if (a[0].player_list[0].ban_heroid != 0) {
      responseData.ban1 =
        `${formData.banHeroPath}${a[0].player_list[0].ban_heroid}.png` || "";
    }
    //beforeBanning
    else {
      responseData.ban1 = formData.defaultBan + ".png" || "";
    }

    //team1Player2Banning
    if (a[0].player_list[1].banning == true) {
      responseData.ban2 = formData.banning || "";
    }
    //aferBanning
    else if (a[0].player_list[1].ban_heroid != 0) {
      responseData.ban2 =
        `${formData.banHeroPath}${a[0].player_list[1].ban_heroid}.png` || "";
    }
    //beforeBanning
    else {
      responseData.ban2 = formData.defaultBan + ".png" || "";
    }
    //---------------------------------------------------------------------------------------
    //team1Player3Banning
    if (a[0].player_list[2].banning == true) {
      responseData.ban3 = formData.banning || "";
    }
    //aferBanning
    else if (a[0].player_list[2].ban_heroid != 0) {
      responseData.ban3 =
        `${formData.banHeroPath}${a[0].player_list[2].ban_heroid}.png` || "";
    }
    //beforeBanning
    else {
      responseData.ban3 = formData.defaultBan + ".png" || "";
    }

    //---------------------------------------------------------------------------------------
    //team1Player4Banning
    if (a[0].player_list[3].banning == true) {
      responseData.ban4 = formData.banning || "";
    }
    //aferBanning
    else if (a[0].player_list[3].ban_heroid != 0) {
      responseData.ban4 =
        `${formData.banHeroPath}${a[0].player_list[3].ban_heroid}.png` || "";
    }
    //beforeBanning
    else {
      responseData.ban4 = formData.defaultBan + ".png" || "";
    }

    //---------------------------------------------------------------------------------------
    //Player5Banning
    if (a[0].player_list[4].banning == true) {
      responseData.ban5 = formData.banning || "";
    }
    //aferBanning
    else if (a[0].player_list[4].ban_heroid != 0) {
      responseData.ban5 =
        `${formData.banHeroPath}${a[0].player_list[4].ban_heroid}.png` || "";
    }
    //beforeBanning
    else {
      responseData.ban5 = formData.defaultBan + ".png" || "";
    }

    //---------------------------------------------------------------------------------------
    //Player6Banning
    if (a[1].player_list[0].banning == true) {
      responseData.ban6 = formData.banning || "";
    }
    //aferBanning
    else if (a[1].player_list[0].ban_heroid != 0) {
      responseData.ban6 =
        `${formData.banHeroPath}${a[1].player_list[0].ban_heroid}.png` || "";
    }
    //beforeBanning
    else {
      responseData.ban6 = formData.defaultBan + ".png" || "";
    }

    //---------------------------------------------------------------------------------------
    //Player7Banning
    if (a[1].player_list[1].banning == true) {
      responseData.ban7 = formData.banning || "";
    }
    //aferBanning
    else if (a[1].player_list[1].ban_heroid != 0) {
      responseData.ban7 =
        `${formData.banHeroPath}${a[1].player_list[1].ban_heroid}.png` || "";
    }
    //beforeBanning
    else {
      responseData.ban7 = formData.defaultBan + ".png" || "";
    }

    //---------------------------------------------------------------------------------------
    //Player8Banning
    if (a[1].player_list[2].banning == true) {
      responseData.ban8 = formData.banning || "";
    }
    //aferBanning
    else if (a[1].player_list[2].ban_heroid != 0) {
      responseData.ban8 =
        `${formData.banHeroPath}${a[1].player_list[2].ban_heroid}.png` || "";
    }
    //beforeBanning
    else {
      responseData.ban8 = formData.defaultBan + ".png" || "";
    }

    //---------------------------------------------------------------------------------------
    //Player9Banning
    if (a[1].player_list[3].banning == true) {
      responseData.ban9 = formData.banning || "";
    }
    //aferBanning
    else if (a[1].player_list[3].ban_heroid != 0) {
      responseData.ban9 =
        `${formData.banHeroPath}${a[1].player_list[3].ban_heroid}.png` || "";
    }
    //beforeBanning
    else {
      responseData.ban9 = formData.defaultBan + ".png" || "";
    }

    //---------------------------------------------------------------------------------------
    //Player10Banning
    if (a[1].player_list[4].banning == true) {
      responseData.ban10 = formData.banning || "";
    }
    //aferBanning
    else if (a[1].player_list[4].ban_heroid != 0) {
      responseData.ban10 =
        `${formData.banHeroPath}${a[1].player_list[4].ban_heroid}.png` || "";
    }
    //beforeBanning
    else {
      responseData.ban10 = formData.defaultBan + ".png" || "";
    }

    for (let i = 0; i < 5; i++) {
      responseData[`ID${i+1}`] = a[0].player_list[i].heroid
    }

    for (let i = 0; i < 5; i++) {
      responseData[`ID${i+6}`] = a[1].player_list[i].heroid
    }

    //---------------------------------------------------------------------------------------
    //player1picking
    if (a[0].player_list[0].picking == true) {
      responseData.pick1 =
        `${formData.draft_player_pic}${a[0].player_list[0].roleid}${formData.draft_player_action}` ||
        "";
      responseData.ledPic1 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[0].player_list[0].heroid != 0) {
      responseData.pick1 =
        `${formData.hero}${a[0].player_list[0].heroid}${formData.heroImageSequence}` ||
        "";
      responseData.ledPic1 =
        `${formData.PickedLed}${a[0].player_list[0].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick1 =
        `${formData.draft_player_pic}${a[0].player_list[0].roleid}${formData.draft_player_default}` ||
        "";
      responseData.ledPic1 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player2picking
    if (a[0].player_list[1].picking == true) {
      responseData.pick2 =
        `${formData.draft_player_pic}${a[0].player_list[1].roleid}${formData.draft_player_action}` ||
        "";
      responseData.ledPic2 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[0].player_list[1].heroid != 0) {
      responseData.pick2 =
        `${formData.hero}${a[0].player_list[1].heroid}${formData.heroImageSequence}` ||
        "";
      responseData.ledPic2 =
        `${formData.PickedLed}${a[0].player_list[1].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick2 =
        `${formData.draft_player_pic}${a[0].player_list[1].roleid}${formData.draft_player_default}` ||
        "";
      responseData.ledPic2 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player3picking
    if (a[0].player_list[2].picking == true) {
      responseData.pick3 =
        `${formData.draft_player_pic}${a[0].player_list[2].roleid}${formData.draft_player_action}` ||
        "";
      responseData.ledPic3 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[0].player_list[2].heroid != 0) {
      responseData.pick3 =
        `${formData.hero}${a[0].player_list[2].heroid}${formData.heroImageSequence}` ||
        "";
      responseData.ledPic3 =
        `${formData.PickedLed}${a[0].player_list[2].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick3 =
        `${formData.draft_player_pic}${a[0].player_list[2].roleid}${formData.draft_player_default}` ||
        "";
      responseData.ledPic3 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player4picking
    if (a[0].player_list[3].picking == true) {
      responseData.pick4 =
        `${formData.draft_player_pic}${a[0].player_list[3].roleid}${formData.draft_player_action}` ||
        "";
      responseData.ledPic4 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[0].player_list[3].heroid != 0) {
      responseData.pick4 =
        `${formData.hero}${a[0].player_list[3].heroid}${formData.heroImageSequence}` ||
        "";
      responseData.ledPic4 =
        `${formData.PickedLed}${a[0].player_list[3].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick4 =
        `${formData.draft_player_pic}${a[0].player_list[3].roleid}${formData.draft_player_default}` ||
        "";
      responseData.ledPic4 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player5picking
    if (a[0].player_list[4].picking == true) {
      responseData.pick5 =
        `${formData.draft_player_pic}${a[0].player_list[4].roleid}${formData.draft_player_action}` ||
        "";
      responseData.ledPic5 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[0].player_list[4].heroid != 0) {
      responseData.pick5 =
        `${formData.hero}${a[0].player_list[4].heroid}${formData.heroImageSequence}` ||
        "";
      responseData.ledPic5 =
        `${formData.PickedLed}${a[0].player_list[4].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick5 =
        `${formData.draft_player_pic}${a[0].player_list[4].roleid}${formData.draft_player_default}` ||
        "";
      responseData.ledPic5 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player6picking
    if (a[1].player_list[0].picking == true) {
      responseData.pick6 =
        `${formData.draft_player_pic}${a[1].player_list[0].roleid}${formData.draft_player_action}` ||
        "";
      responseData.ledPic6 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[1].player_list[0].heroid != 0) {
      responseData.pick6 =
        `${formData.hero}${a[1].player_list[0].heroid}${formData.heroImageSequence}` ||
        "";
      responseData.ledPic6 =
        `${formData.PickedLed}${a[1].player_list[0].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick6 =
        `${formData.draft_player_pic}${a[1].player_list[0].roleid}${formData.draft_player_default}` ||
        "";
      responseData.ledPic6 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player7picking
    if (a[1].player_list[1].picking == true) {
      responseData.pick7 =
        `${formData.draft_player_pic}${a[1].player_list[1].roleid}${formData.draft_player_action}` ||
        "";
      responseData.ledPic7 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[1].player_list[1].heroid != 0) {
      responseData.pick7 =
        `${formData.hero}${a[1].player_list[1].heroid}${formData.heroImageSequence}` ||
        "";
      responseData.ledPic7 =
        `${formData.PickedLed}${a[1].player_list[1].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick7 =
        `${formData.draft_player_pic}${a[1].player_list[1].roleid}${formData.draft_player_default}` ||
        "";
      responseData.ledPic7 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player8picking
    if (a[1].player_list[2].picking == true) {
      responseData.pick8 =
        `${formData.draft_player_pic}${a[1].player_list[2].roleid}${formData.draft_player_action}` ||
        "";
      responseData.ledPic8 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[1].player_list[2].heroid != 0) {
      responseData.pick8 =
        `${formData.hero}${a[1].player_list[2].heroid}${formData.heroImageSequence}` ||
        "";
      responseData.ledPic8 =
        `${formData.PickedLed}${a[1].player_list[2].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick8 =
        `${formData.draft_player_pic}${a[1].player_list[2].roleid}${formData.draft_player_default}` ||
        "";
      responseData.ledPic8 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player9picking
    if (a[1].player_list[3].picking == true) {
      responseData.pick9 =
        `${formData.draft_player_pic}${a[1].player_list[3].roleid}${formData.draft_player_action}` ||
        "";
      responseData.ledPic9 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[1].player_list[3].heroid != 0) {
      responseData.pick9 =
        `${formData.hero}${a[1].player_list[3].heroid}${formData.heroImageSequence}` ||
        "";
      responseData.ledPic9 =
        `${formData.PickedLed}${a[1].player_list[3].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick9 =
        `${formData.draft_player_pic}${a[1].player_list[3].roleid}${formData.draft_player_default}` ||
        "";
      responseData.ledPic9 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player10picking
    if (a[1].player_list[4].picking == true) {
      responseData.pick10 =
        `${formData.draft_player_pic}${a[1].player_list[4].roleid}${formData.draft_player_action}` ||
        "";
      responseData.ledPic10 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[1].player_list[4].heroid != 0) {
      responseData.pick10 =
        `${formData.hero}${a[1].player_list[4].heroid}${formData.heroImageSequence}` ||
        "";
      responseData.ledPic10 =
        `${formData.PickedLed}${a[1].player_list[4].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick10 =
        `${formData.draft_player_pic}${a[1].player_list[4].roleid}${formData.draft_player_default}` ||
        "";
      responseData.ledPic10 = formData.notPickingLed || "";
    }

    responseData.timer = `00:${data.data.state_left_time
      .toString()
      .padStart(2, "0")}`;

    //vs
    for (let i = 0; i < 5; i++) {
      responseData[`vsPlayer${i + 1}Pic`] =
        `C://data/vs/player/${a[0].player_list[i].roleid}.png` || "";
    }

    for (let i = 0; i < 5; i++) {
      responseData[`vsPlayer${i + 6}Pic`] =
        `C://data/vs/player/${a[1].player_list[i].roleid}.png` || "";
    }

    //vsheroTeam1
    for (let i = 0; i < 5; i++) {
      responseData[`vsHero${i + 1}Pic`] =
        `C://data/vs/hero/${a[0].player_list[i].heroid}.png` || "";
    }

    //vsheroTeam2
    for (let i = 0; i < 5; i++) {
      responseData[`vsHero${i + 6}Pic`] =
        `C://data/vs/hero/${a[1].player_list[i].heroid}.png` || "";
    }

    let jsonData = { data: [responseData] };
    res.send(jsonData);
  });
});

app.get("/led", (req, res) => {
  const battleData =
    "http://esportsdata.mobilelegends.com:30260/battledata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send("Error fetching Data");
    }
    try {
      let responseData = {};
      let data = body;
      let a = data.data.camp_list;
      let team1 = role_sorter(a[0].player_list, playerList);
      let team2 = role_sorter(a[1].player_list, playerList);
      let rawteam1 = a[0].player_list;
      let rawteam2 = a[1].player_list;

      //time
      for (let i = 0; i < 5; i++) {
        responseData[`respawntime${i + 1}`] = formatTime(
          team1[i].revive_left_time
        );
      }

      for (let i = 0; i < 5; i++) {
        responseData[`respawntime${i + 6}`] = formatTime(
          team2[i].revive_left_time
        );
      }

      for (let i = 0; i < 5; i++) {
        responseData[`name${i + 1}`] =
          name_finder(team1[i].roleid, playerList) || team1[i].name;
      }

      for (let i = 0; i < 5; i++) {
        responseData[`name${i + 6}`] =
          name_finder(team2[i].roleid, playerList) || team2[i].name;
      }

      for (let i = 0; i < 5; i++) {
        responseData[`alive${i + 1}`] =
          team1[i].revive_left_time == 0
            ? `${formData.yes}${team1[i].heroid}.png`
            : `${formData.no}${team1[i].heroid}.png`;
      }

      for (let i = 0; i < 5; i++) {
        responseData[`alive${i + 6}`] =
          team2[i].revive_left_time == 0
            ? `${formData.yes}${team2[i].heroid}.png`
            : `${formData.no}${team2[i].heroid}.png`;
      }

      //playeridPic
      for (let i = 0; i < 5; i++) {
        responseData[`alivePlayerPic${i + 1}`] =
          rawteam1[i].revive_left_time == 0
            ? `${formData.LedPlayerPicYes}${rawteam1[i].roleid}.png`
            : `${formData.LedPlayerPicNo}${rawteam1[i].roleid}.png`;
      }

      for (let i = 0; i < 5; i++) {
        responseData[`alivePlayerPic${i + 6}`] =
          rawteam2[i].revive_left_time == 0
            ? `${formData.LedPlayerPicYes}${rawteam2[i].roleid}.png`
            : `${formData.LedPlayerPicNo}${rawteam2[i].roleid}.png`;
      }

      let jsonData = { data: [responseData] };
      res.send(jsonData);
    } catch (e) {
      res.status(500).send(e);
    }
  });
});

app.get("/item", (req, res) => {
  const battleData =
    "http://esportsdata.mobilelegends.com:30260/battledata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
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

      //playerNames
      responseData.player1Name =
        name_finder(team1[0].roleid, playerList) || team1[0].name;
      responseData.player2Name =
        name_finder(team1[1].roleid, playerList) || team1[1].name;
      responseData.player3Name =
        name_finder(team1[2].roleid, playerList) || team1[2].name;
      responseData.player4Name =
        name_finder(team1[3].roleid, playerList) || team1[3].name;
      responseData.player5Name =
        name_finder(team1[4].roleid, playerList) || team1[4].name;

      responseData.player6Name =
        name_finder(team2[0].roleid, playerList) || team2[0].name;
      responseData.player7Name =
        name_finder(team2[1].roleid, playerList) || team2[1].name;
      responseData.player8Name =
        name_finder(team2[2].roleid, playerList) || team2[2].name;
      responseData.player9Name =
        name_finder(team2[3].roleid, playerList) || team2[3].name;
      responseData.player10Name =
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
      responseData.gold1Short =
        team1[0].gold >= 1000
          ? (team1[0].gold / 1000).toFixed(1) + "k"
          : team1[0].gold.toString();
      responseData.gold2Short =
        team1[1].gold >= 1000
          ? (team1[1].gold / 1000).toFixed(1) + "k"
          : team1[1].gold.toString();
      responseData.gold3Short =
        team1[2].gold >= 1000
          ? (team1[2].gold / 1000).toFixed(1) + "k"
          : team1[2].gold.toString();
      responseData.gold4Short =
        team1[3].gold >= 1000
          ? (team1[3].gold / 1000).toFixed(1) + "k"
          : team1[3].gold.toString();
      responseData.gold5Short =
        team1[4].gold >= 1000
          ? (team1[4].gold / 1000).toFixed(1) + "k"
          : team1[4].gold.toString();

      responseData.gold6Short =
        team2[0].gold >= 1000
          ? (team2[0].gold / 1000).toFixed(1) + "k"
          : team2[0].gold.toString();
      responseData.gold7Short =
        team2[1].gold >= 1000
          ? (team2[1].gold / 1000).toFixed(1) + "k"
          : team2[1].gold.toString();
      responseData.gold8Short =
        team2[2].gold >= 1000
          ? (team2[2].gold / 1000).toFixed(1) + "k"
          : team2[2].gold.toString();
      responseData.gold9Short =
        team2[3].gold >= 1000
          ? (team2[3].gold / 1000).toFixed(1) + "k"
          : team2[3].gold.toString();
      responseData.gold10Short =
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

app.get("/golddiff", (req, res) => {
  const battleData =
    "http://esportsdata.mobilelegends.com:30260/battledata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }
    try {
      const data = body;
      let responseData = {};
      let team = data.data.camp_list;
      let team1 = role_sorter(team[0].player_list, playerList);
      let team2 = role_sorter(team[1].player_list, playerList);
      arrayC = team1.concat(team2);
      arrayC.sort((a, b) => b.gold - a.gold);
      let hightestGold = arrayC[0].gold;
      role_sorter(team1, playerList);
      role_sorter(team2, playerList);
      // console.log(hightestGold)
      //team1gold
      for (let i = 0; i < 5; i++) {
        responseData[`Name${i + 1}`] =
          name_finder(team1[i].roleid, playerList) || team1[i].name;
        responseData[`Hero${i + 1}`] =
          "C://data/golddiff/hero/" + team1[i].heroid + ".png";
        responseData[`Player${i + 1}Gold`] = team1[i].gold;
        responseData[`Bar${i + 1}`] =
          "C://data/golddiff/" +
          team1[i].campid +
          "/" +
          ((team1[i].gold / hightestGold) * 100).toFixed(0) +
          ".png";
      }

      //team2gold
      for (let i = 0; i < 5; i++) {
        responseData[`Name${i + 6}`] =
          name_finder(team2[i].roleid, playerList) || team2[i].name;
        responseData[`Hero${i + 6}`] =
          "C://data/golddiff/hero/" + team2[i].heroid + ".png";
        responseData[`Player${i + 6}Gold`] = team2[i].gold;
        responseData[`Bar${i + 6}`] =
          "C://data/golddiff/" +
          team2[i].campid +
          "/" +
          ((team2[i].gold / hightestGold) * 100).toFixed(0) +
          ".png";
      }

      let jsonData = { data: [responseData] };

      res.send(jsonData);
    } catch (e) {
      res.status(500).send(e);
    }
  });
});

app.get("/draftled", (req, res) => {
  const battleData =
    "http://esportsdata.mobilelegends.com:30260/battledata?authkey=7a468a893e13486ef75107559fea97ef&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }
    let responseData = {};
    let data = body;
    let a = data.data.camp_list;
    // let team1 = a[0].player_list;
    // let team2 = a[1].player_list;
    let team1 = role_sorter(a[0].player_list, playerList);
    let team2 = role_sorter(a[1].player_list, playerList);
    // const team1 = role_sorter(a[0].player_list, playerList)
    // const team2 = role_sorter(a[1].player_list, playerList)
    //team Name
    responseData.team1playerlogo = `C://data/draft/playerlogo/${
      formData.team1_shortName || a[0].team_simple_name
    }.png`;
    responseData.team2playerlogo = `C://data/draft/playerlogo/${
      formData.team2_shortName || a[1].team_simple_name
    }.png`;
    responseData.team1Name =
      formData.team1_name || data.data.camp_list[0].team_name;
    responseData.team2Name =
      formData.team2_name || data.data.camp_list[1].team_name;
    //teamShortName
    responseData.team1ShortName =
      formData.team1_shortName || a[0].team_simple_name;
    responseData.team2ShortName =
      formData.team2_shortName || a[1].team_simple_name;
    //team Logo
    responseData.team1Logo =
      formData.draft_logo_path +
      (formData.team1_shortName || a[0].team_simple_name) +
      ".png";
    responseData.team2Logo =
      formData.draft_logo_path +
      (formData.team2_shortName || a[1].team_simple_name) +
      ".png";
    //playerNames
    responseData.player1Name =
      name_finder(a[0].player_list[0].roleid, playerList) ||
      a[0].player_list[0].name;
    responseData.player2Name =
      name_finder(a[0].player_list[1].roleid, playerList) ||
      a[0].player_list[1].name;
    responseData.player3Name =
      name_finder(a[0].player_list[2].roleid, playerList) ||
      a[0].player_list[2].name;
    responseData.player4Name =
      name_finder(a[0].player_list[3].roleid, playerList) ||
      a[0].player_list[3].name;
    responseData.player5Name =
      name_finder(a[0].player_list[4].roleid, playerList) ||
      a[0].player_list[4].name;

    responseData.player6Name =
      name_finder(a[1].player_list[0].roleid, playerList) ||
      a[1].player_list[0].name;
    responseData.player7Name =
      name_finder(a[1].player_list[1].roleid, playerList) ||
      a[1].player_list[1].name;
    responseData.player8Name =
      name_finder(a[1].player_list[2].roleid, playerList) ||
      a[1].player_list[2].name;
    responseData.player9Name =
      name_finder(a[1].player_list[3].roleid, playerList) ||
      a[1].player_list[3].name;
    responseData.player10Name =
      name_finder(a[1].player_list[4].roleid, playerList) ||
      a[1].player_list[4].name;

    //ledPlayers
    for (let i = 0; i < 5; i++) {
      responseData[
        `ledplayerPic${i + 1}`
      ] = `C://data/led/draft/player/${team1[i].roleid}.png`;
    }
    for (let i = 0; i < 5; i++) {
      responseData[
        `ledplayerPic${i + 6}`
      ] = `C://data/led/draft/player/${team2[i].roleid}.png`;
    }

    //pickrate
    // responseData.pickrate1 = rate[a[0].player_list[0].heroid].pick || "0"

    //pickrate
    for (let i = 0; i < 5; i++) {
      responseData[`pickrate${i + 1}`] = getPickRate(
        a[0].player_list[i].heroid
      );
    }

    for (let i = 0; i < 5; i++) {
      responseData[`pickrate${i + 6}`] = getPickRate(
        a[1].player_list[i].heroid
      );
    }

    //banrate
    for (let i = 0; i < 5; i++) {
      responseData[`banrate${i + 1}`] = getBanRate(a[0].player_list[i].heroid);
    }

    for (let i = 0; i < 5; i++) {
      responseData[`banrate${i + 6}`] = getBanRate(a[1].player_list[i].heroid);
    }

    //winrate
    for (let i = 0; i < 5; i++) {
      responseData[`winrate${i + 1}`] =
        (getWinRate(a[0].player_list[i].heroid) * 100).toFixed(0) + "%";
    }

    for (let i = 0; i < 5; i++) {
      responseData[`winrate${i + 6}`] =
        (getWinRate(a[1].player_list[i].heroid) * 100).toFixed(0) + "%";
    }

    //pickHeroName
    responseData.pick1Name = heroNames[a[0].player_list[0].heroid] || "";
    responseData.pick2Name = heroNames[a[0].player_list[1].heroid] || "";
    responseData.pick3Name = heroNames[a[0].player_list[2].heroid] || "";
    responseData.pick4Name = heroNames[a[0].player_list[3].heroid] || "";
    responseData.pick5Name = heroNames[a[0].player_list[4].heroid] || "";

    responseData.pick6Name = heroNames[a[1].player_list[0].heroid] || "";
    responseData.pick7Name = heroNames[a[1].player_list[1].heroid] || "";
    responseData.pick8Name = heroNames[a[1].player_list[2].heroid] || "";
    responseData.pick9Name = heroNames[a[1].player_list[3].heroid] || "";
    responseData.pick10Name = heroNames[a[1].player_list[4].heroid] || "";
    //picked1
    responseData.picking1 = 0;
    responseData.picked1 = 0;
    responseData.border1 = "C://data/draft/border/0.png";
    if (a[0].player_list[0].picking == true) {
      responseData.picking1 = 1;
      responseData.border1 = "C://data/draft/border/1.png";
    } else if (
      a[0].player_list[0].picking == false &&
      a[0].player_list[0].heroid !== 0
    ) {
      responseData.picking1 = 1;
      responseData.picked1 = 1;
    }

    //picked2
    responseData.picking2 = 0;
    responseData.picked2 = 0;
    responseData.border = "C://data/draft/border/0.png";
    if (a[0].player_list[1].picking == true) {
      responseData.picking2 = 1;
      responseData.border2 = "C://data/draft/border/1.png";
    } else if (
      a[0].player_list[1].picking == false &&
      a[0].player_list[1].heroid !== 0
    ) {
      responseData.picking2 = 1;
      responseData.picked2 = 1;
    }

    //picked3
    responseData.picking3 = 0;
    responseData.picked3 = 0;
    responseData.border3 = "C://data/draft/border/0.png";
    if (a[0].player_list[2].picking == true) {
      responseData.picking3 = 1;
      responseData.border3 = "C://data/draft/border/1.png";
    } else if (
      a[0].player_list[2].picking == false &&
      a[0].player_list[2].heroid !== 0
    ) {
      responseData.picking3 = 1;
      responseData.picked3 = 1;
    }

    //picked4
    responseData.picking4 = 0;
    responseData.picked4 = 0;
    responseData.border4 = "C://data/draft/border/0.png";
    if (a[0].player_list[3].picking == true) {
      responseData.picking4 = 1;
      responseData.border4 = "C://data/draft/border/1.png";
    } else if (
      a[0].player_list[3].picking == false &&
      a[0].player_list[3].heroid !== 0
    ) {
      responseData.picking4 = 1;
      responseData.picked4 = 1;
    }

    //picked5
    responseData.picking5 = 0;
    responseData.picked5 = 0;
    responseData.border5 = "C://data/draft/border/0.png";
    if (a[0].player_list[4].picking == true) {
      responseData.picking5 = 1;
      responseData.border5 = "C://data/draft/border/1.png";
    } else if (
      a[0].player_list[4].picking == false &&
      a[0].player_list[4].heroid !== 0
    ) {
      responseData.picking5 = 1;
      responseData.picked5 = 1;
    }

    //picked6
    responseData.picking6 = 0;
    responseData.picked6 = 0;
    responseData.border6 = "C://data/draft/border/0.png";
    if (a[1].player_list[0].picking == true) {
      responseData.picking6 = 1;
      responseData.border6 = "C://data/draft/border/1.png";
    } else if (
      a[1].player_list[0].picking == false &&
      a[1].player_list[0].heroid !== 0
    ) {
      responseData.picking6 = 1;
      responseData.picked6 = 1;
    }

    //picked7
    responseData.picking7 = 0;
    responseData.picked7 = 0;
    responseData.border7 = "C://data/draft/border/0.png";
    if (a[1].player_list[1].picking == true) {
      responseData.picking7 = 1;
      responseData.border7 = "C://data/draft/border/1.png";
    } else if (
      a[1].player_list[1].picking == false &&
      a[1].player_list[1].heroid !== 0
    ) {
      responseData.picking7 = 1;
      responseData.picked7 = 1;
    }

    //picked8
    responseData.picking8 = 0;
    responseData.picked8 = 0;
    responseData.border8 = "C://data/draft/border/0.png";
    if (a[1].player_list[2].picking == true) {
      responseData.picking8 = 1;
      responseData.border8 = "C://data/draft/border/1.png";
    } else if (
      a[1].player_list[2].picking == false &&
      a[1].player_list[2].heroid !== 0
    ) {
      responseData.picking8 = 1;
      responseData.picked8 = 1;
    }

    //picked9
    responseData.picking9 = 0;
    responseData.picked9 = 0;
    responseData.border9 = "C://data/draft/border/0.png";
    if (a[1].player_list[3].picking == true) {
      responseData.picking9 = 1;
      responseData.border9 = "C://data/draft/border/1.png";
    } else if (
      a[1].player_list[3].picking == false &&
      a[1].player_list[3].heroid !== 0
    ) {
      responseData.picking9 = 1;
      responseData.picked9 = 1;
    }

    //picked10
    responseData.picking10 = 0;
    responseData.picked10 = 0;
    responseData.border10 = "C://data/draft/border/0.png";
    if (a[1].player_list[4].picking == true) {
      responseData.picking10 = 1;
      responseData.border10 = "C://data/draft/border/1.png";
    } else if (
      a[1].player_list[4].picking == false &&
      a[1].player_list[4].heroid !== 0
    ) {
      responseData.picking10 = 1;
      responseData.picked10 = 1;
    }

    //---------------------------------------------------------------------------------------
    //player1picking
    if (a[0].player_list[0].picking == true) {
      responseData.pick1 =
        `C://data/led/draft/player/${a[0].player_list[0].roleid}.png` || "";
      responseData.ledPic1 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[0].player_list[0].heroid != 0) {
      responseData.pick1 =
        `C://data/led/draft/hero/${a[0].player_list[0].heroid}.png` || "";
      responseData.ledPic1 =
        `${formData.PickedLed}${a[0].player_list[0].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick1 =
        `C://data/led/draft/player/${a[0].player_list[0].roleid}.png` || "";
      responseData.ledPic1 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player2picking
    if (a[0].player_list[1].picking == true) {
      responseData.pick2 =
        `C://data/led/draft/player/${a[0].player_list[1].roleid}.png` || "";
      responseData.ledPic2 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[0].player_list[1].heroid != 0) {
      responseData.pick2 =
        `C://data/led/draft/hero/${a[0].player_list[1].heroid}.png` || "";
      responseData.ledPic2 =
        `${formData.PickedLed}${a[0].player_list[1].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick2 =
        `C://data/led/draft/player/${a[0].player_list[1].roleid}.png` || "";
      responseData.ledPic2 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player3picking
    if (a[0].player_list[2].picking == true) {
      responseData.pick3 =
        `C://data/led/draft/player/${a[0].player_list[2].roleid}.png` || "";
      responseData.ledPic3 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[0].player_list[2].heroid != 0) {
      responseData.pick3 =
        `C://data/led/draft/hero/${a[0].player_list[2].heroid}.png` || "";
      responseData.ledPic3 =
        `${formData.PickedLed}${a[0].player_list[2].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick3 =
        `C://data/led/draft/player/${a[0].player_list[2].roleid}.png` || "";
      responseData.ledPic3 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player4picking
    if (a[0].player_list[3].picking == true) {
      responseData.pick4 =
        `C://data/led/draft/player/${a[0].player_list[3].roleid}.png` || "";
      responseData.ledPic4 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[0].player_list[3].heroid != 0) {
      responseData.pick4 =
        `C://data/led/draft/hero/${a[0].player_list[3].heroid}.png` || "";
      responseData.ledPic4 =
        `${formData.PickedLed}${a[0].player_list[3].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick4 =
        `C://data/led/draft/player/${a[0].player_list[3].roleid}.png` || "";
      responseData.ledPic4 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player5picking
    if (a[0].player_list[4].picking == true) {
      responseData.pick5 =
        `C://data/led/draft/player/${a[0].player_list[4].roleid}.png` || "";
      responseData.ledPic5 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[0].player_list[4].heroid != 0) {
      responseData.pick5 =
        `C://data/led/draft/hero/${a[0].player_list[4].heroid}.png` || "";
      responseData.ledPic5 =
        `${formData.PickedLed}${a[0].player_list[4].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick5 =
        `C://data/led/draft/player/${a[0].player_list[4].roleid}.png` || "";
      responseData.ledPic5 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player6picking
    if (a[1].player_list[0].picking == true) {
      responseData.pick6 =
        `C://data/led/draft/player/${a[1].player_list[0].roleid}.png` || "";
      responseData.ledPic6 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[1].player_list[0].heroid != 0) {
      responseData.pick6 =
        `C://data/led/draft/hero/${a[1].player_list[0].heroid}.png` || "";
      responseData.ledPic6 =
        `${formData.PickedLed}${a[1].player_list[0].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick6 =
        `C://data/led/draft/player/${a[1].player_list[0].roleid}.png` || "";
      responseData.ledPic6 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player7picking
    if (a[1].player_list[1].picking == true) {
      responseData.pick7 =
        `C://data/led/draft/player/${a[1].player_list[1].roleid}.png` || "";
      responseData.ledPic7 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[1].player_list[1].heroid != 0) {
      responseData.pick7 =
        `C://data/led/draft/hero/${a[1].player_list[1].heroid}.png` || "";
      responseData.ledPic7 =
        `${formData.PickedLed}${a[1].player_list[1].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick7 =
        `C://data/led/draft/player/${a[1].player_list[1].roleid}.png` || "";
      responseData.ledPic7 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player8picking
    if (a[1].player_list[2].picking == true) {
      responseData.pick8 =
        `C://data/led/draft/player/${a[1].player_list[2].roleid}.png` || "";
      responseData.ledPic8 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[1].player_list[2].heroid != 0) {
      responseData.pick8 =
        `C://data/led/draft/hero/${a[1].player_list[2].heroid}.png` || "";
      responseData.ledPic8 =
        `${formData.PickedLed}${a[1].player_list[2].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick8 =
        `C://data/led/draft/player/${a[1].player_list[2].roleid}.png` || "";
      responseData.ledPic8 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player9picking
    if (a[1].player_list[3].picking == true) {
      responseData.pick9 =
        `C://data/led/draft/player/${a[1].player_list[3].roleid}.png` || "";
      responseData.ledPic9 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[1].player_list[3].heroid != 0) {
      responseData.pick9 =
        `C://data/led/draft/hero/${a[1].player_list[3].heroid}.png` || "";
      responseData.ledPic9 =
        `${formData.PickedLed}${a[1].player_list[3].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick9 =
        `C://data/led/draft/player/${a[1].player_list[3].roleid}.png` || "";
      responseData.ledPic9 = formData.notPickingLed || "";
    }

    //---------------------------------------------------------------------------------------
    //player10picking
    if (a[1].player_list[4].picking == true) {
      responseData.pick10 =
        `C://data/led/draft/player/${a[1].player_list[4].roleid}.png` || "";
      responseData.ledPic10 = formData.notPickingLed || "";
    }
    //afterPicking
    else if (a[1].player_list[4].heroid != 0) {
      responseData.pick10 =
        `C://data/led/draft/hero/${a[1].player_list[4].heroid}.png` || "";
      responseData.ledPic10 =
        `${formData.PickedLed}${a[1].player_list[4].heroid}.png` || "";
    }
    //before picking
    else {
      responseData.pick10 =
        `C://data/led/draft/player/${a[1].player_list[4].roleid}.png` || "";
      responseData.ledPic10 = formData.notPickingLed || "";
    }

    responseData.timer = `00:${data.data.state_left_time
      .toString()
      .padStart(2, "0")}`;

    let jsonData = { data: [responseData] };
    res.send(jsonData);
  });
});

app.listen(3000, () => {
  console.log("Server Running on localhost:3000");
});
