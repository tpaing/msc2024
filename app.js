const request = require("request");
const express = require("express");
const fs = require("fs");
const { error, Console } = require("console");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Define global variables //254770134480685102
let playerList;
let formData;
let id;
let token;

let displayGameTime = 0; // Initialize local game time
let lastApiSyncTime = 0; // Track the last API game time for sync reference
let gameState = ""; // Track game state

// Function to fetch API game time and sync local game time
const syncGameTime = async () => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
    id +
    "&dataid=1";

  try {
    const { response, body } = await makeRequest(battleData);

    if (response.statusCode === 200) {
      const apiGameTime = body.data.game_time;
      gameState = body.data.state; // Get game state from API

      if (gameState === "play") {
        if (Math.abs(displayGameTime - apiGameTime) > 1) {
          displayGameTime = apiGameTime; // Sync if there's a noticeable difference
        }
      } else {
        displayGameTime = apiGameTime; // Reset if not in play state
      }

      lastApiSyncTime = apiGameTime;
    } else {
      console.error("API sync failed with status:", response.statusCode);
    }
  } catch (error) {
    console.error("Error syncing with API:", error);
  }
};

// Increment local game time every second, only when state is "play"
setInterval(() => {
  if (gameState === "play") {
    displayGameTime++;
  }
}, 1000);

// Sync with API every 10 seconds
setInterval(syncGameTime, 1000);

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
    exp: 1,
    jg: 2,
    mid: 3,
    roam: 4,
    gold: 5,
  };
  return roleMap[letter] || 0;
}

// Enhanced role_finder function with better error handling
// function roleFinderTw(roleid, playerList) {
//   try {
//     // Validate inputs
//     if (roleid === null || roleid === undefined) {
//       console.warn('role_finder: roleid is null or undefined');
//       return "undefined";
//     }

//     if (!playerList || typeof playerList !== 'object') {
//       console.warn('role_finder: playerList is invalid or missing');
//       return "undefined";
//     }

//     // Convert roleid to string for consistent key lookup if needed
//     const keyToCheck = String(roleid);
    
//     // Check multiple possible key formats
//     const possibleKeys = [roleid, keyToCheck, parseInt(roleid)];
    
//     for (const key of possibleKeys) {
//       if (playerList[key]) {
//         if (playerList[key].role && typeof playerList[key].role === 'string') {
//           return playerList[key].role;
//         }
//         // If player exists but no role, log it
//         console.warn(`Player ${roleid} found but no role specified`);
//       }
//     }

//     // Log when player is not found
//     console.warn(`Player with ID ${roleid} not found in playerList`);
//     return "undefined";

//   } catch (error) {
//     console.error('Error in role_finder:', error, { 
//       roleid, 
//       playerListKeys: Object.keys(playerList || {}).slice(0, 10) // Show first 10 keys for debugging
//     });
//     return "undefined";
//   }
// }

// Role finder function - takes a single roleid and returns the role
function role_finder(roleid, playerList) {
  try {
    // Check if playerList exists and is valid
    if (!playerList || typeof playerList !== 'object') {
      return "undefined";
    }
    
    // Check if roleid exists and is valid
    if (roleid === null || roleid === undefined) {
      return "undefined";
    }
    
    // Check if the roleid exists in playerList and has a role property
    if (playerList[roleid] && playerList[roleid].role) {
      return playerList[roleid].role;
    }
    
    // If roleid not found in playerList, return undefined
    return "undefined";
    
  } catch (error) {
    // If any error occurs, return undefined
    console.error('Error in role_finder:', error);
    return "undefined";
  }
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
// let battleData = 'http://esportsdata-sg.mobilelegends.com/battledata?authkey=ee3af4c1a0963e7f052754e66bcb7b6f&battleid=' + id + '&dataid=1';
// let postData = 'http://esportsdata-sg.mobilelegends.com/postdata?authkey=ee3af4c1a0963e7f052754e66bcb7b6f&battleid=' + id;
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
let rate = JSON.parse(fs.readFileSync('winrate.json', 'utf8'));

const _rateBackup = [
  {
    "id": 1,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 2,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 3,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 4,
    "pick": 9,
    "ban": 6,
    "winrate": 0.33
  },
  {
    "id": 5,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 6,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 7,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 8,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 9,
    "pick": 1,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 10,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 11,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 12,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 13,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 14,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 15,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 16,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 17,
    "pick": 2,
    "ban": 10,
    "winrate": 1
  },
  {
    "id": 18,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 19,
    "pick": 1,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 20,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 21,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 22,
    "pick": 8,
    "ban": 33,
    "winrate": 0.38
  },
  {
    "id": 23,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 24,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 25,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 26,
    "pick": 5,
    "ban": 8,
    "winrate": 0.4
  },
  {
    "id": 27,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 28,
    "pick": 1,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 29,
    "pick": 1,
    "ban": 2,
    "winrate": 0
  },
  {
    "id": 30,
    "pick": 19,
    "ban": 13,
    "winrate": 0.47
  },
  {
    "id": 31,
    "pick": 3,
    "ban": 0,
    "winrate": 0.67
  },
  {
    "id": 32,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 33,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 34,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 35,
    "pick": 15,
    "ban": 12,
    "winrate": 0.4
  },
  {
    "id": 36,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 37,
    "pick": 7,
    "ban": 11,
    "winrate": 0.43
  },
  {
    "id": 38,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 39,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 40,
    "pick": 15,
    "ban": 11,
    "winrate": 0.33
  },
  {
    "id": 41,
    "pick": 4,
    "ban": 3,
    "winrate": 0.25
  },
  {
    "id": 42,
    "pick": 5,
    "ban": 5,
    "winrate": 0.8
  },
  {
    "id": 43,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 44,
    "pick": 7,
    "ban": 15,
    "winrate": 0.43
  },
  {
    "id": 45,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 46,
    "pick": 3,
    "ban": 0,
    "winrate": 0.33
  },
  {
    "id": 47,
    "pick": 2,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 48,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 49,
    "pick": 10,
    "ban": 5,
    "winrate": 0.5
  },
  {
    "id": 50,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 51,
    "pick": 1,
    "ban": 1,
    "winrate": 1
  },
  {
    "id": 52,
    "pick": 20,
    "ban": 4,
    "winrate": 0.55
  },
  {
    "id": 53,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 54,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 55,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 56,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 57,
    "pick": 1,
    "ban": 0,
    "winrate": 1
  },
  {
    "id": 58,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 59,
    "pick": 14,
    "ban": 21,
    "winrate": 0.57
  },
  {
    "id": 60,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 61,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 62,
    "pick": 2,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 63,
    "pick": 2,
    "ban": 2,
    "winrate": 0.5
  },
  {
    "id": 64,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 65,
    "pick": 15,
    "ban": 4,
    "winrate": 0.33
  },
  {
    "id": 66,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 67,
    "pick": 22,
    "ban": 5,
    "winrate": 0.36
  },
  {
    "id": 68,
    "pick": 3,
    "ban": 2,
    "winrate": 0.33
  },
  {
    "id": 69,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 70,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 71,
    "pick": 17,
    "ban": 5,
    "winrate": 0.47
  },
  {
    "id": 72,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 73,
    "pick": 14,
    "ban": 7,
    "winrate": 0.43
  },
  {
    "id": 74,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 75,
    "pick": 1,
    "ban": 1,
    "winrate": 1
  },
  {
    "id": 76,
    "pick": 1,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 77,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 78,
    "pick": 1,
    "ban": 0,
    "winrate": 1
  },
  {
    "id": 79,
    "pick": 11,
    "ban": 3,
    "winrate": 0.64
  },
  {
    "id": 80,
    "pick": 11,
    "ban": 13,
    "winrate": 0.36
  },
  {
    "id": 81,
    "pick": 2,
    "ban": 1,
    "winrate": 0.5
  },
  {
    "id": 82,
    "pick": 2,
    "ban": 0,
    "winrate": 0.5
  },
  {
    "id": 83,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 84,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 85,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 86,
    "pick": 2,
    "ban": 1,
    "winrate": 0.5
  },
  {
    "id": 87,
    "pick": 6,
    "ban": 34,
    "winrate": 0.83
  },
  {
    "id": 88,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 89,
    "pick": 1,
    "ban": 0,
    "winrate": 1
  },
  {
    "id": 90,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 91,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 92,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 93,
    "pick": 1,
    "ban": 0,
    "winrate": 1
  },
  {
    "id": 94,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 95,
    "pick": 2,
    "ban": 1,
    "winrate": 0.5
  },
  {
    "id": 96,
    "pick": 2,
    "ban": 0,
    "winrate": 0.5
  },
  {
    "id": 97,
    "pick": 4,
    "ban": 5,
    "winrate": 0.75
  },
  {
    "id": 98,
    "pick": 15,
    "ban": 4,
    "winrate": 0.53
  },
  {
    "id": 99,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 100,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 101,
    "pick": 8,
    "ban": 12,
    "winrate": 0.63
  },
  {
    "id": 102,
    "pick": 3,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 103,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 104,
    "pick": 5,
    "ban": 4,
    "winrate": 0.4
  },
  {
    "id": 105,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 106,
    "pick": 11,
    "ban": 10,
    "winrate": 0.45
  },
  {
    "id": 107,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 108,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 109,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 110,
    "pick": 7,
    "ban": 32,
    "winrate": 0.43
  },
  {
    "id": 111,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 112,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 113,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 114,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 115,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 116,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 117,
    "pick": 3,
    "ban": 11,
    "winrate": 0.33
  },
  {
    "id": 118,
    "pick": 3,
    "ban": 1,
    "winrate": 0
  },
  {
    "id": 119,
    "pick": 1,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 120,
    "pick": 4,
    "ban": 4,
    "winrate": 0.25
  },
  {
    "id": 121,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 122,
    "pick": 0,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 123,
    "pick": 2,
    "ban": 5,
    "winrate": 0
  },
  {
    "id": 124,
    "pick": 1,
    "ban": 2,
    "winrate": 0
  },
  {
    "id": 125,
    "pick": 3,
    "ban": 40,
    "winrate": 0.33
  },
  {
    "id": 126,
    "pick": 20,
    "ban": 7,
    "winrate": 0.55
  },
  {
    "id": 127,
    "pick": 1,
    "ban": 0,
    "winrate": 0
  },
  {
    "id": 128,
    "pick": 12,
    "ban": 16,
    "winrate": 0.5
  },
  {
    "id": 129,
    "pick": 4,
    "ban": 1,
    "winrate": 0.75
  },
  {
    "id": 130,
    "pick": 16,
    "ban": 6,
    "winrate": 0.31
  },
  {
    "id": 131,
    "pick": 27,
    "ban": 17,
    "winrate": 0.52
  },
  {
    "id": 132,
    "pick": 8,
    "ban": 14,
    "winrate": 0.38
  }
]

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
  127: "LUKAS",
  128: "KALEA",
  129: "ZETIAN",
  130: "OBSIDIA",
  131: "SORA",
  132: "MARCEL"
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

app.get("/timeline", (req, res) => {
  res.sendFile(__dirname + "/public/timeline.html");
});

app.get("/turtle", (req, res) => {
  res.sendFile(__dirname + "/public/turtle.html");
});

app.get("/level", (req, res) => {
  res.sendFile(__dirname + "/public/level.html");
});

app.get("/showItem", (req, res) => {
  res.sendFile(__dirname + "/public/item.html");
});

app.get("/reverse", (req, res) => {
  res.sendFile(__dirname + "/public/reverse.html");
});

app.get("/milisecond", (req, res) => {
  res.sendFile(__dirname + "/public/msecond.html");
});

app.get("/timer", (req, res) => {
  res.sendFile(__dirname + "/public/timer.html");
});

app.get("/tfdamage", (req, res) => {
  res.sendFile(__dirname + "/public/tfdamage.html");
});

app.get("/playerList", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/path", (req, res) => {
  res.sendFile(__dirname + "/public/path.html");
});

app.get("/winrate", (req, res) => {
  res.sendFile(__dirname + "/public/winrate.html");
});

app.post("/winrateup", (req, res) => {
  const data = req.body;
  if (Array.isArray(data) && data.length > 0) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync('winrate.json', jsonData);
      rate = data;
      return res.status(200).send('Win rate data updated successfully');
    } catch (err) {
      console.error('Error saving winrate data:', err);
      return res.status(500).send('Error saving winrate data');
    }
  } else {
    return res.status(400).send('Invalid data. Must be a JSON array.');
  }
});

app.get("/getrate", (req, res) => {
  res.json(rate);
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
  //   "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
  //   id +
  //   "&dataid=1";
  const postData =
    "http://esportsdata-sg.mobilelegends.com/postdata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
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
    "http://esportsdata-sg.mobilelegends.com/postdata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
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
        responseData[`DDBar${i + 1}`] =
          "C://data/result/damageBar/DD/" +
          arrayC[i].campid +
          "/" +
          ((arrayC[i].total_damage / highestDamage) * 100).toFixed(0) +
          ".png";
        responseData[`DamageBarName${i + 1}`] = arrayC[i].name;
        responseData[`Damage${i + 1}`] =
          arrayC[i].total_damage.toLocaleString();
        //(arrayC[i].total_damage / 1000).toFixed(1) + "K";
      }
      // console.log(highestDamageArr)

      // Team1Bars
      const arrayD = team1.concat(team2);
      const highestDamageTakenArr = arrayD.sort(
        (a, b) => b.total_hurt - a.total_hurt
      );
      const highestDamageTaken = highestDamageTakenArr[0].total_hurt;
      arrayD.sort((a, b) => a.campid - b.campid);
      role_sorter(arrayD, playerList);
      arrayD.sort((a, b) => a.campid - b.campid);
      for (let i = 0; i < 10; i++) {
        responseData[`DTBar${i + 1}`] =
          "C://data/result/damageBar/DT/" +
          arrayD[i].campid +
          "/" +
          ((arrayD[i].total_hurt / highestDamageTaken) * 100).toFixed(0) +
          ".png";
        responseData[`DamageTakenBarName${i + 1}`] = arrayD[i].name;
        responseData[`DamageTaken${i + 1}`] =
          arrayD[i].total_hurt.toLocaleString();
      }

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
      //Team1Role
      for (let i = 0; i < 5; i++) {
        responseData[`Role${i + 1}`] = team1[i].c_role;
      }

      for (let i = 0; i < 5; i++) {
        responseData[`SecondRole${i + 1}`] = team1[i].c_role;
      }

       

      //Team2Role
      for (let i = 0; i < 5; i++) {
        responseData[`Role${i + 6}`] = team2[i].c_role;
      }

      for (let i = 0; i < 5; i++) {
        responseData[`SecondRole${i + 6}`] = team2[i].c_role;
      }

      //role pngs

      for (let i = 0; i < 5; i++) {
        responseData[`RolePng${i + 1}`] = `C://data/result/role/${team1[i].c_role}.png`;
      }

      for (let i = 0; i < 5; i++) {
        responseData[`RolePng${i + 6}`] = `C://data/result/role/${team2[i].c_role}.png`;
      }

      for (let i = 0; i < 5; i++) {
        responseData[`SecondRolePng${i + 1}`] = `C://data/result/role2/${team1[i].c_role}.png`;
      }

      for (let i = 0; i < 5; i++) {
        responseData[`SecondRolePng${i + 6}`] = `C://data/result/role2/${team2[i].c_role}.png`;
      }


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
          `playerKDA${i + 1}`
        ] = `${team1[i].kill_num} / ${team1[i].dead_num} / ${team1[i].assist_num}`;
      }
      //team2PlayerKDA
      for (let i = 0; i < 5; i++) {
        responseData[
          `playerKDA${i + 6}`
        ] = `${team2[i].kill_num} / ${team2[i].dead_num} / ${team2[i].assist_num}`;
      }
      //team1PlayerGold
      for (let i = 0; i < 5; i++) {
        responseData[`playerGold${i + 1}`] = team1[i].total_money;
      }
      //team2Playergold
      for (let i = 0; i < 5; i++) {
        responseData[`playerGold${i + 6}`] = team2[i].total_money;
      }

      //team1PlayergoldShort      
      for (let i = 0; i < 5; i++) {
        responseData[`GoldShort${i + 1}`] = team1[i].total_money >= 1000 ? (team1[i].total_money / 1000).toFixed(1) + 'K' : team1[i].total_money;
      }
      
      //team2PlayergoldShort      
      for (let i = 0; i < 5; i++) {
        responseData[`GoldShort${i + 6}`] = team2[i].total_money >= 1000 ? (team2[i].total_money / 1000).toFixed(1) + 'K' : team2[i].total_money;
      }

      //team1PlayerLvl
      for (let i = 0; i < 5; i++) {
        responseData[`Level${i + 1}`] = `${team1[i].level}`;
      }
      //team2PlayerLvl
      for (let i = 0; i < 5; i++) {
        responseData[`Level${i + 6}`] = `${team2[i].level}`;
      }
      //team1PlayerHero
      for (let i = 0; i < 5; i++) {
        responseData[
          `Hero${i + 1}`
        ] = `${formData.post1Hero}${team1[i].heroid}.png`;
      }
      //team2PlayerHero
      for (let i = 0; i < 5; i++) {
        responseData[
          `Hero${i + 6}`
        ] = `${formData.post1Hero}${team2[i].heroid}.png`;
      }

      //team1PlayerHero2
      for (let i = 0; i < 5; i++) {
        responseData[
          `Post2Hero${i + 1}`
        ] = `${formData.post2Hero}${team1[i].heroid}.png`;
      }
      //team2PlayerHero2
      for (let i = 0; i < 5; i++) {
        responseData[
          `Post2Hero${i + 6}`
        ] = `${formData.post2Hero}${team2[i].heroid}.png`;
      }
      //team1HeroName
      for (let i = 0; i < 5; i++) {
        responseData[`HeroName${i + 1}`] = heroNames[team1[i].heroid];
      }
      //team1HeroName
      for (let i = 0; i < 5; i++) {
        responseData[`HeroName${i + 6}`] = heroNames[team2[i].heroid];
      }
      //////////////////////////////////////////////////////////////////////////////////////////////////////

      // //team1Items
      // for (let i = 0; i < 5; i++) {
      //   for (let n = 0; n < 6; n++) {
      //     responseData[`team1Player${i + 1}Item${n + 1}`] = `${
      //       formData.post1ItemPath
      //     }${team1[i].equip_list[n] == null ? 0 : team1[i].equip_list[n]}.png`;
      //   }
      // }

      // //team2Items
      // for (let i = 0; i < 5; i++) {
      //   for (let n = 0; n < 6; n++) {
      //     responseData[`team2Player${i + 1}Item${n + 1}`] = `${
      //       formData.post1ItemPath
      //     }${team2[i].equip_list[n] == null ? 0 : team2[i].equip_list[n]}.png`;
      //   }
      // }

      // // console.log(team1)

      // Team 1 Items
      for (let i = 0; i < 5; i++) {
        for (let n = 0; n < 6; n++) {
          responseData[`p${i + 1}Item${n + 1}`] = `${
            formData.post1ItemPath
          }${
            team1[i].equip_list && team1[i].equip_list[n] !== undefined
              ? team1[i].equip_list[n]
              : 0
          }.png`;
        }
      }

      // Team 2 Items
      for (let i = 0; i < 5; i++) {
        for (let n = 0; n < 6; n++) {
          responseData[`p${i + 6}Item${n + 1}`] = `${
            formData.post1ItemPath
          }${
            team2[i].equip_list && team2[i].equip_list[n] !== undefined
              ? team2[i].equip_list[n]
              : 0
          }.png`;
        }
      }

      //team1Name
      for (let i = 0; i < 5; i++) {
        responseData[`playerName${i + 1}`] =
          name_finder(team1[i].roleid, playerList) || team1[i].name;
      }
      //team2Name
      for (let i = 0; i < 5; i++) {
        responseData[`playerName${i + 6}`] =
          name_finder(team2[i].roleid, playerList) || team2[i].name;
      }

      //team1PlayerPic
      const team1WinFlag = body.data.win_camp === 1 ? 1 : 0;
      const team2WinFlag = body.data.win_camp === 2 ? 1 : 0;
      for (let i = 0; i < 5; i++) {
        responseData[
          `playerPhoto${i + 1}`
        ] = `C://data/result/player/${team1WinFlag}/${team1[i].roleid}.png`;
      }
      //team2PlayerPic
      for (let i = 0; i < 5; i++) {
        responseData[
          `playerPhoto${i + 6}`
        ] = `C://data/result/player/${team2WinFlag}/${team2[i].roleid}.png`;
      }
      //team1Spell
      for (let i = 0; i < 5; i++) {
        responseData[
          `Spell${i + 1}`
        ] = `${formData.resultSpell}${team1[i].skillid}.png`;
      }
      //team2Spell
      for (let i = 0; i < 5; i++) {
        responseData[
          `Spell${i + 6}`
        ] = `${formData.resultSpell}${team2[i].skillid}.png`;
      }
      //team1Emblem
      for (let i = 0; i < 5; i++) {
        for (let n = 0; n < 3; n++) {
          responseData[`p${i + 1}Emblem${n + 1}`] = `${
            formData.resultEmblem
          }${team1[i].rune_map[n + 1] || 0}.png`;
        }
      }
      //team2Emblem
      for (let i = 0; i < 5; i++) {
        for (let n = 0; n < 3; n++) {
          responseData[`p${i + 6}Emblem${n + 1}`] = `${
            formData.resultEmblem
          }${team2[i].rune_map[n + 1] || 0}.png`;
        }
      }
      //team1MainEmblem
      for (let i = 0; i < 5; i++) {
        responseData[
          `MainEmblem${i + 1}`
        ] = `${formData.MainEmblem}${team1[i].runeid}.png`;
      }
      //team2MainEmblem
      for (let i = 0; i < 5; i++) {
        responseData[
          `MainEmblem${i + 6}`
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
    "http://esportsdata-sg.mobilelegends.com/postdata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
    id;
  request({ url: postData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }

    try {
      let responseData = {};
      let sortedArray = role_sorter(body.data.hero_list, playerList);
      let winner = body.data.win_camp;
      let mvpPlayer = sortedArray.find(
        (player) => player.campid === winner && player.mvp === true
      );
      //for kp
      let winnerPlayers = body.data.hero_list.filter(
        (player) => player.campid === winner
      );
      let totalKill = 0;
      winnerPlayers.map((player) => (totalKill += player.kill_num));

      // //role name
      // const laneRoles = ["exp", "jungle", "mid"];

      // if (laneRoles.includes(mvpPlayer.c_role)) {
      //   responseData.roleName = `${mvpPlayer.c_role} lane`.toUpperCase();
      // } else {
      //   responseData.roleName = mvpPlayer.c_role.toUpperCase();
      // }
      // responseData.rolePng = `C://data/mvp/role/${mvpPlayer.c_role}.png`;
      // responseData.crole = mvpPlayer.c_role

      //role name       
        const laneRoles = ["exp", "jungle", "mid"];

        // Error handling for undefined or null c_role
        if (!mvpPlayer.c_role) {
          responseData.roleName = "UNKNOWN";
          responseData.rolePng = "C://data/mvp/role/default.png";
          responseData.crole = "unknown";
        } else if (laneRoles.includes(mvpPlayer.c_role)) {         
          responseData.roleName = `${mvpPlayer.c_role} lane`.toUpperCase();
          responseData.rolePng = `C://data/mvp/role/${mvpPlayer.c_role}.png`;       
          responseData.crole = mvpPlayer.c_role;       
        } else if (mvpPlayer.c_role === "jg") {
          responseData.roleName = "JUNGLE";
          responseData.rolePng = `C://data/mvp/role/${mvpPlayer.c_role}.png`;
          responseData.crole = mvpPlayer.c_role;
        } else {         
          responseData.roleName = mvpPlayer.c_role.toUpperCase();
          responseData.rolePng = `C://data/mvp/role/${mvpPlayer.c_role}.png`;       
          responseData.crole = mvpPlayer.c_role;       
        }

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

      responseData.kp =
        `${(
          ((mvpPlayer.kill_num + mvpPlayer.assist_num) / totalKill) *
          100
        ).toFixed(0)}%` || "55%";
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
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
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

app.get("/explvl", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
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
            level: player.level,
            levelText: `LV.${player.level}`,
            hero: `C://data/exp/hero/${player.heroid}.png`,
          };
        });
      players.sort((a, b) => b.level - a.level);
      res.send(players);
    } catch (e) {
      return res.status(500).send(e);
    }
  });
});

app.get("/goldRanking2", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
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

app.get("/goldRanking", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
    id +
    "&dataid=1";
  
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).json({ error: "Request failed", details: error.message });
    }

    try {
      // Initialize response data with default values
      const responseData = {};
      
      // Check if body and required data exist
      if (!body || !body.data || !body.data.camp_list) {
        return res.status(500).json({ error: "Invalid response data structure" });
      }

      let a = body.data.camp_list;
      const selectedCamps = a.filter(
        (camp) => camp.campid === 1 || camp.campid === 2
      );
      
      if (!selectedCamps || selectedCamps.length === 0) {
        return res.status(500).json({ error: "No valid camps found" });
      }

      const players = selectedCamps
        .map((camp) => {
          // Ensure camp has player_list and it's an array
          if (!camp.player_list || !Array.isArray(camp.player_list)) {
            return [];
          }
          
          return camp.player_list.map((player) => {
            const goldValue = player.gold || 0;
            const goldFormatted = goldValue >= 1000 
              ? goldValue.toLocaleString('en-US')
              : goldValue.toString();
              
            return {
              team: player.campid || camp.campid,
              id: player.roleid || null,
              name: (player.roleid && typeof name_finder === 'function') 
                ? (name_finder(player.roleid, playerList) || player.name || 'Unknown')
                : (player.name || 'Unknown'),
              gold: goldFormatted,
              goldShort: `${(goldValue / 1000).toFixed(1)}k`,
              hero: `${formData?.goldRankingHeroPath || ''}${player.heroid || 'default'}.png`,
            };
          });
        })
        .flat()
        .filter(player => player !== null); // Remove any null entries

      // Sort players by gold (highest first) - need to parse gold back to number for sorting
      players.sort((a, b) => {
        const goldA = parseInt(a.gold.replace(/,/g, '')) || 0;
        const goldB = parseInt(b.gold.replace(/,/g, '')) || 0;
        return goldB - goldA;
      });
      
      let highestGold = players.length > 0 ? (parseInt(players[0].gold.replace(/,/g, '')) || 1) : 1; // Prevent division by zero

      // Add percent PNG to each player
      players.forEach((player, index) => {
        const goldValue = parseInt(player.gold.replace(/,/g, '')) || 0;
        const percent = Math.round((goldValue / highestGold) * 100);
        const percentValue = index === 0 ? "100" : (percent === 100 ? "99" : percent.toString());
        
        player.percentPng = `${formData?.goldPercentPngPath || ''}${player.team}/${percentValue}.png`;
      });

      // Create numbered response data (up to 10 players max)
      for (let i = 1; i <= 10; i++) {
        const player = players[i - 1]; // Array is 0-indexed
        
        if (player) {
          responseData[`name${i}`] = player.name;
          responseData[`gold${i}`] = player.gold;
          responseData[`goldshort${i}`] = player.goldShort;
          responseData[`heroPng${i}`] = player.hero;
          responseData[`percentPng${i}`] = player.percentPng;
          responseData[`player${i}TeamID`] = player.team;
          responseData[`player${i}ID`] = player.id;
        } else {
          // Set default values for missing players
          responseData[`name${i}`] = null;
          responseData[`gold${i}`] = null;
          responseData[`goldshort${i}`] = null;
          responseData[`heroPng${i}`] = null;
          responseData[`percentPng${i}`] = null;
          responseData[`player${i}TeamID`] = null;
          responseData[`player${i}ID`] = null;
        }
      }

      // Add total player count for reference
      responseData.totalPlayers = players.length;
      
      // res.json(responseData);
      let jsonData = { data: [responseData] };
      res.send(jsonData);
      
    } catch (e) {
      console.error('Gold ranking processing error:', e);
      return res.status(500).json({ 
        error: "Failed to process gold ranking data", 
        details: e.message 
      });
    }
  });
});

app.get("/hud", async (req, res) => {
  try {
    // Construct API URL
    const battleData = `http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=${id}&dataid=1`;
    
    // Make API request with error handling
    const { response, body } = await makeRequest(battleData);
    
    if (response.statusCode !== 200) {
      console.error(`API request failed with status: ${response.statusCode}`);
      return res.status(500).json({ 
        error: "Request to external API failed", 
        statusCode: response.statusCode 
      });
    }

    // Validate response body
    if (!body || !body.data) {
      console.error('Invalid API response: missing data');
      return res.status(500).json({ error: "Invalid API response" });
    }

    let responseData = {};
    const data = body.data;
    const campList = data.camp_list;
    const gameTime = data.game_time;

    // Validate camp list
    if (!campList || !Array.isArray(campList) || campList.length < 2) {
      console.error('Invalid camp list in API response');
      return res.status(500).json({ error: "Invalid team data" });
    }

    const team1 = campList[0];
    const team2 = campList[1];

    // Basic game state and team information
    try {
      responseData.state = data.state || 0;
      responseData.team1Name = formData?.team1_name || team1?.team_name || "Team 1";
      responseData.team2Name = formData?.team2_name || team2?.team_name || "Team 2";
      responseData.team1ShortName = formData?.team1_shortName || team1?.team_simple_name || "T1";
      responseData.team2ShortName = formData?.team2_shortName || team2?.team_simple_name || "T2";

      // Team logos with safe path construction
      const hudLogoPath = formData?.hudLogoPath || "";
      responseData.team1Logo = `${hudLogoPath}${responseData.team1ShortName}.png`;
      responseData.team2Logo = `${hudLogoPath}RIGHT/${responseData.team2ShortName}.png`;
    } catch (error) {
      console.error('Error setting basic team info:', error);
      // Set defaults
      responseData.state = 0;
      responseData.team1Name = "Team 1";
      responseData.team2Name = "Team 2";
      responseData.team1ShortName = "T1";
      responseData.team2ShortName = "T2";
      responseData.team1Logo = "";
      responseData.team2Logo = "";
    }

    // Game time formatting
    try {
      responseData.gameTime = formatTime(gameTime || 0);
      responseData.gameTime2 = formatTime(displayGameTime || 0);
    } catch (error) {
      console.error('Error formatting game time:', error);
      responseData.gameTime = "00:00";
      responseData.gameTime2 = "00:00";
    }

    // Team gold and gold difference
    try {
      const team1Gold = team1?.total_money || 0;
      const team2Gold = team2?.total_money || 0;

      responseData.team1Gold = team1Gold > 10000 
        ? `${(team1Gold / 1000).toFixed(1)}k` 
        : team1Gold.toString();
      responseData.team2Gold = team2Gold > 10000 
        ? `${(team2Gold / 1000).toFixed(1)}k` 
        : team2Gold.toString();

      // Gold difference calculation
      const goldDiff = Math.abs(team1Gold - team2Gold);
      const goldLogo = formData?.goldLogo || "";

      if (team1Gold > team2Gold) {
        responseData.goldDiff1 = `+${(goldDiff / 1000).toFixed(1)}k`;
        responseData.goldDiff2 = "";
        responseData.goldDiffPng1 = `${goldLogo}1.png`;
        responseData.goldDiffPng2 = `${goldLogo}0.png`;
      } else if (team2Gold > team1Gold) {
        responseData.goldDiff1 = "";
        responseData.goldDiff2 = `+${(goldDiff / 1000).toFixed(1)}k`;
        responseData.goldDiffPng1 = `${goldLogo}0.png`;
        responseData.goldDiffPng2 = `${goldLogo}2.png`;
      } else {
        responseData.goldDiff1 = "";
        responseData.goldDiff2 = "";
        responseData.goldDiffPng1 = `${goldLogo}0.png`;
        responseData.goldDiffPng2 = `${goldLogo}0.png`;
      }
    } catch (error) {
      console.error('Error calculating gold data:', error);
      responseData.team1Gold = "0";
      responseData.team2Gold = "0";
      responseData.goldDiff1 = "";
      responseData.goldDiff2 = "";
      responseData.goldDiffPng1 = "";
      responseData.goldDiffPng2 = "";
    }

    // Team statistics
    try {
      responseData.TurtleKill1 = team1?.kill_tortoise || 0;
      responseData.TurtleKill2 = team2?.kill_tortoise || 0;
      responseData.LordKill1 = team1?.kill_lord || 0;
      responseData.LordKill2 = team2?.kill_lord || 0;
      responseData.TotalKill1 = team1?.score || 0;
      responseData.TotalKill2 = team2?.score || 0;
      responseData.Tower1 = team1?.kill_tower || 0;
      responseData.Tower2 = team2?.kill_tower || 0;
    } catch (error) {
      console.error('Error setting team statistics:', error);
      responseData.TurtleKill1 = 0;
      responseData.TurtleKill2 = 0;
      responseData.LordKill1 = 0;
      responseData.LordKill2 = 0;
      responseData.TotalKill1 = 0;
      responseData.TotalKill2 = 0;
      responseData.Tower1 = 0;
      responseData.Tower2 = 0;
    }

    // Enhanced event processing with comprehensive error handling
    const eventList = data.incre_event_list || [];

    // Helper function to safely filter events
    function safeEventFilter(eventList, filterFunction, eventType = "unknown") {
      try {
        if (!Array.isArray(eventList)) {
          console.warn(`No valid event list found for ${eventType}`);
          return [];
        }
        
        return eventList.filter((e) => {
          try {
            return filterFunction(e);
          } catch (filterError) {
            console.error(`Error filtering ${eventType} event:`, filterError, e);
            return false;
          }
        });
      } catch (error) {
        console.error(`Error in safeEventFilter for ${eventType}:`, error);
        return [];
      }
    }

    // Helper function to safely get team name
    function getSafeTeamName(campid) {
      try {
        if (campid === 1) {
          return formData?.team1_name || team1?.team_name || "Team 1";
        } else if (campid === 2) {
          return formData?.team2_name || team2?.team_name || "Team 2";
        }
        return "Unknown Team";
      } catch (error) {
        console.error('Error getting team name:', error);
        return "Unknown Team";
      }
    }

    // Helper function to safely get player name
    function getSafePlayerName(killerId, fallbackName = "") {
      try {
        if (!killerId) return fallbackName || "Unknown Player";
        
        const playerName = name_finder(killerId, playerList);
        return playerName || fallbackName || "Unknown Player";
      } catch (error) {
        console.error('Error getting player name:', error);
        return fallbackName || "Unknown Player";
      }
    }

    // Helper function to safely get player role
    function getSafePlayerRole(killerId) {
      try {
        if (!killerId) return "Unknown Role";
        
        const playerRole = role_finder(killerId, playerList);
        return playerRole !== "undefined" ? playerRole : "Unknown Role";
      } catch (error) {
        console.error('Error getting player role:', error);
        return "Unknown Role";
      }
    }

    // Helper function to safely get team logo
    function getSafeTeamLogo(campid) {
      try {
        const logoPath = formData?.bossKillerLogoPath || "";
        if (campid === 1) {
          const shortName = formData?.team1_shortName || "team1";
          return `${logoPath}${shortName}.png`;
        } else if (campid === 2) {
          const shortName = formData?.team2_shortName || "team2";
          return `${logoPath}${shortName}.png`;
        }
        return "";
      } catch (error) {
        console.error('Error getting team logo:', error);
        return "";
      }
    }

    // Filter events
    const turtleKill = safeEventFilter(
      eventList,
      (e) => e?.event_type === "kill_boss" && e?.boss_name === "tortoise",
      "turtle kill"
    );
    responseData.turtleKillCount = turtleKill.length;

    const lordKill = safeEventFilter(
      eventList,
      (e) => e?.event_type === "kill_boss" && e?.boss_name === "lord",
      "lord kill"
    );
    responseData.lordKillCount = lordKill.length;

    const lordSteal = safeEventFilter(
      eventList,
      (e) => {
        if (e?.event_type !== "kill_boss" || e?.boss_name !== "lord") return false;
        if (Array.isArray(e.extra_param)) {
          return e.extra_param.includes("steal");
        }
        return e.extra_param === "steal";
      },
      "lord steal"
    );

    const turtleSteal = safeEventFilter(
      eventList,
      (e) => {
        if (e?.event_type !== "kill_boss" || e?.boss_name !== "tortoise") return false;
        if (Array.isArray(e.extra_param)) {
          return e.extra_param.includes("steal");
        }
        return e.extra_param === "steal";
      },
      "turtle steal"
    );

    const firstBlood = safeEventFilter(
      eventList,
      (e) => {
        if (e?.event_type !== "kill_hero") return false;
        if (Array.isArray(e.extra_param)) {
          return e.extra_param.includes("first_blood");
        }
        return e.extra_param === "first_blood";
      },
      "first blood"
    );

    const tripleKill = safeEventFilter(
      eventList,
      (e) => {
        if (e?.event_type !== "kill_hero") return false;
        if (Array.isArray(e.extra_param)) {
          return e.extra_param.includes("triple_kill");
        }
        return e.extra_param === "triple_kill";
      },
      "triple kill"
    );

    const miniac = safeEventFilter(
      eventList,
      (e) => {
        if (e?.event_type !== "kill_hero") return false;
        if (Array.isArray(e.extra_param)) {
          return e.extra_param.includes("quadra_kill");
        }
        return e.extra_param === "quadra_kill";
      },
      "quadra kill"
    );

    const savage = safeEventFilter(
      eventList,
      (e) => {
        if (e?.event_type !== "kill_hero") return false;
        if (Array.isArray(e.extra_param)) {
          return e.extra_param.includes("penta_kill");
        }
        return e.extra_param === "penta_kill";
      },
      "penta kill"
    );

    // Process Savage Kill
    try {
      if (savage.length > 0) {
        const lastsavage = savage[savage.length - 1];
        responseData.savagePlayerTeamName = getSafeTeamName(lastsavage.campid);
        responseData.savagePlayerName = getSafePlayerName(lastsavage.killer_id);
        responseData.savagePlayerRole = getSafePlayerRole(lastsavage.killer_id);
        responseData.savagePlayerPic = `C://data/firstblood/${lastsavage.killer_id || 0}.png`;
        responseData.savagePlayerPicTeamLogo = getSafeTeamLogo(lastsavage.campid);
        responseData.savagePlayerRolepng = `C://data/lordkill/role/${getSafePlayerRole(lastsavage.killer_id)}.png`;
      } else {
        responseData.savagePlayerName = "";
        responseData.savagePlayerRole = "";
        responseData.savagePlayerPic = "C://data/firstblood/0.png";
        responseData.savagePlayerTeamName = "";
        responseData.savagePlayerPicTeamLogo = "";
        responseData.savagePlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
      }
    } catch (error) {
      console.error('Error processing savage data:', error);
      responseData.savagePlayerName = "";
      responseData.savagePlayerRole = "";
      responseData.savagePlayerPic = "C://data/firstblood/0.png";
      responseData.savagePlayerTeamName = "";
      responseData.savagePlayerPicTeamLogo = "";
      responseData.savagePlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
    }

    // Process Maniac Kill
    try {
      if (miniac.length > 0) {
        const lastMiniac = miniac[miniac.length - 1];
        responseData.miniacPlayerTeamName = getSafeTeamName(lastMiniac.campid);
        responseData.miniacPlayerName = getSafePlayerName(lastMiniac.killer_id);
        responseData.miniacPlayerRole = getSafePlayerRole(lastMiniac.killer_id);
        responseData.miniacPlayerPic = `C://data/firstblood/${lastMiniac.killer_id || 0}.png`;
        responseData.miniacPlayerPicTeamLogo = getSafeTeamLogo(lastMiniac.campid);
        responseData.miniacPlayerRolepng = `C://data/lordkill/role/${getSafePlayerRole(lastMiniac.killer_id)}.png`;
      } else {
        responseData.miniacPlayerName = "";
        responseData.miniacPlayerRole = "";
        responseData.miniacPlayerPic = "C://data/firstblood/0.png";
        responseData.miniacPlayerTeamName = "";
        responseData.miniacPlayerPicTeamLogo = "";
        responseData.miniacPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
      }
    } catch (error) {
      console.error('Error processing maniac data:', error);
      responseData.miniacPlayerName = "";
      responseData.miniacPlayerRole = "";
      responseData.miniacPlayerPic = "C://data/firstblood/0.png";
      responseData.miniacPlayerTeamName = "";
      responseData.miniacPlayerPicTeamLogo = "";
      responseData.miniacPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
    }

    // Process Triple Kill
    try {
      if (tripleKill.length > 0) {
        const lasttripleKill = tripleKill[tripleKill.length - 1];
        responseData.tripleKillPlayerTeamName = getSafeTeamName(lasttripleKill.campid);
        responseData.tripleKillPlayerName = getSafePlayerName(lasttripleKill.killer_id);
        responseData.tripleKillPlayerRole = getSafePlayerRole(lasttripleKill.killer_id);
        responseData.tripleKillPlayerPic = `C://data/firstblood/${lasttripleKill.killer_id || 0}.png`;
        responseData.tripleKillPlayerPicTeamLogo = getSafeTeamLogo(lasttripleKill.campid);
        responseData.tripleKillPlayerRolepng = `C://data/lordkill/role/${getSafePlayerRole(lasttripleKill.killer_id)}.png`;
      } else {
        responseData.tripleKillPlayerName = "";
        responseData.tripleKillPlayerRole = "";
        responseData.tripleKillPlayerPic = "C://data/firstblood/0.png";
        responseData.tripleKillPlayerTeamName = "";
        responseData.tripleKillPlayerPicTeamLogo = "";
        responseData.tripleKillPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
      }
    } catch (error) {
      console.error('Error processing triple kill data:', error);
      responseData.tripleKillPlayerName = "";
      responseData.tripleKillPlayerRole = "";
      responseData.tripleKillPlayerPic = "C://data/firstblood/0.png";
      responseData.tripleKillPlayerTeamName = "";
      responseData.tripleKillPlayerPicTeamLogo = "";
      responseData.tripleKillPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
    }

    // Process First Blood
    try {
      if (firstBlood.length > 0) {
        const lastfirstBlood = firstBlood[firstBlood.length - 1];
        responseData.firstBloodPlayerTeamName = getSafeTeamName(lastfirstBlood.campid);
        responseData.firstBloodPlayerName = getSafePlayerName(
          lastfirstBlood.killer_id,
          lastfirstBlood.killer_name
        );
        responseData.firstBloodPlayerRole = getSafePlayerRole(lastfirstBlood.killer_id);
        responseData.firstBloodPlayerPic = `C://data/firstblood/${lastfirstBlood.killer_id || 0}.png`;
        responseData.firstBloodPlayerPicTeamLogo = getSafeTeamLogo(lastfirstBlood.campid);
        responseData.firstBloodPlayerRolepng = `C://data/lordkill/role/${getSafePlayerRole(lastfirstBlood.killer_id)}.png`;
      } else {
        responseData.firstBloodPlayerName = "";
        responseData.firstBloodPlayerRole = "";
        responseData.firstBloodPlayerPic = `${formData?.bossKillerPath || "C://data/firstblood/"}0.png`;
        responseData.firstBloodPlayerTeamName = "";
        responseData.firstBloodPlayerPicTeamLogo = "";
        responseData.firstBloodPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
      }
    } catch (error) {
      console.error('Error processing first blood data:', error);
      responseData.firstBloodPlayerName = "";
      responseData.firstBloodPlayerRole = "";
      responseData.firstBloodPlayerPic = `${formData?.bossKillerPath || "C://data/firstblood/"}0.png`;
      responseData.firstBloodPlayerTeamName = "";
      responseData.firstBloodPlayerPicTeamLogo = "";
      responseData.firstBloodPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
    }

    // Process Turtle Kill
    try {
      if (turtleKill.length > 0) {
        const lastTurtleKillEvent = turtleKill[turtleKill.length - 1];
        responseData.turtleKillTeamName = getSafeTeamName(lastTurtleKillEvent.campid);
        responseData.turtleKillPlayerName = getSafePlayerName(lastTurtleKillEvent.killer_id);
        responseData.turtleKillPlayerRole = getSafePlayerRole(lastTurtleKillEvent.killer_id);
        responseData.turtleKillPlayer = `${formData?.bossKillerPath || ""}${lastTurtleKillEvent.killer_id || 0}.png`;
        responseData.turtleKillPlayerTeamLogo = getSafeTeamLogo(lastTurtleKillEvent.campid);
        responseData.turtleKillPlayerRolepng = `C://data/lordkill/role/${getSafePlayerRole(lastTurtleKillEvent.killer_id)}.png`;
      } else {
        responseData.turtleKillTeamName = "";
        responseData.turtleKillPlayer = `${formData?.bossKillerPath || ""}0.png`;
        responseData.turtleKillPlayerName = "";
        responseData.turtleKillPlayerRole = "";
        responseData.turtleKillPlayerTeamLogo = "";
        responseData.turtleKillPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
      }

      // Count turtle kills per team safely
      let team1TurtleKills = 0;
      let team2TurtleKills = 0;
      
      turtleKill.forEach(e => {
        try {
          if (e.campid === 1 || e.killer_camp === 1) {
            team1TurtleKills++;
          } else if (e.campid === 2 || e.killer_camp === 2) {
            team2TurtleKills++;
          }
        } catch (countError) {
          console.error('Error counting turtle kills:', countError, e);
        }
      });

      responseData.totalTurtleKilled = team1TurtleKills + team2TurtleKills;
    } catch (error) {
      console.error('Error processing turtle kill data:', error);
      responseData.turtleKillTeamName = "";
      responseData.turtleKillPlayer = `${formData?.bossKillerPath || ""}0.png`;
      responseData.turtleKillPlayerName = "";
      responseData.turtleKillPlayerRole = "";
      responseData.turtleKillPlayerTeamLogo = "";
      responseData.turtleKillPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
      responseData.totalTurtleKilled = 0;
    }

    // Process Lord Kill
    try {
      if (lordKill.length > 0) {
        const lastLordKillEvent = lordKill[lordKill.length - 1];
        responseData.lordKillTeamName = getSafeTeamName(lastLordKillEvent.campid);
        responseData.lordKillPlayerName = getSafePlayerName(lastLordKillEvent.killer_id);
        responseData.lordKillPlayerRole = getSafePlayerRole(lastLordKillEvent.killer_id);
        responseData.lordKillPlayer = `${formData?.bossKillerPath || ""}${lastLordKillEvent.killer_id || 0}.png`;
        responseData.lordKillPlayerTeamLogo = getSafeTeamLogo(lastLordKillEvent.campid);
        responseData.lordKillPlayerRolepng = `C://data/lordkill/role/${getSafePlayerRole(lastLordKillEvent.killer_id)}.png`;
      } else {
        responseData.lordKillTeamName = "";
        responseData.lordKillPlayer = `${formData?.bossKillerPath || ""}0.png`;
        responseData.lordKillPlayerName = "";
        responseData.lordKillPlayerRole = "";
        responseData.lordKillPlayerTeamLogo = "";
        responseData.lordKillPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
      }
    } catch (error) {
      console.error('Error processing lord kill data:', error);
      responseData.lordKillTeamName = "";
      responseData.lordKillPlayer = `${formData?.bossKillerPath || ""}0.png`;
      responseData.lordKillPlayerName = "";
      responseData.lordKillPlayerRole = "";
      responseData.lordKillPlayerTeamLogo = "";
      responseData.lordKillPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
    }

    // Process Lord Steal
    try {
      if (lordSteal.length > 0) {
        const lastLordStealEvent = lordSteal[lordSteal.length - 1];
        responseData.lordStealTeamName = getSafeTeamName(lastLordStealEvent.campid);
        responseData.lordStealPlayerName = getSafePlayerName(lastLordStealEvent.killer_id);
        responseData.lordStealPlayerRole = getSafePlayerRole(lastLordStealEvent.killer_id);
        responseData.lordStealPlayer = `${formData?.bossKillerPath || ""}${lastLordStealEvent.killer_id || 0}.png`;
        responseData.lordStealPlayerTeamLogo = getSafeTeamLogo(lastLordStealEvent.campid);
        responseData.lordStealPlayerRolepng = `C://data/lordkill/role/${getSafePlayerRole(lastLordStealEvent.killer_id)}.png`;
        responseData.lordStealTime = lastLordStealEvent.game_time || 0;
        responseData.lordStealCount = lordSteal.length;
      } else {
        responseData.lordStealTeamName = "";
        responseData.lordStealPlayer = `${formData?.bossKillerPath || ""}0.png`;
        responseData.lordStealPlayerName = "";
        responseData.lordStealPlayerRole = "";
        responseData.lordStealPlayerTeamLogo = "";
        responseData.lordStealPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
        responseData.lordStealTime = 0;
        responseData.lordStealCount = 0;
      }
    } catch (error) {
      console.error('Error processing lord steal data:', error);
      responseData.lordStealTeamName = "";
      responseData.lordStealPlayer = `${formData?.bossKillerPath || ""}0.png`;
      responseData.lordStealPlayerName = "";
      responseData.lordStealPlayerRole = "";
      responseData.lordStealPlayerTeamLogo = "";
      responseData.lordStealPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
      responseData.lordStealTime = 0;
      responseData.lordStealCount = 0;
    }

    // Process Turtle Steal
    try {
      if (turtleSteal.length > 0) {
        const lastTurtleStealEvent = turtleSteal[turtleSteal.length - 1];
        responseData.turtleStealTeamName = getSafeTeamName(lastTurtleStealEvent.campid);
        responseData.turtleStealPlayerName = getSafePlayerName(lastTurtleStealEvent.killer_id);
        responseData.turtleStealPlayerRole = getSafePlayerRole(lastTurtleStealEvent.killer_id);
        responseData.turtleStealPlayer = `${formData?.bossKillerPath || ""}${lastTurtleStealEvent.killer_id || 0}.png`;
        responseData.turtleStealPlayerTeamLogo = getSafeTeamLogo(lastTurtleStealEvent.campid);
        responseData.turtleStealPlayerRolepng = `C://data/lordkill/role/${getSafePlayerRole(lastTurtleStealEvent.killer_id)}.png`;
        responseData.turtleStealTime = lastTurtleStealEvent.game_time || 0;
        responseData.turtleStealCount = turtleSteal.length;
      } else {
        responseData.turtleStealTeamName = "";
        responseData.turtleStealPlayer = `${formData?.bossKillerPath || ""}0.png`;
        responseData.turtleStealPlayerName = "";
        responseData.turtleStealPlayerRole = "";
        responseData.turtleStealPlayerTeamLogo = "";
        responseData.turtleStealPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
        responseData.turtleStealTime = 0;
        responseData.turtleStealCount = 0;
      }
    } catch (error) {
      console.error('Error processing turtle steal data:', error);
      responseData.turtleStealTeamName = "";
      responseData.turtleStealPlayer = `${formData?.bossKillerPath || ""}0.png`;
      responseData.turtleStealPlayerName = "";
      responseData.turtleStealPlayerRole = "";
      responseData.turtleStealPlayerTeamLogo = "";
      responseData.turtleStealPlayerRolepng = "C://data/lordkill/role/Unknown Role.png";
      responseData.turtleStealTime = 0;
      responseData.turtleStealCount = 0;
    }

    // Return response
    const jsonData = { data: [responseData] };
    res.json(jsonData);

  } catch (criticalError) {
    console.error('Critical error in /hud route:', criticalError);
    res.status(500).json({ 
      error: "Internal server error", 
      message: criticalError.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Note: This route uses your existing role_finder function defined elsewhere in your application

app.get("/emblem", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send("Error Fetching Data");
    }
    try {
      let responseData = {};
      let a = body.data.camp_list;

      let team1 = role_sorter(a[0].player_list, playerList);
      let team2 = role_sorter(a[1].player_list, playerList);

      //team1players Emblems - ADD NULL CHECKS
      for (let x = 0; x < 5; x++) {
        for (let i = 0; i < 3; i++) {
          responseData[`p${x + 1}Emblem${i + 1}`] =
            team1[x].rune_map && team1[x].rune_map[i + 1] 
              ? `${formData.emblemPath}${team1[x].rune_map[i + 1]}.png` 
              : `${formData.emblemPath}0.png`;
        }
      }

      //team2players Emblem - ADD NULL CHECKS
      for (let x = 0; x < 5; x++) {
        for (let i = 0; i < 3; i++) {
          responseData[`p${x + 6}Emblem${i + 1}`] =
            team2[x].rune_map && team2[x].rune_map[i + 1]
              ? `${formData.emblemPath}${team2[x].rune_map[i + 1]}.png`
              : `${formData.emblemPath}0.png`;
        }
      }

      //Team1spells - ADD NULL CHECKS
      for (let i = 0; i < 5; i++) {
        responseData[`spell${i + 1}`] =
          team1[i].skillid 
            ? `${formData.spellPath}${team1[i].skillid}.png`
            : `${formData.spellPath}0.png`;
      }

      //Team2spells - ADD NULL CHECKS
      for (let i = 0; i < 5; i++) {
        responseData[`spell${i + 6}`] =
          team2[i].skillid
            ? `${formData.spellPath}${team2[i].skillid}.png`
            : `${formData.spellPath}0.png`;
      }

      //Team1 custom runes - ADD NULL CHECKS
      for (let i = 0; i < 5; i++) {
        responseData[`custom${i + 1}`] =
          team1[i].rune_id 
            ? `${formData.emblemPath}${team1[i].rune_id}.png`
            : `${formData.emblemPath}0.png`;
      }

      //Team2 custom runes - ADD NULL CHECKS
      for (let i = 0; i < 5; i++) {
        responseData[`custom${i + 6}`] =
          team2[i].rune_id
            ? `${formData.emblemPath}${team2[i].rune_id}.png`
            : `${formData.emblemPath}0.png`;
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
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
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
    responseData.state_left_time = data.data.state_left_time;
    responseData.state = data.data.state.toUpperCase();
    //team Name
    responseData.team1playerlogo = `C://data/draft/playerlogo/${
      formData.team1_shortName || a[0].team_simple_name
    }.png`;
    responseData.team2playerlogo = `C://data/draft/playerlogo/${
      formData.team2_shortName || a[1].team_simple_name
    }.png`;

    responseData.audienceLogo1 = `C://data/audience/logo/${
      formData.team1_shortName || a[0].team_simple_name
    }.png`;
    responseData.audienceLogo2 = `C://data/audience/logo/${
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
      `C://data/draft/player/${a[0]?.player_list[0]?.picking ? a[0].player_list[0].roleid : 0}.png` || "";
    responseData.player2Pic =
      `C://data/draft/player/${a[0]?.player_list[1]?.picking ? a[0].player_list[1].roleid : 0}.png` || "";
    responseData.player3Pic =
      `C://data/draft/player/${a[0]?.player_list[2]?.picking ? a[0].player_list[2].roleid : 0}.png` || "";
    responseData.player4Pic =
      `C://data/draft/player/${a[0]?.player_list[3]?.picking ? a[0].player_list[3].roleid : 0}.png` || "";
    responseData.player5Pic =
      `C://data/draft/player/${a[0]?.player_list[4]?.picking ? a[0].player_list[4].roleid : 0}.png` || "";

    responseData.player6Pic =
      `C://data/draft/player/${a[1]?.player_list[0]?.picking ? a[1].player_list[0].roleid : 0}.png` || "";
    responseData.player7Pic =
      `C://data/draft/player/${a[1]?.player_list[1]?.picking ? a[1].player_list[1].roleid : 0}.png` || "";
    responseData.player8Pic =
      `C://data/draft/player/${a[1]?.player_list[2]?.picking ? a[1].player_list[2].roleid : 0}.png` || "";
    responseData.player9Pic =
      `C://data/draft/player/${a[1]?.player_list[3]?.picking ? a[1].player_list[3].roleid : 0}.png` || "";
    responseData.player10Pic =
      `C://data/draft/player/${a[1]?.player_list[4]?.picking ? a[1].player_list[4].roleid : 0}.png` || "";

    //0if not picking
    //pics - original 10 players
    responseData.x2player1Pic = 
      `C://data/draft/player2/${a[0]?.player_list[0]?.picking ? a[0].player_list[0].roleid : 0}.png` || "";
    responseData.x2player2Pic = 
      `C://data/draft/player2/${a[0]?.player_list[1]?.picking ? a[0].player_list[1].roleid : 0}.png` || "";
    responseData.x2player3Pic = 
      `C://data/draft/player2/${a[0]?.player_list[2]?.picking ? a[0].player_list[2].roleid : 0}.png` || "";
    responseData.x2player4Pic = 
      `C://data/draft/player2/${a[0]?.player_list[3]?.picking ? a[0].player_list[3].roleid : 0}.png` || "";
    responseData.x2player5Pic = 
      `C://data/draft/player2/${a[0]?.player_list[4]?.picking ? a[0].player_list[4].roleid : 0}.png` || "";

    responseData.x2player6Pic = 
      `C://data/draft/player2/${a[1]?.player_list[0]?.picking ? a[1].player_list[0].roleid : 0}.png` || "";
    responseData.x2player7Pic = 
      `C://data/draft/player2/${a[1]?.player_list[1]?.picking ? a[1].player_list[1].roleid : 0}.png` || "";
    responseData.x2player8Pic = 
      `C://data/draft/player2/${a[1]?.player_list[2]?.picking ? a[1].player_list[2].roleid : 0}.png` || "";
    responseData.x2player9Pic = 
      `C://data/draft/player2/${a[1]?.player_list[3]?.picking ? a[1].player_list[3].roleid : 0}.png` || "";
    responseData.x2player10Pic = 
      `C://data/draft/player2/${a[1]?.player_list[4]?.picking ? a[1].player_list[4].roleid : 0}.png` || "";

    //playerX2Location
    responseData.x2playerPng1 =
      `C://data/draft/playerx2/${a[0].player_list[0].roleid}.png` || "";
    responseData.x2playerPng2 =
      `C://data/draft/playerx2/${a[0].player_list[1].roleid}.png` || "";
    responseData.x2playerPng3 =
      `C://data/draft/playerx2/${a[0].player_list[2].roleid}.png` || "";
    responseData.x2playerPng4 =
      `C://data/draft/playerx2/${a[0].player_list[3].roleid}.png` || "";
    responseData.x2playerPng5 =
      `C://data/draft/playerx2/${a[0].player_list[4].roleid}.png` || "";

    responseData.x2playerPng6 =
      `C://data/draft/playerx2/${a[1].player_list[0].roleid}.png` || "";
    responseData.x2playerPng7 =
      `C://data/draft/playerx2/${a[1].player_list[1].roleid}.png` || "";
    responseData.x2playerPng8 =
      `C://data/draft/playerx2/${a[1].player_list[2].roleid}.png` || "";
    responseData.x2playerPng9 =
      `C://data/draft/playerx2/${a[1].player_list[3].roleid}.png` || "";
    responseData.x2playerPng10 =
      `C://data/draft/playerx2/${a[1].player_list[4].roleid}.png` || "";
    
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

    //level overlay
    responseData.level1 = a[0].player_list[0].level || "0";
    responseData.level2 = a[0].player_list[1].level || "0";
    responseData.level3 = a[0].player_list[2].level || "0";
    responseData.level4 = a[0].player_list[3].level || "0";
    responseData.level5 = a[0].player_list[4].level || "0";

    responseData.level6 = a[1].player_list[0].level || "0";
    responseData.level7 = a[1].player_list[1].level || "0";
    responseData.level8 = a[1].player_list[2].level || "0";
    responseData.level9 = a[1].player_list[3].level || "0";
    responseData.level10 = a[1].player_list[4].level || "0";

    //role
    responseData.role1 = role_finder(a[0].player_list[0].roleid, playerList) || "norole";
    responseData.role2 = role_finder(a[0].player_list[1].roleid, playerList) || "norole";
    responseData.role3 = role_finder(a[0].player_list[2].roleid, playerList) || "norole";
    responseData.role4 = role_finder(a[0].player_list[3].roleid, playerList) || "norole";
    responseData.role5 = role_finder(a[0].player_list[4].roleid, playerList) || "norole";

    responseData.role6 = role_finder(a[1].player_list[0].roleid, playerList) || "norole";
    responseData.role7 = role_finder(a[1].player_list[1].roleid, playerList) || "norole";
    responseData.role8 = role_finder(a[1].player_list[2].roleid, playerList) || "norole";
    responseData.role9 = role_finder(a[1].player_list[3].roleid, playerList) || "norole";
    responseData.role10 = role_finder(a[1].player_list[4].roleid, playerList) || "norole";

    //rolePng
    responseData.rolePng1 =`C://data/draft/role/${role_finder(a[0].player_list[0].roleid, playerList)}.png` || "norole";
    responseData.rolePng2 =`C://data/draft/role/${role_finder(a[0].player_list[1].roleid, playerList)}.png` || "norole";
    responseData.rolePng3 =`C://data/draft/role/${role_finder(a[0].player_list[2].roleid, playerList)}.png` || "norole";
    responseData.rolePng4 =`C://data/draft/role/${role_finder(a[0].player_list[3].roleid, playerList)}.png` || "norole";
    responseData.rolePng5 =`C://data/draft/role/${role_finder(a[0].player_list[4].roleid, playerList)}.png` || "norole";

    responseData.rolePng6 =`C://data/draft/role/${role_finder(a[1].player_list[0].roleid, playerList)}.png` || "norole";
    responseData.rolePng7 =`C://data/draft/role/${role_finder(a[1].player_list[1].roleid, playerList)}.png` || "norole";
    responseData.rolePng8 =`C://data/draft/role/${role_finder(a[1].player_list[2].roleid, playerList)}.png` || "norole";
    responseData.rolePng9 =`C://data/draft/role/${role_finder(a[1].player_list[3].roleid, playerList)}.png` || "norole";
    responseData.rolePng10 =`C://data/draft/role/${role_finder(a[1].player_list[4].roleid, playerList)}.png` || "norole";

    //pickversion2
    for (let i = 0; i < 5; i++) {
      responseData[`spell${i + 1}`] =
        "C://data/draft/spell/" + team1[i].skillid + ".png";
      responseData[`pickHero${i + 1}`] =
        "C://data/draft/pick/" + team1[i].heroid + ".png";
      responseData[`location2pickHero${i + 1}`] =
        "C://data/draft/picklocation2/" + team1[i].heroid + ".png";
      responseData[`location3pickHero${i + 1}`] =
        "C://data/draft/picklocation3/" + team1[i].heroid + ".png";
      responseData[`location4pickHero${i + 1}`] =
        "C://data/draft/picklocation4/" + team1[i].heroid + ".png";
    }

    for (let i = 0; i < 5; i++) {
      responseData[`spell${i + 6}`] =
        "C://data/draft/spell/" + team2[i].skillid + ".png";
      responseData[`pickHero${i + 6}`] =
        "C://data/draft/pick/" + team2[i].heroid + ".png";
      responseData[`location2pickHero${i + 6}`] =
        "C://data/draft/picklocation2/" + team2[i].heroid + ".png";
      responseData[`location3pickHero${i + 6}`] =
        "C://data/draft/picklocation3/" + team2[i].heroid + ".png";
      responseData[`location4pickHero${i + 6}`] =
        "C://data/draft/picklocation4/" + team2[i].heroid + ".png";
    }

    //arrow
    responseData.arrow1 = `C://data/draft/arrow/0/1.png`;
    responseData.arrow2 = `C://data/draft/arrow/0/1.png`;

    //team1Arrow
    if (
      a[0].player_list[0].picking == true ||
      a[0].player_list[0].banning == true
    ) {
      responseData.arrow1 = `C://data/draft/arrow/1/1.png`;
    } else if (
      a[0].player_list[1].picking == true ||
      a[0].player_list[1].banning == true
    ) {
      responseData.arrow1 = `C://data/draft/arrow/1/1.png`;
    } else if (
      a[0].player_list[2].picking == true ||
      a[0].player_list[2].banning == true
    ) {
      responseData.arrow1 = `C://data/draft/arrow/1/1.png`;
    } else if (
      a[0].player_list[3].picking == true ||
      a[0].player_list[3].banning == true
    ) {
      responseData.arrow1 = `C://data/draft/arrow/1/1.png`;
    } else if (
      a[0].player_list[4].picking == true ||
      a[0].player_list[4].banning == true
    ) {
      responseData.arrow1 = `C://data/draft/arrow/1/1.png`;
    } else {
      responseData.arrow1 = `C://data/draft/arrow/0/1.png`;
    }

    //team1Arrow
    if (
      a[1].player_list[0].picking == true ||
      a[1].player_list[0].banning == true
    ) {
      responseData.arrow2 = `C://data/draft/arrow/2/1.png`;
    } else if (
      a[1].player_list[1].picking == true ||
      a[1].player_list[1].banning == true
    ) {
      responseData.arrow2 = `C://data/draft/arrow/2/1.png`;
    } else if (
      a[1].player_list[2].picking == true ||
      a[1].player_list[2].banning == true
    ) {
      responseData.arrow2 = `C://data/draft/arrow/2/1.png`;
    } else if (
      a[1].player_list[3].picking == true ||
      a[1].player_list[3].banning == true
    ) {
      responseData.arrow2 = `C://data/draft/arrow/2/1.png`;
    } else if (
      a[1].player_list[4].picking == true ||
      a[1].player_list[4].banning == true
    ) {
      responseData.arrow2 = `C://data/draft/arrow/2/1.png`;
    } else {
      responseData.arrow2 = `C://data/draft/arrow/0/1.png`;
    }

    //Banned1
    responseData.banning1 = 0;
    responseData.banned1 = 0;
    if (a[0].player_list[0].banning == true) {
      responseData.banning1 = 1;
    } else if (
      a[0].player_list[0].banning == false &&
      a[0].player_list[0].ban_heroid !== 0
    ) {
      responseData.banning1 = 1;
      responseData.banned1 = 1;
    }

    //Banned2
    responseData.banning2 = 0;
    responseData.banned2 = 0;
    if (a[0].player_list[1].banning == true) {
      responseData.banning2 = 1;
    } else if (
      a[0].player_list[1].banning == false &&
      a[0].player_list[1].ban_heroid !== 0
    ) {
      responseData.banning2 = 1;
      responseData.banned2 = 1;
    }

    //Banned3
    responseData.banning3 = 0;
    responseData.banned3 = 0;
    if (a[0].player_list[2].banning == true) {
      responseData.banning3 = 1;
    } else if (
      a[0].player_list[2].banning == false &&
      a[0].player_list[2].ban_heroid !== 0
    ) {
      responseData.banning3 = 1;
      responseData.banned3 = 1;
    }

    //Banned4
    responseData.banning4 = 0;
    responseData.banned4 = 0;
    if (a[0].player_list[3].banning == true) {
      responseData.banning4 = 1;
    } else if (
      a[0].player_list[3].banning == false &&
      a[0].player_list[3].ban_heroid !== 0
    ) {
      responseData.banning4 = 1;
      responseData.banned4 = 1;
    }

    //Banned5
    responseData.banning5 = 0;
    responseData.banned5 = 0;
    if (a[0].player_list[4].banning == true) {
      responseData.banning5 = 1;
    } else if (
      a[0].player_list[4].banning == false &&
      a[0].player_list[4].ban_heroid !== 0
    ) {
      responseData.banning5 = 1;
      responseData.banned5 = 1;
    }

    //Banned6
    responseData.banning6 = 0;
    responseData.banned6 = 0;
    if (a[1].player_list[0].banning == true) {
      responseData.banning6 = 1;
    } else if (
      a[1].player_list[0].banning == false &&
      a[1].player_list[0].ban_heroid !== 0
    ) {
      responseData.banning6 = 1;
      responseData.banned6 = 1;
    }

    //Banned7
    responseData.banning7 = 0;
    responseData.banned7 = 0;
    if (a[1].player_list[1].banning == true) {
      responseData.banning7 = 1;
    } else if (
      a[1].player_list[1].banning == false &&
      a[1].player_list[1].ban_heroid !== 0
    ) {
      responseData.banning7 = 1;
      responseData.banned7 = 1;
    }

    //Banned8
    responseData.banning8 = 0;
    responseData.banned8 = 0;
    if (a[1].player_list[2].banning == true) {
      responseData.banning8 = 1;
    } else if (
      a[1].player_list[2].banning == false &&
      a[1].player_list[2].ban_heroid !== 0
    ) {
      responseData.banning8 = 1;
      responseData.banned8 = 1;
    }

    //Banned9
    responseData.banning9 = 0;
    responseData.banned9 = 0;
    if (a[1].player_list[3].banning == true) {
      responseData.banning9 = 1;
    } else if (
      a[1].player_list[3].banning == false &&
      a[1].player_list[3].ban_heroid !== 0
    ) {
      responseData.banning9 = 1;
      responseData.banned9 = 1;
    }

    //Banned10
    responseData.banning10 = 0;
    responseData.banned10 = 0;
    if (a[1].player_list[4].banning == true) {
      responseData.banning10 = 1;
    } else if (
      a[1].player_list[4].banning == false &&
      a[1].player_list[4].ban_heroid !== 0
    ) {
      responseData.banning10 = 1;
      responseData.banned10 = 1;
    }

    //pick light
    if (a[0].player_list[0].picking == true) {
      responseData.picklight1 = "C://data/draft/picklight/1/1.png"
    } else {
      responseData.picklight1 = "C://data/draft/picklight/0/1.png"
    }
    if (a[0].player_list[1].picking == true) {
      responseData.picklight2 = "C://data/draft/picklight/1/1.png"
    } else {
      responseData.picklight2 = "C://data/draft/picklight/0/1.png"
    }
    if (a[0].player_list[2].picking == true) {
      responseData.picklight3 = "C://data/draft/picklight/1/1.png"
    } else {
      responseData.picklight3 = "C://data/draft/picklight/0/1.png"
    }
    if (a[0].player_list[3].picking == true) {
      responseData.picklight4 = "C://data/draft/picklight/1/1.png"
    } else {
      responseData.picklight4 = "C://data/draft/picklight/0/1.png"
    }
    if (a[0].player_list[4].picking == true) {
      responseData.picklight5 = "C://data/draft/picklight/1/1.png"
    } else {
      responseData.picklight5 = "C://data/draft/picklight/0/1.png"
    }

    if (a[1].player_list[0].picking == true) {
      responseData.picklight6 = "C://data/draft/picklight/1/1.png"
    } else {
      responseData.picklight6 = "C://data/draft/picklight/0/1.png"
    }
    if (a[1].player_list[1].picking == true) {
      responseData.picklight7 = "C://data/draft/picklight/1/1.png"
    } else {
      responseData.picklight7 = "C://data/draft/picklight/0/1.png"
    }
    if (a[1].player_list[2].picking == true) {
      responseData.picklight8 = "C://data/draft/picklight/1/1.png"
    } else {
      responseData.picklight8 = "C://data/draft/picklight/0/1.png"
    }
    if (a[1].player_list[3].picking == true) {
      responseData.picklight9 = "C://data/draft/picklight/1/1.png"
    } else {
      responseData.picklight9 = "C://data/draft/picklight/0/1.png"
    }
    if (a[1].player_list[4].picking == true) {
      responseData.picklight10 = "C://data/draft/picklight/1/1.png"
    } else {
      responseData.picklight10 = "C://data/draft/picklight/0/1.png"
    }

    // location2 picklight
    if (a[0].player_list[0].picking == true) {
      responseData.location2picklight1 = "C://data/draft/picklightlocation2/1/1.png"
    } else {
      responseData.location2picklight1 = "C://data/draft/picklightlocation2/0/1.png"
    }
    if (a[0].player_list[1].picking == true) {
      responseData.location2picklight2 = "C://data/draft/picklightlocation2/1/1.png"
    } else {
      responseData.location2picklight2 = "C://data/draft/picklightlocation2/0/1.png"
    }
    if (a[0].player_list[2].picking == true) {
      responseData.location2picklight3 = "C://data/draft/picklightlocation2/1/1.png"
    } else {
      responseData.location2picklight3 = "C://data/draft/picklightlocation2/0/1.png"
    }
    if (a[0].player_list[3].picking == true) {
      responseData.location2picklight4 = "C://data/draft/picklightlocation2/1/1.png"
    } else {
      responseData.location2picklight4 = "C://data/draft/picklightlocation2/0/1.png"
    }
    if (a[0].player_list[4].picking == true) {
      responseData.location2picklight5 = "C://data/draft/picklightlocation2/1/1.png"
    } else {
      responseData.location2picklight5 = "C://data/draft/picklightlocation2/0/1.png"
    }

    if (a[1].player_list[0].picking == true) {
      responseData.location2picklight6 = "C://data/draft/picklightlocation2/1/1.png"
    } else {
      responseData.location2picklight6 = "C://data/draft/picklightlocation2/0/1.png"
    }
    if (a[1].player_list[1].picking == true) {
      responseData.location2picklight7 = "C://data/draft/picklightlocation2/1/1.png"
    } else {
      responseData.location2picklight7 = "C://data/draft/picklightlocation2/0/1.png"
    }
    if (a[1].player_list[2].picking == true) {
      responseData.location2picklight8 = "C://data/draft/picklightlocation2/1/1.png"
    } else {
      responseData.location2picklight8 = "C://data/draft/picklightlocation2/0/1.png"
    }
    if (a[1].player_list[3].picking == true) {
      responseData.location2picklight9 = "C://data/draft/picklightlocation2/1/1.png"
    } else {
      responseData.location2picklight9 = "C://data/draft/picklightlocation2/0/1.png"
    }
    if (a[1].player_list[4].picking == true) {
      responseData.location2picklight10 = "C://data/draft/picklightlocation2/1/1.png"
    } else {
      responseData.location2picklight10 = "C://data/draft/picklightlocation2/0/1.png"
    }
    
    //ban light
    if (a[0].player_list[0].banning == true) {
      responseData.banlight1 = "C://data/draft/banlight/1/1.png"
    } else {
      responseData.banlight1 = "C://data/draft/banlight/0/1.png"
    }
    if (a[0].player_list[1].banning == true) {
      responseData.banlight2 = "C://data/draft/banlight/1/1.png"
    } else {
      responseData.banlight2 = "C://data/draft/banlight/0/1.png"
    }
    if (a[0].player_list[2].banning == true) {
      responseData.banlight3 = "C://data/draft/banlight/1/1.png"
    } else {
      responseData.banlight3 = "C://data/draft/banlight/0/1.png"
    }
    if (a[0].player_list[3].banning == true) {
      responseData.banlight4 = "C://data/draft/banlight/1/1.png"
    } else {
      responseData.banlight4 = "C://data/draft/banlight/0/1.png"
    }
    if (a[0].player_list[4].banning == true) {
      responseData.banlight5 = "C://data/draft/banlight/1/1.png"
    } else {
      responseData.banlight5 = "C://data/draft/banlight/0/1.png"
    }

    if (a[1].player_list[0].banning == true) {
      responseData.banlight6 = "C://data/draft/banlight/1/1.png"
    } else {
      responseData.banlight6 = "C://data/draft/banlight/0/1.png"
    }
    if (a[1].player_list[1].banning == true) {
      responseData.banlight7 = "C://data/draft/banlight/1/1.png"
    } else {
      responseData.banlight7 = "C://data/draft/banlight/0/1.png"
    }
    if (a[1].player_list[2].banning == true) {
      responseData.banlight8 = "C://data/draft/banlight/1/1.png"
    } else {
      responseData.banlight8 = "C://data/draft/banlight/0/1.png"
    }
    if (a[1].player_list[3].banning == true) {
      responseData.banlight9 = "C://data/draft/banlight/1/1.png"
    } else {
      responseData.banlight9 = "C://data/draft/banlight/0/1.png"
    }
    if (a[1].player_list[4].banning == true) {
      responseData.banlight10 = "C://data/draft/banlight/1/1.png"
    } else {
      responseData.banlight10 = "C://data/draft/banlight/0/1.png"
    }

    //ban light location2
    if (a[0].player_list[0].banning == true) {
      responseData.location2Banlight1 = "C://data/draft/banlight2/1/1.png"
    } else {
      responseData.location2Banlight1 = "C://data/draft/banlight2/0/1.png"
    }
    if (a[0].player_list[1].banning == true) {
      responseData.location2Banlight2 = "C://data/draft/banlight2/1/1.png"
    } else {
      responseData.location2Banlight2 = "C://data/draft/banlight2/0/1.png"
    }
    if (a[0].player_list[2].banning == true) {
      responseData.location2Banlight3 = "C://data/draft/banlight2/1/1.png"
    } else {
      responseData.location2Banlight3 = "C://data/draft/banlight2/0/1.png"
    }
    if (a[0].player_list[3].banning == true) {
      responseData.location2Banlight4 = "C://data/draft/banlight2/1/1.png"
    } else {
      responseData.location2Banlight4 = "C://data/draft/banlight2/0/1.png"
    }
    if (a[0].player_list[4].banning == true) {
      responseData.location2Banlight5 = "C://data/draft/banlight2/1/1.png"
    } else {
      responseData.location2Banlight5 = "C://data/draft/banlight2/0/1.png"
    }

    if (a[1].player_list[0].banning == true) {
      responseData.location2Banlight6 = "C://data/draft/banlight2/1/1.png"
    } else {
      responseData.location2Banlight6 = "C://data/draft/banlight2/0/1.png"
    }
    if (a[1].player_list[1].banning == true) {
      responseData.location2Banlight7 = "C://data/draft/banlight2/1/1.png"
    } else {
      responseData.location2Banlight7 = "C://data/draft/banlight2/0/1.png"
    }
    if (a[1].player_list[2].banning == true) {
      responseData.location2Banlight8 = "C://data/draft/banlight2/1/1.png"
    } else {
      responseData.location2Banlight8 = "C://data/draft/banlight2/0/1.png"
    }
    if (a[1].player_list[3].banning == true) {
      responseData.location2Banlight9 = "C://data/draft/banlight2/1/1.png"
    } else {
      responseData.location2Banlight9 = "C://data/draft/banlight2/0/1.png"
    }
    if (a[1].player_list[4].banning == true) {
      responseData.location2Banlight10 = "C://data/draft/banlight2/1/1.png"
    } else {
      responseData.location2Banlight10 = "C://data/draft/banlight2/0/1.png"
    }

    //picked1
    responseData.picking1 = 0;
    responseData.picked1 = 0;
    if (a[0].player_list[0].picking == true) {
      responseData.picking1 = 1;
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
    if (a[0].player_list[1].picking == true) {
      responseData.picking2 = 1;
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
    if (a[0].player_list[2].picking == true) {
      responseData.picking3 = 1;
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
    if (a[0].player_list[3].picking == true) {
      responseData.picking4 = 1;
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
    if (a[0].player_list[4].picking == true) {
      responseData.picking5 = 1;
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
    if (a[1].player_list[0].picking == true) {
      responseData.picking6 = 1;
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
    if (a[1].player_list[1].picking == true) {
      responseData.picking7 = 1;
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
    if (a[1].player_list[2].picking == true) {
      responseData.picking8 = 1;
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
    if (a[1].player_list[3].picking == true) {
      responseData.picking9 = 1;
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
    if (a[1].player_list[4].picking == true) {
      responseData.picking10 = 1;
    } else if (
      a[1].player_list[4].picking == false &&
      a[1].player_list[4].heroid !== 0
    ) {
      responseData.picking10 = 1;
      responseData.picked10 = 1;
    }

    //banlocation2
    responseData.banX2Location1 = `C://data/draft/ban2/${a[0].player_list[0].ban_heroid}.png` || "";
    responseData.banX2Location2 = `C://data/draft/ban2/${a[0].player_list[1].ban_heroid}.png` || "";
    responseData.banX2Location3 = `C://data/draft/ban2/${a[0].player_list[2].ban_heroid}.png` || "";
    responseData.banX2Location4 = `C://data/draft/ban2/${a[0].player_list[3].ban_heroid}.png` || "";
    responseData.banX2Location5 = `C://data/draft/ban2/${a[0].player_list[4].ban_heroid}.png` || "";

    responseData.banX2Location6 = `C://data/draft/ban2/${a[1].player_list[0].ban_heroid}.png` || "";
    responseData.banX2Location7 = `C://data/draft/ban2/${a[1].player_list[1].ban_heroid}.png` || "";
    responseData.banX2Location8 = `C://data/draft/ban2/${a[1].player_list[2].ban_heroid}.png` || "";
    responseData.banX2Location9 = `C://data/draft/ban2/${a[1].player_list[3].ban_heroid}.png` || "";
    responseData.banX2Location10 = `C://data/draft/ban2/${a[1].player_list[4].ban_heroid}.png` || "";

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
      responseData[`ID${i + 1}`] = a[0].player_list[i].heroid;
    }

    for (let i = 0; i < 5; i++) {
      responseData[`ID${i + 6}`] = a[1].player_list[i].heroid;
    }

    //Hero Image Sequence
    responseData.sequence1 = `C://data/draft/hero/motion/${a[0].player_list[0].heroid}/${a[0].player_list[0].heroid}001.png` || 'heroid_error';
    responseData.sequence2 = `C://data/draft/hero/motion/${a[0].player_list[1].heroid}/${a[0].player_list[1].heroid}001.png` || 'heroid_error';
    responseData.sequence3 = `C://data/draft/hero/motion/${a[0].player_list[2].heroid}/${a[0].player_list[2].heroid}001.png` || 'heroid_error';
    responseData.sequence4 = `C://data/draft/hero/motion/${a[0].player_list[3].heroid}/${a[0].player_list[3].heroid}001.png` || 'heroid_error';
    responseData.sequence5 = `C://data/draft/hero/motion/${a[0].player_list[4].heroid}/${a[0].player_list[4].heroid}001.png` || 'heroid_error';

    responseData.sequence6 = `C://data/draft/hero/motion/${a[1].player_list[0].heroid}/${a[1].player_list[0].heroid}001.png` || 'heroid_error';
    responseData.sequence7 = `C://data/draft/hero/motion/${a[1].player_list[1].heroid}/${a[1].player_list[1].heroid}001.png` || 'heroid_error';
    responseData.sequence8 = `C://data/draft/hero/motion/${a[1].player_list[2].heroid}/${a[1].player_list[2].heroid}001.png` || 'heroid_error';
    responseData.sequence9 = `C://data/draft/hero/motion/${a[1].player_list[3].heroid}/${a[1].player_list[3].heroid}001.png` || 'heroid_error';
    responseData.sequence10 = `C://data/draft/hero/motion/${a[1].player_list[4].heroid}/${a[1].player_list[4].heroid}001.png` || 'heroid_error';

    //---------------------------------------------------------------------------------------
    //picking with player animation
    //player1picking
    if (a[0].player_list[0].picking == true) {
      responseData.pick1 =
        `${formData.draft_player_pic}${a[0].player_list[0].roleid}${formData.draft_player_action}` ||
        "";
    }
    //afterPicking
    else if (a[0].player_list[0].heroid != 0) {
      responseData.pick1 =
        `${formData.hero}${a[0].player_list[0].heroid}${formData.heroImageSequence}` ||
        "";
    }
    //before picking
    else {
      responseData.pick1 =
        `${formData.draft_player_pic}${a[0].player_list[0].roleid}${formData.draft_player_default}` ||
        "";
    }

    //---------------------------------------------------------------------------------------
    //player2picking
    if (a[0].player_list[1].picking == true) {
      responseData.pick2 =
        `${formData.draft_player_pic}${a[0].player_list[1].roleid}${formData.draft_player_action}` ||
        "";
    }
    //afterPicking
    else if (a[0].player_list[1].heroid != 0) {
      responseData.pick2 =
        `${formData.hero}${a[0].player_list[1].heroid}${formData.heroImageSequence}` ||
        "";
    }
    //before picking
    else {
      responseData.pick2 =
        `${formData.draft_player_pic}${a[0].player_list[1].roleid}${formData.draft_player_default}` ||
        "";
    }

    //---------------------------------------------------------------------------------------
    //player3picking
    if (a[0].player_list[2].picking == true) {
      responseData.pick3 =
        `${formData.draft_player_pic}${a[0].player_list[2].roleid}${formData.draft_player_action}` ||
        "";
    }
    //afterPicking
    else if (a[0].player_list[2].heroid != 0) {
      responseData.pick3 =
        `${formData.hero}${a[0].player_list[2].heroid}${formData.heroImageSequence}` ||
        "";
    }
    //before picking
    else {
      responseData.pick3 =
        `${formData.draft_player_pic}${a[0].player_list[2].roleid}${formData.draft_player_default}` ||
        "";
    }

    //---------------------------------------------------------------------------------------
    //player4picking
    if (a[0].player_list[3].picking == true) {
      responseData.pick4 =
        `${formData.draft_player_pic}${a[0].player_list[3].roleid}${formData.draft_player_action}` ||
        "";
    }
    //afterPicking
    else if (a[0].player_list[3].heroid != 0) {
      responseData.pick4 =
        `${formData.hero}${a[0].player_list[3].heroid}${formData.heroImageSequence}` ||
        "";
    }
    //before picking
    else {
      responseData.pick4 =
        `${formData.draft_player_pic}${a[0].player_list[3].roleid}${formData.draft_player_default}` ||
        "";
    }

    //---------------------------------------------------------------------------------------
    //player5picking
    if (a[0].player_list[4].picking == true) {
      responseData.pick5 =
        `${formData.draft_player_pic}${a[0].player_list[4].roleid}${formData.draft_player_action}` ||
        "";
    }
    //afterPicking
    else if (a[0].player_list[4].heroid != 0) {
      responseData.pick5 =
        `${formData.hero}${a[0].player_list[4].heroid}${formData.heroImageSequence}` ||
        "";
    }
    //before picking
    else {
      responseData.pick5 =
        `${formData.draft_player_pic}${a[0].player_list[4].roleid}${formData.draft_player_default}` ||
        "";
    }

    //---------------------------------------------------------------------------------------
    //player6picking
    if (a[1].player_list[0].picking == true) {
      responseData.pick6 =
        `${formData.draft_player_pic}${a[1].player_list[0].roleid}${formData.draft_player_action}` ||
        "";
    }
    //afterPicking
    else if (a[1].player_list[0].heroid != 0) {
      responseData.pick6 =
        `${formData.hero}${a[1].player_list[0].heroid}${formData.heroImageSequence}` ||
        "";
    }
    //before picking
    else {
      responseData.pick6 =
        `${formData.draft_player_pic}${a[1].player_list[0].roleid}${formData.draft_player_default}` ||
        "";
    }

    //---------------------------------------------------------------------------------------
    //player7picking
    if (a[1].player_list[1].picking == true) {
      responseData.pick7 =
        `${formData.draft_player_pic}${a[1].player_list[1].roleid}${formData.draft_player_action}` ||
        "";
    }
    //afterPicking
    else if (a[1].player_list[1].heroid != 0) {
      responseData.pick7 =
        `${formData.hero}${a[1].player_list[1].heroid}${formData.heroImageSequence}` ||
        "";
    }
    //before picking
    else {
      responseData.pick7 =
        `${formData.draft_player_pic}${a[1].player_list[1].roleid}${formData.draft_player_default}` ||
        "";
    }

    //---------------------------------------------------------------------------------------
    //player8picking
    if (a[1].player_list[2].picking == true) {
      responseData.pick8 =
        `${formData.draft_player_pic}${a[1].player_list[2].roleid}${formData.draft_player_action}` ||
        "";
    }
    //afterPicking
    else if (a[1].player_list[2].heroid != 0) {
      responseData.pick8 =
        `${formData.hero}${a[1].player_list[2].heroid}${formData.heroImageSequence}` ||
        "";
    }
    //before picking
    else {
      responseData.pick8 =
        `${formData.draft_player_pic}${a[1].player_list[2].roleid}${formData.draft_player_default}` ||
        "";
    }

    //---------------------------------------------------------------------------------------
    //player9picking
    if (a[1].player_list[3].picking == true) {
      responseData.pick9 =
        `${formData.draft_player_pic}${a[1].player_list[3].roleid}${formData.draft_player_action}` ||
        "";
    }
    //afterPicking
    else if (a[1].player_list[3].heroid != 0) {
      responseData.pick9 =
        `${formData.hero}${a[1].player_list[3].heroid}${formData.heroImageSequence}` ||
        "";
    }
    //before picking
    else {
      responseData.pick9 =
        `${formData.draft_player_pic}${a[1].player_list[3].roleid}${formData.draft_player_default}` ||
        "";
    }

    //---------------------------------------------------------------------------------------
    //player10picking
    if (a[1].player_list[4].picking == true) {
      responseData.pick10 =
        `${formData.draft_player_pic}${a[1].player_list[4].roleid}${formData.draft_player_action}` ||
        "";
    }
    //afterPicking
    else if (a[1].player_list[4].heroid != 0) {
      responseData.pick10 =
        `${formData.hero}${a[1].player_list[4].heroid}${formData.heroImageSequence}` ||
        "";
    }
    //before picking
    else {
      responseData.pick10 =
        `${formData.draft_player_pic}${a[1].player_list[4].roleid}${formData.draft_player_default}` ||
        "";
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

app.get("/teamfightdamage", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
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

    // Game state info
    responseData.state_left_time = data.data.state_left_time;
    responseData.game_time = data.data.game_time;
    responseData.win_camp = data.data.win_camp;

    // Team 1 (Players p1-p5) - Damage and Hero Data
    responseData.p1damage = team1[0].total_damage || 0;
    responseData.p2damage = team1[1].total_damage || 0;
    responseData.p3damage = team1[2].total_damage || 0;
    responseData.p4damage = team1[3].total_damage || 0;
    responseData.p5damage = team1[4].total_damage || 0;

    responseData.p1hero = team1[0].heroid || 0;
    responseData.p2hero = team1[1].heroid || 0;
    responseData.p3hero = team1[2].heroid || 0;
    responseData.p4hero = team1[3].heroid || 0;
    responseData.p5hero = team1[4].heroid || 0;

    // Team 2 (Players p6-p10) - Damage and Hero Data
    responseData.p6damage = team2[0].total_damage || 0;
    responseData.p7damage = team2[1].total_damage || 0;
    responseData.p8damage = team2[2].total_damage || 0;
    responseData.p9damage = team2[3].total_damage || 0;
    responseData.p10damage = team2[4].total_damage || 0;

    responseData.p6hero = team2[0].heroid || 0;
    responseData.p7hero = team2[1].heroid || 0;
    responseData.p8hero = team2[2].heroid || 0;
    responseData.p9hero = team2[3].heroid || 0;
    responseData.p10hero = team2[4].heroid || 0;

    let jsonData = { data: [responseData] };
    res.send(jsonData);
  });
});

app.get("/item", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send("Error Fetching Data");
    }
    try {
      let responseData = {};
      let data = body;
      let a = data.data.camp_list;
      let team1 = role_sorter(a[0].player_list, playerList);
      let team2 = role_sorter(a[1].player_list, playerList);
      
      //
      //playerNames
      responseData.SLplayerName1 =
        name_finder(team1[0].roleid, playerList) || team1[0].name;
      responseData.SLplayerName2 =
        name_finder(team1[1].roleid, playerList) || team1[1].name;
      responseData.SLplayerName3 =
        name_finder(team1[2].roleid, playerList) || team1[2].name;
      responseData.SLplayerName4 =
        name_finder(team1[3].roleid, playerList) || team1[3].name;
      responseData.SLplayerName5 =
        name_finder(team1[4].roleid, playerList) || team1[4].name;

      responseData.SLplayerName6 =
        name_finder(team2[0].roleid, playerList) || team2[0].name;
      responseData.SLplayerName7 =
        name_finder(team2[1].roleid, playerList) || team2[1].name;
      responseData.SLplayerName8 =
        name_finder(team2[2].roleid, playerList) || team2[2].name;
      responseData.SLplayerName9 =
        name_finder(team2[3].roleid, playerList) || team2[3].name;
      responseData.SLplayerName10 =
        name_finder(team2[4].roleid, playerList) || team2[4].name;

      //SLhero
      responseData.SLhero1 = team1[0].heroid ? `C://data/sideled/hero/${team1[0].heroid}.png` : "";
      responseData.SLhero2 = team1[1].heroid ? `C://data/sideled/hero/${team1[1].heroid}.png` : "";
      responseData.SLhero3 = team1[2].heroid ? `C://data/sideled/hero/${team1[2].heroid}.png` : "";
      responseData.SLhero4 = team1[3].heroid ? `C://data/sideled/hero/${team1[3].heroid}.png` : "";
      responseData.SLhero5 = team1[4].heroid ? `C://data/sideled/hero/${team1[4].heroid}.png` : "";

      responseData.SLhero6 = team2[0].heroid ? `C://data/sideled/hero/${team2[0].heroid}.png` : "";
      responseData.SLhero7 = team2[1].heroid ? `C://data/sideled/hero/${team2[1].heroid}.png` : "";
      responseData.SLhero8 = team2[2].heroid ? `C://data/sideled/hero/${team2[2].heroid}.png` : "";
      responseData.SLhero9 = team2[3].heroid ? `C://data/sideled/hero/${team2[3].heroid}.png` : "";
      responseData.SLhero10 = team2[4].heroid ? `C://data/sideled/hero/${team2[4].heroid}.png` : "";

      //SLhero
      responseData.SLbanhero1 = team1[0].ban_heroid ? `C://data/sideled/banhero/${team1[0].ban_heroid}.png` : "";
      responseData.SLbanhero2 = team1[1].ban_heroid ? `C://data/sideled/banhero/${team1[1].ban_heroid}.png` : "";
      responseData.SLbanhero3 = team1[2].ban_heroid ? `C://data/sideled/banhero/${team1[2].ban_heroid}.png` : "";
      responseData.SLbanhero4 = team1[3].ban_heroid ? `C://data/sideled/banhero/${team1[3].ban_heroid}.png` : "";
      responseData.SLbanhero5 = team1[4].ban_heroid ? `C://data/sideled/banhero/${team1[4].ban_heroid}.png` : "";

      responseData.SLbanhero6 = team2[0].ban_heroid ? `C://data/sideled/banhero/${team2[0].ban_heroid}.png` : "";
      responseData.SLbanhero7 = team2[1].ban_heroid ? `C://data/sideled/banhero/${team2[1].ban_heroid}.png` : "";
      responseData.SLbanhero8 = team2[2].ban_heroid ? `C://data/sideled/banhero/${team2[2].ban_heroid}.png` : "";
      responseData.SLbanhero9 = team2[3].ban_heroid ? `C://data/sideled/banhero/${team2[3].ban_heroid}.png` : "";
      responseData.SLbanhero10 = team2[4].ban_heroid ? `C://data/sideled/banhero/${team2[4].ban_heroid}.png` : "";

      //SLRoleSmall
      responseData.SLRoleSmall1 = `C://data/sideled/rolesmall/${role_finder(team1[0].roleid, playerList) || ""}.png`;
      responseData.SLRoleSmall2 = `C://data/sideled/rolesmall/${role_finder(team1[1].roleid, playerList) || ""}.png`;
      responseData.SLRoleSmall3 = `C://data/sideled/rolesmall/${role_finder(team1[2].roleid, playerList) || ""}.png`;
      responseData.SLRoleSmall4 = `C://data/sideled/rolesmall/${role_finder(team1[3].roleid, playerList) || ""}.png`;
      responseData.SLRoleSmall5 = `C://data/sideled/rolesmall/${role_finder(team1[4].roleid, playerList) || ""}.png`;

      responseData.SLRoleSmall6 = `C://data/sideled/rolesmall/${role_finder(team2[0].roleid, playerList) || ""}.png`;
      responseData.SLRoleSmall7 = `C://data/sideled/rolesmall/${role_finder(team2[1].roleid, playerList) || ""}.png`;
      responseData.SLRoleSmall8 = `C://data/sideled/rolesmall/${role_finder(team2[2].roleid, playerList) || ""}.png`;
      responseData.SLRoleSmall9 = `C://data/sideled/rolesmall/${role_finder(team2[3].roleid, playerList) || ""}.png`;
      responseData.SLRoleSmall10 = `C://data/sideled/rolesmall/${role_finder(team2[4].roleid, playerList) || ""}.png`;

      //SLRoleBig
      responseData.SLRoleBig1 = `C://data/sideled/rolebig/${role_finder(team1[0].roleid, playerList) || ""}.png`;
      responseData.SLRoleBig2 = `C://data/sideled/rolebig/${role_finder(team1[1].roleid, playerList) || ""}.png`;
      responseData.SLRoleBig3 = `C://data/sideled/rolebig/${role_finder(team1[2].roleid, playerList) || ""}.png`;
      responseData.SLRoleBig4 = `C://data/sideled/rolebig/${role_finder(team1[3].roleid, playerList) || ""}.png`;
      responseData.SLRoleBig5 = `C://data/sideled/rolebig/${role_finder(team1[4].roleid, playerList) || ""}.png`;

      responseData.SLRoleBig6 = `C://data/sideled/rolebig/${role_finder(team2[0].roleid, playerList) || ""}.png`;
      responseData.SLRoleBig7 = `C://data/sideled/rolebig/${role_finder(team2[1].roleid, playerList) || ""}.png`;
      responseData.SLRoleBig8 = `C://data/sideled/rolebig/${role_finder(team2[2].roleid, playerList) || ""}.png`;
      responseData.SLRoleBig9 = `C://data/sideled/rolebig/${role_finder(team2[3].roleid, playerList) || ""}.png`;
      responseData.SLRoleBig10 = `C://data/sideled/rolebig/${role_finder(team2[4].roleid, playerList) || ""}.png`;

      //SLplayer
      responseData.SLplayer1 = `C://data/sideled/player/${team1[0].roleid}.PNG`;
      responseData.SLplayer2 = `C://data/sideled/player/${team1[1].roleid}.PNG`;
      responseData.SLplayer3 = `C://data/sideled/player/${team1[2].roleid}.PNG`;
      responseData.SLplayer4 = `C://data/sideled/player/${team1[3].roleid}.PNG`;
      responseData.SLplayer5 = `C://data/sideled/player/${team1[4].roleid}.PNG`;

      responseData.SLplayer6 = `C://data/sideled/player/${team2[0].roleid}.PNG`;
      responseData.SLplayer7 = `C://data/sideled/player/${team2[1].roleid}.PNG`;
      responseData.SLplayer8 = `C://data/sideled/player/${team2[2].roleid}.PNG`;
      responseData.SLplayer9 = `C://data/sideled/player/${team2[3].roleid}.PNG`;
      responseData.SLplayer10 = `C://data/sideled/player/${team2[4].roleid}.PNG`;

      //SLrespawnTime
      responseData.SLrespawnTime1 = team1[0].revive_left_time !== 0 ? team1[0].revive_left_time : "";
      responseData.SLrespawnTime2 = team1[1].revive_left_time !== 0 ? team1[1].revive_left_time : "";
      responseData.SLrespawnTime3 = team1[2].revive_left_time !== 0 ? team1[2].revive_left_time : "";
      responseData.SLrespawnTime4 = team1[3].revive_left_time !== 0 ? team1[3].revive_left_time : "";
      responseData.SLrespawnTime5 = team1[4].revive_left_time !== 0 ? team1[4].revive_left_time : "";

      responseData.SLrespawnTime6 = team2[0].revive_left_time !== 0 ? team2[0].revive_left_time : "";
      responseData.SLrespawnTime7 = team2[1].revive_left_time !== 0 ? team2[1].revive_left_time : "";
      responseData.SLrespawnTime8 = team2[2].revive_left_time !== 0 ? team2[2].revive_left_time : "";
      responseData.SLrespawnTime9 = team2[3].revive_left_time !== 0 ? team2[3].revive_left_time : "";
      responseData.SLrespawnTime10 = team2[4].revive_left_time !== 0 ? team2[4].revive_left_time : "";

      //SLisAlive
      responseData.SLisAlive1 = `C://data/sideled/alive/${team1[0].revive_left_time !== 0 ? 1 : 0}.png`;
      responseData.SLisAlive2 = `C://data/sideled/alive/${team1[1].revive_left_time !== 0 ? 1 : 0}.png`;
      responseData.SLisAlive3 = `C://data/sideled/alive/${team1[2].revive_left_time !== 0 ? 1 : 0}.png`;
      responseData.SLisAlive4 = `C://data/sideled/alive/${team1[3].revive_left_time !== 0 ? 1 : 0}.png`;
      responseData.SLisAlive5 = `C://data/sideled/alive/${team1[4].revive_left_time !== 0 ? 1 : 0}.png`;

      responseData.SLisAlive6 = `C://data/sideled/alive/${team2[0].revive_left_time !== 0 ? 1 : 0}.png`;
      responseData.SLisAlive7 = `C://data/sideled/alive/${team2[1].revive_left_time !== 0 ? 1 : 0}.png`;
      responseData.SLisAlive8 = `C://data/sideled/alive/${team2[2].revive_left_time !== 0 ? 1 : 0}.png`;
      responseData.SLisAlive9 = `C://data/sideled/alive/${team2[3].revive_left_time !== 0 ? 1 : 0}.png`;
      responseData.SLisAlive10 = `C://data/sideled/alive/${team2[4].revive_left_time !== 0 ? 1 : 0}.png`;

      //team1exp
      for (let i = 0; i < 5; i++) {
        responseData[`exp${i + 1}`] = team1[i].exp.toLocaleString() || "";
      }

      //team2exp
      for (let i = 0; i < 5; i++) {
        responseData[`exp${i + 6}`] = team2[i].exp.toLocaleString() || "";
      }
      
      //team1players Emblems - ADD NULL CHECK
      for (let x = 0; x < 5; x++) {
        for (let i = 0; i < 3; i++) {
          responseData[`p${x + 1}Emblem${i + 1}`] =
            team1[x].rune_map && team1[x].rune_map[i + 1] 
              ? `${formData.emblemPath}${team1[x].rune_map[i + 1]}.png` 
              : `${formData.emblemPath}0.png`;
        }
      }
      
      //team2players Emblem - ADD NULL CHECK
      for (let x = 0; x < 5; x++) {
        for (let i = 0; i < 3; i++) {
          responseData[`p${x + 6}Emblem${i + 1}`] =
            team2[x].rune_map && team2[x].rune_map[i + 1]
              ? `${formData.emblemPath}${team2[x].rune_map[i + 1]}.png`
              : `${formData.emblemPath}0.png`;
        }
      }
      
      //Team1 custom runes - ADD NULL CHECK
      for (let i = 0; i < 5; i++) {
        responseData[`custom${i + 1}`] =
          team1[i].rune_id 
            ? `${formData.emblemPath}${team1[i].rune_id}.png`
            : `${formData.emblemPath}0.png`;
      }
      //Team2 custom runes - ADD NULL CHECK  
      for (let i = 0; i < 5; i++) {
        responseData[`custom${i + 6}`] =
          team2[i].rune_id
            ? `${formData.emblemPath}${team2[i].rune_id}.png`
            : `${formData.emblemPath}0.png`;
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

      //
      //playerNames for level
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

      // //gold
      responseData.level1 = team1[0].level
      responseData.level2 = team1[1].level
      responseData.level3 = team1[2].level
      responseData.level4 = team1[3].level
      responseData.level5 = team1[4].level

      responseData.level6 = team2[0].level
      responseData.level7 = team2[1].level
      responseData.level8 = team2[2].level
      responseData.level9 = team2[3].level
      responseData.level10 = team2[4].level

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
      responseData.goldShort10 =  // FIXED TYPO: was gold1Short0
        team2[4].gold >= 1000
          ? (team2[4].gold / 1000).toFixed(1) + "k"
          : team2[4].gold.toString();

      //Team1spells - ADD NULL CHECK
      for (let i = 0; i < 5; i++) {
        responseData[`spell${i + 1}`] =
          team1[i].skillid 
            ? `${formData.spellPath}${team1[i].skillid}.png`
            : `${formData.spellPath}0.png`;
      }

      //Team2spells - ADD NULL CHECK
      for (let i = 0; i < 5; i++) {
        responseData[`spell${i + 6}`] =
          team2[i].skillid
            ? `${formData.spellPath}${team2[i].skillid}.png`
            : `${formData.spellPath}0.png`;
      }
      
      //heroes - ADD NULL CHECK
      responseData.hero1 = team1[0].heroid ? `${formData.itemHeroPath}${team1[0].heroid}.png` : `${formData.itemHeroPath}0.png`;
      responseData.hero2 = team1[1].heroid ? `${formData.itemHeroPath}${team1[1].heroid}.png` : `${formData.itemHeroPath}0.png`;
      responseData.hero3 = team1[2].heroid ? `${formData.itemHeroPath}${team1[2].heroid}.png` : `${formData.itemHeroPath}0.png`;
      responseData.hero4 = team1[3].heroid ? `${formData.itemHeroPath}${team1[3].heroid}.png` : `${formData.itemHeroPath}0.png`;
      responseData.hero5 = team1[4].heroid ? `${formData.itemHeroPath}${team1[4].heroid}.png` : `${formData.itemHeroPath}0.png`;

      responseData.hero6 = team2[0].heroid ? `${formData.itemHeroPath}${team2[0].heroid}.png` : `${formData.itemHeroPath}0.png`;
      responseData.hero7 = team2[1].heroid ? `${formData.itemHeroPath}${team2[1].heroid}.png` : `${formData.itemHeroPath}0.png`;
      responseData.hero8 = team2[2].heroid ? `${formData.itemHeroPath}${team2[2].heroid}.png` : `${formData.itemHeroPath}0.png`;
      responseData.hero9 = team2[3].heroid ? `${formData.itemHeroPath}${team2[3].heroid}.png` : `${formData.itemHeroPath}0.png`;
      responseData.hero10 = team2[4].heroid ? `${formData.itemHeroPath}${team2[4].heroid}.png` : `${formData.itemHeroPath}0.png`;

      //Emb roles
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

      //Roles for level
      responseData.role1 = role_finder(team1[0].roleid, playerList)
      responseData.role2 = role_finder(team1[1].roleid, playerList)
      responseData.role3 = role_finder(team1[2].roleid, playerList)
      responseData.role4 = role_finder(team1[3].roleid, playerList)
      responseData.role5 = role_finder(team1[4].roleid, playerList)

      responseData.role6 = role_finder(team2[0].roleid, playerList)
      responseData.role7 = role_finder(team2[1].roleid, playerList)
      responseData.role8 = role_finder(team2[2].roleid, playerList)
      responseData.role9 = role_finder(team2[3].roleid, playerList)
      responseData.role10 = role_finder(team2[4].roleid, playerList)

      //EMBLEM HERO - ADD NULL CHECK
      responseData.EmblemHero1 = team1[0].heroid ? `C://data/emblem/hero/${team1[0].heroid}.png` : `C://data/emblem/hero/0.png`;
      responseData.EmblemHero2 = team1[1].heroid ? `C://data/emblem/hero/${team1[1].heroid}.png` : `C://data/emblem/hero/0.png`;
      responseData.EmblemHero3 = team1[2].heroid ? `C://data/emblem/hero/${team1[2].heroid}.png` : `C://data/emblem/hero/0.png`;
      responseData.EmblemHero4 = team1[3].heroid ? `C://data/emblem/hero/${team1[3].heroid}.png` : `C://data/emblem/hero/0.png`;
      responseData.EmblemHero5 = team1[4].heroid ? `C://data/emblem/hero/${team1[4].heroid}.png` : `C://data/emblem/hero/0.png`;

      responseData.EmblemHero6 = team2[0].heroid ? `C://data/emblem/hero/${team2[0].heroid}.png` : `C://data/emblem/hero/0.png`;
      responseData.EmblemHero7 = team2[1].heroid ? `C://data/emblem/hero/${team2[1].heroid}.png` : `C://data/emblem/hero/0.png`;
      responseData.EmblemHero8 = team2[2].heroid ? `C://data/emblem/hero/${team2[2].heroid}.png` : `C://data/emblem/hero/0.png`;
      responseData.EmblemHero9 = team2[3].heroid ? `C://data/emblem/hero/${team2[3].heroid}.png` : `C://data/emblem/hero/0.png`;
      responseData.EmblemHero10 = team2[4].heroid ? `C://data/emblem/hero/${team2[4].heroid}.png` : `C://data/emblem/hero/0.png`;

      //goldDiff Hero - ADD NULL CHECK
      responseData.goldDiffHero1 = team1[0].heroid ? `${formData.goldDiffHeroPath}${team1[0].heroid}.png` : `${formData.goldDiffHeroPath}0.png`;
      responseData.goldDiffHero2 = team1[1].heroid ? `${formData.goldDiffHeroPath}${team1[1].heroid}.png` : `${formData.goldDiffHeroPath}0.png`;
      responseData.goldDiffHero3 = team1[2].heroid ? `${formData.goldDiffHeroPath}${team1[2].heroid}.png` : `${formData.goldDiffHeroPath}0.png`;
      responseData.goldDiffHero4 = team1[3].heroid ? `${formData.goldDiffHeroPath}${team1[3].heroid}.png` : `${formData.goldDiffHeroPath}0.png`;
      responseData.goldDiffHero5 = team1[4].heroid ? `${formData.goldDiffHeroPath}${team1[4].heroid}.png` : `${formData.goldDiffHeroPath}0.png`;

      responseData.goldDiffHero6 = team2[0].heroid ? `${formData.goldDiffHeroPath}${team2[0].heroid}.png` : `${formData.goldDiffHeroPath}0.png`;
      responseData.goldDiffHero7 = team2[1].heroid ? `${formData.goldDiffHeroPath}${team2[1].heroid}.png` : `${formData.goldDiffHeroPath}0.png`;
      responseData.goldDiffHero8 = team2[2].heroid ? `${formData.goldDiffHeroPath}${team2[2].heroid}.png` : `${formData.goldDiffHeroPath}0.png`;
      responseData.goldDiffHero9 = team2[3].heroid ? `${formData.goldDiffHeroPath}${team2[3].heroid}.png` : `${formData.goldDiffHeroPath}0.png`;
      responseData.goldDiffHero10 = team2[4].heroid ? `${formData.goldDiffHeroPath}${team2[4].heroid}.png` : `${formData.goldDiffHeroPath}0.png`;

      //led Hero - ADD NULL CHECK
      responseData.ledHeroes1 = team1[0].heroid ? `C://data/led/item/hero/${team1[0].heroid}.png` : `C://data/led/item/hero/0.png`;
      responseData.ledHeroes2 = team1[1].heroid ? `C://data/led/item/hero/${team1[1].heroid}.png` : `C://data/led/item/hero/0.png`;
      responseData.ledHeroes3 = team1[2].heroid ? `C://data/led/item/hero/${team1[2].heroid}.png` : `C://data/led/item/hero/0.png`;
      responseData.ledHeroes4 = team1[3].heroid ? `C://data/led/item/hero/${team1[3].heroid}.png` : `C://data/led/item/hero/0.png`;
      responseData.ledHeroes5 = team1[4].heroid ? `C://data/led/item/hero/${team1[4].heroid}.png` : `C://data/led/item/hero/0.png`;

      responseData.ledHeroes6 = team2[0].heroid ? `C://data/led/item/hero/${team2[0].heroid}.png` : `C://data/led/item/hero/0.png`;
      responseData.ledHeroes7 = team2[1].heroid ? `C://data/led/item/hero/${team2[1].heroid}.png` : `C://data/led/item/hero/0.png`;
      responseData.ledHeroes8 = team2[2].heroid ? `C://data/led/item/hero/${team2[2].heroid}.png` : `C://data/led/item/hero/0.png`;
      responseData.ledHeroes9 = team2[3].heroid ? `C://data/led/item/hero/${team2[3].heroid}.png` : `C://data/led/item/hero/0.png`;
      responseData.ledHeroes10 = team2[4].heroid ? `C://data/led/item/hero/${team2[4].heroid}.png` : `C://data/led/item/hero/0.png`;

      //vs heroes - ADD NULL CHECK
      for (let i = 0; i < 5; i++) {
        responseData[`vshero${i + 1}`] = team1[i].heroid ? `C://data/vs/hero/${team1[i].heroid}.png` : `C://data/vs/hero/0.png`;
        responseData[`vsPlayer${i + 1}`] = `C://data/vs/player/1/${team1[i].roleid}.png`;
      }
      for (let i = 0; i < 5; i++) {
        responseData[`vshero${i + 6}`] = team2[i].heroid ? `C://data/vs/hero/${team2[i].heroid}.png` : `C://data/vs/hero/0.png`;
        responseData[`vsPlayer${i + 6}`] = `C://data/vs/player/2/${team2[i].roleid}.png`;
      }

      //items - ADD NULL CHECKS
      //P1Items
      for (let i = 0; i < 6; i++) {
        responseData[`p1Item${i + 1}`] =
          team1[0].equip_list && team1[0].equip_list[i]
            ? `${formData.itemPath}${team1[0].equip_list[i]}.png`
            : `${formData.itemPath}0.png`;
      }

      //P2Items
      for (let i = 0; i < 6; i++) {
        responseData[`p2Item${i + 1}`] =
          team1[1].equip_list && team1[1].equip_list[i]
            ? `${formData.itemPath}${team1[1].equip_list[i]}.png`
            : `${formData.itemPath}0.png`;
      }

      //P3Items
      for (let i = 0; i < 6; i++) {
        responseData[`p3Item${i + 1}`] =
          team1[2].equip_list && team1[2].equip_list[i]
            ? `${formData.itemPath}${team1[2].equip_list[i]}.png`
            : `${formData.itemPath}0.png`;
      }

      //P4Items
      for (let i = 0; i < 6; i++) {
        responseData[`p4Item${i + 1}`] =
          team1[3].equip_list && team1[3].equip_list[i]
            ? `${formData.itemPath}${team1[3].equip_list[i]}.png`
            : `${formData.itemPath}0.png`;
      }

      //P5Items
      for (let i = 0; i < 6; i++) {
        responseData[`p5Item${i + 1}`] =
          team1[4].equip_list && team1[4].equip_list[i]
            ? `${formData.itemPath}${team1[4].equip_list[i]}.png`
            : `${formData.itemPath}0.png`;
      }

      //P6Items
      for (let i = 0; i < 6; i++) {
        responseData[`p6Item${i + 1}`] =
          team2[0].equip_list && team2[0].equip_list[i]
            ? `${formData.itemPath}${team2[0].equip_list[i]}.png`
            : `${formData.itemPath}0.png`;
      }

      //P7Items
      for (let i = 0; i < 6; i++) {
        responseData[`p7Item${i + 1}`] =
          team2[1].equip_list && team2[1].equip_list[i]
            ? `${formData.itemPath}${team2[1].equip_list[i]}.png`
            : `${formData.itemPath}0.png`;
      }

      //P8Items
      for (let i = 0; i < 6; i++) {
        responseData[`p8Item${i + 1}`] =
          team2[2].equip_list && team2[2].equip_list[i]
            ? `${formData.itemPath}${team2[2].equip_list[i]}.png`
            : `${formData.itemPath}0.png`;
      }

      //P9Items
      for (let i = 0; i < 6; i++) {
        responseData[`p9Item${i + 1}`] =
          team2[3].equip_list && team2[3].equip_list[i]
            ? `${formData.itemPath}${team2[3].equip_list[i]}.png`
            : `${formData.itemPath}0.png`;
      }

      //P10Items
      for (let i = 0; i < 6; i++) {
        responseData[`p10Item${i + 1}`] =
          team2[4].equip_list && team2[4].equip_list[i]
            ? `${formData.itemPath}${team2[4].equip_list[i]}.png`
            : `${formData.itemPath}0.png`;
      }

      //kda
      for (let i = 0; i < 5; i++) {
        responseData[`kda${i + 1}`] = `${team1[i].kill_num} / ${team1[i].dead_num} / ${team1[i].assist_num}`;
      }

      for (let i = 0; i < 5; i++) {
        responseData[`kda${i + 6}`] = `${team2[i].kill_num} / ${team2[i].dead_num} / ${team2[i].assist_num}`;
      }

      //team1GoldDiff
      for (let i = 0; i < 5; i++) {
        const goldDiff = team1[i].gold - team2[i].gold;
        responseData[`team1GoldDiff${i + 1}`] =
          goldDiff > 0
            ? goldDiff >= 1000
              ? "+" + (goldDiff / 1000).toFixed(1) + "k"
              : "+" + goldDiff.toString()
            : "";
      }

      //team2GoldDiff
      for (let i = 0; i < 5; i++) {
        const goldDiff = team2[i].gold - team1[i].gold;
        responseData[`team2GoldDiff${i + 1}`] =
          goldDiff > 0
            ? goldDiff >= 1000
              ? "+" + (goldDiff / 1000).toFixed(1) + "k"
              : "+" + goldDiff.toString()
            : "";
      }

      //goldDiffPng - ADD DIVISION BY ZERO CHECK
      for (let i = 0; i < 5; i++) {
        const team1Gold = team1[i].gold;
        const team2Gold = team2[i].gold;
        const totalGold = team1Gold + team2Gold;

        if (totalGold > 0) {
          const goldDiffPct = (team2Gold / totalGold) * 100;
          const goldDiffPng = `${goldDiffPct.toFixed(0)}.png`;
          responseData[`goldDiffPng${i + 1}`] = formData.goldIconPngPath + goldDiffPng;
        } else {
          responseData[`goldDiffPng${i + 1}`] = formData.goldIconPngPath + "50.png"; // Default to 50% when no gold
        }
      }

      let jsonData = { data: [responseData] };
      res.send(jsonData);
    } catch (e) {
      console.error("Error processing data:", e);
      res.status(500).send("Error processing data");
    }
  });
});

app.get("/golddiffV1", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
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

app.get("/golddiff", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
    id +
    "&dataid=1";
  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }
    try {
      const data = body;
      let responseData = {};
      
      // Check if data structure is valid
      if (!data || !data.data || !data.data.camp_list || data.data.camp_list.length < 2) {
        return res.status(500).json({ error: "Invalid data structure" });
      }
      
      let team = data.data.camp_list;
      let team1 = role_sorter(team[0].player_list, playerList);
      let team2 = role_sorter(team[1].player_list, playerList);
      
      // Ensure both teams have players
      if (!team1 || !team2 || team1.length === 0 || team2.length === 0) {
        return res.status(500).json({ error: "Invalid team data" });
      }
      
      // Calculate total gold for each team to determine the highest gold for bar visualization
      arrayC = team1.concat(team2);
      arrayC.sort((a, b) => (b.gold || 0) - (a.gold || 0));
      let hightestGold = arrayC[0] ? (arrayC[0].gold || 1) : 1;
      
      role_sorter(team1, playerList);
      role_sorter(team2, playerList);

      // Helper function to format gold with commas
      const formatGold = (gold) => {
        const goldValue = gold || 0;
        return goldValue >= 1000 ? goldValue.toLocaleString('en-US') : goldValue.toString();
      };

      // Helper function to create gold short format
      const formatGoldShort = (gold) => {
        const goldValue = gold || 0;
        return `${(goldValue / 1000).toFixed(1)}k`;
      };

      // Helper function to calculate gold difference between same roles
      const calculateSameRoleGoldDiff = (playerGold, opposingPlayerGold) => {
        const gold1 = playerGold || 0;
        const gold2 = opposingPlayerGold || 0;
        const diff = gold1 - gold2;
        
        if (diff > 0) {
          // Player has more gold than their role counterpart
          if (Math.abs(diff) >= 1000) {
            return `+${(diff / 1000).toFixed(1)}k`;
          } else {
            return `+${diff.toString()}`;
          }
        } else {
          // Player has less gold or equal gold - show blank
          return "";
        }
      };

      //team1 players (1-5) - compare with their same role counterparts (6-10)
      for (let i = 0; i < Math.min(5, team1.length); i++) {
        const player = team1[i] || {};
        const sameRoleOpponent = team2[i] || {}; // Same role opponent
        
        responseData[`Name${i + 1}`] = 
          name_finder(player.roleid, playerList) || player.name || 'Unknown';
        responseData[`Hero${i + 1}`] = 
          "C://data/golddiff/hero/" + (player.heroid || 'default') + ".png";
        responseData[`Gold${i + 1}`] = formatGold(player.gold);
        responseData[`GoldShort${i + 1}`] = formatGoldShort(player.gold);
        responseData[`GoldDiff${i + 1}`] = calculateSameRoleGoldDiff(player.gold, sameRoleOpponent.gold);
        
        const playerGold = player.gold || 0;
        const opponentGold = sameRoleOpponent.gold || 0;
        const combinedGold = playerGold + opponentGold;
        const percent = combinedGold > 0 ? 
          ((playerGold / combinedGold) * 100).toFixed(0) : "0";
        responseData[`Bar${i + 1}`] = 
          "C://data/golddiff/" + (player.campid || team[0].campid) + "/" + percent + ".png";
      }

      //team2 players (6-10) - compare with their same role counterparts (1-5)
      for (let i = 0; i < Math.min(5, team2.length); i++) {
        const player = team2[i] || {};
        const sameRoleOpponent = team1[i] || {}; // Same role opponent
        
        responseData[`Name${i + 6}`] = 
          name_finder(player.roleid, playerList) || player.name || 'Unknown';
        responseData[`Hero${i + 6}`] = 
          "C://data/golddiff/hero/" + (player.heroid || 'default') + ".png";
        responseData[`Gold${i + 6}`] = formatGold(player.gold);
        responseData[`GoldShort${i + 6}`] = formatGoldShort(player.gold);
        responseData[`GoldDiff${i + 6}`] = calculateSameRoleGoldDiff(player.gold, sameRoleOpponent.gold);
        
        const playerGold = player.gold || 0;
        const opponentGold = sameRoleOpponent.gold || 0;
        const combinedGold = playerGold + opponentGold;
        const percent = combinedGold > 0 ? 
          ((playerGold / combinedGold) * 100).toFixed(0) : "0";
        responseData[`Bar${i + 6}`] = 
          "C://data/golddiff/" + (player.campid || team[1].campid) + "/" + percent + ".png";
      }

      // Fill remaining slots with null values if teams have less than 5 players
      for (let i = Math.max(team1.length, 0); i < 5; i++) {
        responseData[`Name${i + 1}`] = null;
        responseData[`Hero${i + 1}`] = null;
        responseData[`Gold${i + 1}`] = null;
        responseData[`GoldShort${i + 1}`] = null;
        responseData[`GoldDiff${i + 1}`] = null;
        responseData[`Bar${i + 1}`] = null;
      }

      for (let i = Math.max(team2.length, 0); i < 5; i++) {
        responseData[`Name${i + 6}`] = null;
        responseData[`Hero${i + 6}`] = null;
        responseData[`Gold${i + 6}`] = null;
        responseData[`GoldShort${i + 6}`] = null;
        responseData[`GoldDiff${i + 6}`] = null;
        responseData[`Bar${i + 6}`] = null;
      }

      let jsonData = { data: [responseData] };
      res.send(jsonData);
      
    } catch (e) {
      console.error('Gold diff processing error:', e);
      res.status(500).json({ 
        error: "Failed to process gold diff data", 
        details: e.message 
      });
    }
  });
});

app.get("/inGameOverlay", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
    id +
    "&dataid=1";

  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }

    let responseData = {};
    let data = body;

    // Check if data structure exists
    if (!data || !data.data || !data.data.camp_list) {
      return res.status(500).send({ error: "Invalid data structure from API" });
    }

    let a = data.data.camp_list;
    let team1 = a[0] && a[0].player_list ? a[0].player_list : [];
    let team2 = a[1] && a[1].player_list ? a[1].player_list : [];
    role_sorter(team1, playerList)
    role_sorter(team2, playerList)

    // Game state info
    responseData.state_left_time = data.data.state_left_time;
    responseData.game_time = data.data.game_time;
    responseData.win_camp = data.data.win_camp;

    // Team 1 Players (1-5)
    for (let i = 0; i < 5; i++) {
      const playerNum = i + 1;

      if (team1 && team1[i]) {
        const player = team1[i];

        // Hero images
        responseData[`hero${playerNum}`] = `C://data/ingame/hero/${
          player.heroid || 0
        }.png`;

        // Player images
        responseData[`player${playerNum}`] = `C://data/ingame/player/${
          player.roleid || 0
        }.png`;

        // Player names
        responseData[`Name${playerNum}`] =
          (typeof name_finder === "function"
            ? name_finder(player.roleid, playerList)
            : null) ||
          player.name ||
          `Player ${playerNum}`;

        // KDA calculation
        const k = player.kill_num || 0;
        const d = player.dead_num || 0;
        const a = player.assist_num || 0;
        responseData[`KDA${playerNum}`] = `${k}/${d}/${a}`;

        // Respawn countdown
        responseData[`RespawnCountdown${playerNum}`] =
          player.revive_left_time || "";

        // Battle spell
        responseData[
          `BattleSpell${playerNum}`
        ] = `C://data/ingame/battlespell/${player.skillid || 0}.png`;

        // Battle spell countdown
        responseData[`Countdown${playerNum}`] =
          player.skill_left_time || "";

        // Spell overlay (0 if countdown > 0, else 1)
        const countdown = player.skill_left_time || 0;
        responseData[`SpellOverlay${playerNum}`] = countdown > 0 
          ? `C://data/ingame/spell/overlay/0.png`
          : `C://data/ingame/spell/overlay/1.png`;

        // Emblem (last value from rune_map)
        const runeMapValues = Object.values(player.rune_map || {});
        const lastEmblemValue = runeMapValues[runeMapValues.length - 1] || 0;
        responseData[
          `Emblem${playerNum}`
        ] = `C://data/ingame/emblem/${lastEmblemValue}.png`;

        // Is alive status
        responseData[`IsAlive${playerNum}`] = player.dead
          ? "C://data/ingame/overlay/0.png"
          : "C://data/ingame/overlay/1.png";

        // Level
        responseData[`Level${playerNum}`] = player.level || 1;
      } else {
        // Default values for missing players
        responseData[`hero${playerNum}`] = `C://data/ingame/hero/0.png`;
        responseData[`player${playerNum}`] = `C://data/ingame/player/0.png`;
        responseData[`Name${playerNum}`] = `Player ${playerNum}`;
        responseData[`KDA${playerNum}`] = "0/0/0";
        responseData[`RespawnCountdown${playerNum}`] = "";
        responseData[
          `BattleSpell${playerNum}`
        ] = `C://data/ingame/battlespell/0.png`;
        responseData[`Countdown${playerNum}`] = "";
        responseData[
          `Emblem${playerNum}`
        ] = `C://data/ingame/emblem/0.png`;
        responseData[`IsAlive${playerNum}`] =
          "C://data/ingame/overlay/1.png";
        responseData[`Level${playerNum}`] = 1;
      }
    }

    // Team 2 Players (6-10) - Now using same naming convention as Team 1
    for (let i = 0; i < 5; i++) {
      const playerNum = i + 6;

      if (team2 && team2[i]) {
        const player = team2[i];

        // Hero images
        responseData[`hero${playerNum}`] = `C://data/ingame/hero/${
          player.heroid || 0
        }.png`;

        // Player images
        responseData[`player${playerNum}`] = `C://data/ingame/player/${
          player.roleid || 0
        }.png`;

        // Player names
        responseData[`Name${playerNum}`] =
          (typeof name_finder === "function"
            ? name_finder(player.roleid, playerList)
            : null) ||
          player.name ||
          `Player ${playerNum}`;

        // KDA calculation
        const k = player.kill_num || 0;
        const d = player.dead_num || 0;
        const a = player.assist_num || 0;
        responseData[`KDA${playerNum}`] = `${k}/${d}/${a}`;

        // Respawn countdown
        responseData[`RespawnCountdown${playerNum}`] =
          player.revive_left_time || "";

        // Spell overlay (0 if countdown > 0, else 1)
        const countdown = player.skill_left_time || 0;
        responseData[`SpellOverlay${playerNum}`] = countdown > 0 
          ? `C://data/ingame/spell/overlay/0.png`
          : `C://data/ingame/spell/overlay/1.png`;

        // Battle spell
        responseData[
          `BattleSpell${playerNum}`
        ] = `C://data/ingame/battlespell/${player.skillid || 0}.png`;

        // Battle spell countdown
        responseData[`Countdown${playerNum}`] =
          player.skill_left_time || "";

        // Emblem (last value from rune_map)
        const runeMapValues = Object.values(player.rune_map || {});
        const lastEmblemValue = runeMapValues[runeMapValues.length - 1] || 0;
        responseData[
          `Emblem${playerNum}`
        ] = `C://data/ingame/emblem/${lastEmblemValue}.png`;

        // Is alive status
        responseData[`IsAlive${playerNum}`] = player.dead
          ? "C://data/ingame/overlay/0.png"
          : "C://data/ingame/overlay/1.png";

        // Level
        responseData[`Level${playerNum}`] = player.level || 1;
      } else {
        // Default values for missing players
        responseData[`hero${playerNum}`] = `C://data/ingame/hero/0.png`;
        responseData[`player${playerNum}`] = `C://data/ingame/player/0.png`;
        responseData[`Name${playerNum}`] = `Player ${playerNum}`;
        responseData[`KDA${playerNum}`] = "0/0/0";
        responseData[`RespawnCountdown${playerNum}`] = "";
        responseData[
          `BattleSpell${playerNum}`
        ] = `C://data/ingame/battlespell/0.png`;
        responseData[`Countdown${playerNum}`] = "";
        responseData[
          `Emblem${playerNum}`
        ] = `C://data/ingame/emblem/0.png`;
        responseData[`IsAlive${playerNum}`] =
          "C://data/ingame/overlay/1.png";
        responseData[`Level${playerNum}`] = 1;
      }
    }

    let jsonData = { data: [responseData] };
    res.send(jsonData);
  });
});

app.get("/splitled", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
    id +
    "&dataid=1";

  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }

    let responseData = {};
    let data = body;

    // Check if data structure exists
    if (!data || !data.data || !data.data.camp_list) {
      return res.status(500).send({ error: "Invalid data structure from API" });
    }

    let a = data.data.camp_list;
    let team1 = a[0] && a[0].player_list ? a[0].player_list : [];
    let team2 = a[1] && a[1].player_list ? a[1].player_list : [];
    
    // Sort teams by roles
    role_sorter(team1, playerList);
    role_sorter(team2, playerList);

    // Team 1 Players (1-5)
    for (let i = 0; i < 5; i++) {
      const playerNum = i + 1;

      if (team1 && team1[i]) {
        const player = team1[i];

        // Player pic
        responseData[`player${playerNum}`] = `C://data/led/player/${player.roleid || 0}.png`;

        // Role
        responseData[`role${playerNum}`] = `C://data/led/role/${player.c_role || 'undefined'}.png`;

        // Name
        responseData[`name${playerNum}`] = 
          (typeof name_finder === "function" ? name_finder(player.roleid, playerList) : null) || 
          player.name || `Player ${playerNum}`;

        // Hero
        responseData[`hero${playerNum}`] = `C://data/led/hero/${player.heroid || 0}.png`;

        // Items (6 slots, fill with 0 if missing)
        const equipList = player.equip_list || [];
        for (let j = 1; j <= 6; j++) {
          const itemId = equipList[j - 1] || 0;
          responseData[`player${playerNum}item${j}`] = `C://data/led/item/${itemId}.png`;
        }

        // KDA
        const k = player.kill_num || 0;
        const d = player.dead_num || 0;
        const a = player.assist_num || 0;
        responseData[`kda${playerNum}`] = `${k}/${d}/${a}`;

        // Gold
        responseData[`gold${playerNum}`] = player.gold || 0;

        // Main Emblem (rune_id)
        responseData[`MainEmblem${playerNum}`] = `C://data/led/emblem/${player.rune_id || 0}.png`;

        // Player emblems (from rune_map)
        const runeMapValues = Object.values(player.rune_map || {});
        for (let j = 1; j <= 3; j++) {
          const emblemValue = runeMapValues[j - 1] || 0;
          responseData[`player${playerNum}Emblem${j}`] = `C://data/led/emblem/${emblemValue}.png`;
        }

      } else {
        // Default values for missing players
        responseData[`player${playerNum}`] = `C://data/led/player/0.png`;
        responseData[`role${playerNum}`] = `C://data/led/role/undefined.png`;
        responseData[`name${playerNum}`] = `Player ${playerNum}`;
        responseData[`hero${playerNum}`] = `C://data/led/hero/0.png`;

        // Default items (6 slots)
        for (let j = 1; j <= 6; j++) {
          responseData[`player${playerNum}item${j}`] = `C://data/led/item/0.png`;
        }

        responseData[`kda${playerNum}`] = "0/0/0";
        responseData[`gold${playerNum}`] = 0;
        responseData[`MainEmblem${playerNum}`] = `C://data/led/emblem/0.png`;

        // Default emblems (3 slots)
        for (let j = 1; j <= 3; j++) {
          responseData[`player${playerNum}Emblem${j}`] = `C://data/led/emblem/0.png`;
        }
      }
    }

    // Team 2 Players (6-10)
    for (let i = 0; i < 5; i++) {
      const playerNum = i + 6;

      if (team2 && team2[i]) {
        const player = team2[i];

        // Player pic
        responseData[`player${playerNum}`] = `C://data/led/player/${player.roleid || 0}.png`;

        // Role
        responseData[`role${playerNum}`] = `C://data/led/role/${player.c_role || 'undefined'}.png`;

        // Name
        responseData[`name${playerNum}`] = 
          (typeof name_finder === "function" ? name_finder(player.roleid, playerList) : null) || 
          player.name || `Player ${playerNum}`;

        // Hero
        responseData[`hero${playerNum}`] = `C://data/led/hero/${player.heroid || 0}.png`;

        // Items (6 slots, fill with 0 if missing)
        const equipList = player.equip_list || [];
        for (let j = 1; j <= 6; j++) {
          const itemId = equipList[j - 1] || 0;
          responseData[`player${playerNum}item${j}`] = `C://data/led/item/${itemId}.png`;
        }

        // KDA
        const k = player.kill_num || 0;
        const d = player.dead_num || 0;
        const a = player.assist_num || 0;
        responseData[`kda${playerNum}`] = `${k}/${d}/${a}`;

        // Gold
        responseData[`gold${playerNum}`] = player.gold || 0;

        // Main Emblem (rune_id)
        responseData[`MainEmblem${playerNum}`] = `C://data/led/emblem/${player.rune_id || 0}.png`;

        // Player emblems (from rune_map)
        const runeMapValues = Object.values(player.rune_map || {});
        for (let j = 1; j <= 3; j++) {
          const emblemValue = runeMapValues[j - 1] || 0;
          responseData[`player${playerNum}Emblem${j}`] = `C://data/led/emblem/${emblemValue}.png`;
        }

      } else {
        // Default values for missing players
        responseData[`player${playerNum}`] = `C://data/led/player/0.png`;
        responseData[`role${playerNum}`] = `C://data/led/role/undefined.png`;
        responseData[`name${playerNum}`] = `Player ${playerNum}`;
        responseData[`hero${playerNum}`] = `C://data/led/hero/0.png`;

        // Default items (6 slots)
        for (let j = 1; j <= 6; j++) {
          responseData[`player${playerNum}item${j}`] = `C://data/led/item/0.png`;
        }

        responseData[`kda${playerNum}`] = "0/0/0";
        responseData[`gold${playerNum}`] = 0;
        responseData[`MainEmblem${playerNum}`] = `C://data/led/emblem/0.png`;

        // Default emblems (3 slots)
        for (let j = 1; j <= 3; j++) {
          responseData[`player${playerNum}Emblem${j}`] = `C://data/led/emblem/0.png`;
        }
      }
    }

    let jsonData = { data: [responseData] };
    res.send(jsonData);
  });
});

// app.get("/playerled", (req, res) => {
//   const battleData =
//     "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
//     id +
//     "&dataid=1";

//   request({ url: battleData, json: true }, (error, response, body) => {
//     if (error) {
//       return res.status(500).send(error);
//     }

//     let responseData = {};
//     let data = body;

//     // Check if data structure exists
//     if (!data || !data.data || !data.data.camp_list) {
//       return res.status(500).send({ error: "Invalid data structure from API" });
//     }

//     let a = data.data.camp_list;
//     let team1 = a[0] && a[0].player_list ? a[0].player_list : [];
//     let team2 = a[1] && a[1].player_list ? a[1].player_list : [];

//     // Sort teams by roles
//     role_sorter(team1, playerList);
//     role_sorter(team2, playerList);

//     // Team 1 Players (1-5)
//     for (let i = 0; i < 5; i++) {
//       const playerNum = i + 1;

//       if (team1 && team1[i]) {
//         const player = team1[i];

//         // Player image - hero if picked, otherwise player role
//         if (player.heroid && player.heroid !== 0) {
//           responseData[`player${playerNum}`] = `C://data/playerled/hero/${player.heroid}.png`;
//         } else {
//           responseData[`player${playerNum}`] = `C://data/playerled/player/${player.roleid || 0}.png`;
//         }

//         // Respawn countdown - show countdown if not 0, empty string if 0
//         const respawnTime = player.revive_left_time || 0;
//         responseData[`respawnCountdown${playerNum}`] = respawnTime !== 0 ? respawnTime : "";

//         // Is alive status
//         responseData[`isAlive${playerNum}`] = player.dead ?
//           "C://data/playerled/overlay/0.png" : "C://data/playerled/overlay/1.png";

//       } else {
//         // Default values for missing players
//         responseData[`player${playerNum}`] = `C://data/playerled/player/0.png`;
//         responseData[`respawnCountdown${playerNum}`] = "";
//         responseData[`isAlive${playerNum}`] = "C://data/playerled/overlay/1.png";
//       }
//     }

//     // Team 2 Players (6-10)
//     for (let i = 0; i < 5; i++) {
//       const playerNum = i + 6;

//       if (team2 && team2[i]) {
//         const player = team2[i];

//         // Player image - hero if picked, otherwise player role
//         if (player.heroid && player.heroid !== 0) {
//           responseData[`player${playerNum}`] = `C://data/playerled/hero/${player.heroid}.png`;
//         } else {
//           responseData[`player${playerNum}`] = `C://data/playerled/player/${player.roleid || 0}.png`;
//         }

//         // Respawn countdown - show countdown if not 0, empty string if 0
//         const respawnTime = player.revive_left_time || 0;
//         responseData[`respawnCountdown${playerNum}`] = respawnTime !== 0 ? respawnTime : "";

//         // Is alive status
//         responseData[`isAlive${playerNum}`] = player.dead ?
//           "C://data/playerled/overlay/0.png" : "C://data/playerled/overlay/1.png";

//       } else {
//         // Default values for missing players
//         responseData[`player${playerNum}`] = `C://data/playerled/player/0.png`;
//         responseData[`respawnCountdown${playerNum}`] = "";
//         responseData[`isAlive${playerNum}`] = "C://data/playerled/overlay/1.png";
//       }
//     }

//     let jsonData = { data: [responseData] };
//     res.send(jsonData);
//   });
// });


app.get("/playerled", (req, res) => {
  const battleData =
    "http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=" +
    id +
    "&dataid=1";

  request({ url: battleData, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send(error);
    }

    let responseData = {};
    let data = body;

    // Check if data structure exists
    if (!data || !data.data || !data.data.camp_list) {
      return res.status(500).send({ error: "Invalid data structure from API" });
    }

    let a = data.data.camp_list;
    let team1 = a[0] && a[0].player_list ? a[0].player_list : [];
    let team2 = a[1] && a[1].player_list ? a[1].player_list : [];

    // Team short names and logos
    responseData.team1ShortName = 
      formData.team1_shortName || (team1[0] && team1[0].team_simple_name) || "";
    responseData.team2ShortName = 
      formData.team2_shortName || (team2[0] && team2[0].team_simple_name) || "";

    responseData.team1Logo = `C://data/playerled/logo/${
      formData.team1_shortName || (team1[0] && team1[0].team_simple_name) || ""
    }.png`;
    responseData.team2Logo = `C://data/playerled/logo/${
      formData.team2_shortName || (team2[0] && team2[0].team_simple_name) || ""
    }.png`;

    // Sort teams by roles
    role_sorter(team1, playerList);
    role_sorter(team2, playerList);

    // Team 1 Players (1-5)
    for (let i = 0; i < 5; i++) {
      const playerNum = i + 1;

      if (team1 && team1[i]) {
        const player = team1[i];

        // Player image - hero if picked, otherwise player role
        if (player.heroid && player.heroid !== 0) {
          responseData[`player${playerNum}`] = `C://data/playerled/hero/${player.heroid}.png`;
        } else {
          responseData[`player${playerNum}`] = `C://data/playerled/hero/0.png`;
        }

        // Player name using name_finder function
        responseData[`name${playerNum}`] = name_finder(player.roleid, playerList) || "";

        // Custom role from role_sorter function (now available as player.c_role)
        responseData[`c_role${playerNum}`] = `C://data/playerled/role/${player.c_role}.png` || "";
        responseData[`small_role${playerNum}`] = `C://data/playerled/smallrole/${player.c_role}.png` || "";

        // Respawn countdown - show countdown if not 0, empty string if 0
        const respawnTime = player.revive_left_time || 0;
        responseData[`respawnCountdown${playerNum}`] = respawnTime !== 0 ? respawnTime : "";

        // Is alive status
        responseData[`isAlive${playerNum}`] = player.dead ?
          "C://data/playerled/overlay/0.png" : "C://data/playerled/overlay/1.png";

        //has ult status
        responseData[`hasUlt${playerNum}`] = player.major_left_time === 0 ? "C://data/playerled/ult/1.png" : "C://data/playerled/ult/0.png"

      } else {
        // Default values for missing players
        responseData[`player${playerNum}`] = `C://data/playerled/player/0.png`;
        responseData[`name${playerNum}`] = "";
        responseData[`c_role${playerNum}`] = "";
        responseData[`respawnCountdown${playerNum}`] = "";
        responseData[`isAlive${playerNum}`] = "C://data/playerled/overlay/1.png";
        responseData[`hasUlt${playerNum}`] = "C://data/playerled/ult/0.png"
      }
    }

    // Team 2 Players (6-10)
    for (let i = 0; i < 5; i++) {
      const playerNum = i + 6;

      if (team2 && team2[i]) {
        const player = team2[i];

        // Player image - hero if picked, otherwise player role
        if (player.heroid && player.heroid !== 0) {
          responseData[`player${playerNum}`] = `C://data/playerled/hero/${player.heroid}.png`;
        } else {
          responseData[`player${playerNum}`] = `C://data/playerled/hero/0.png`;
        }

        // Player name using name_finder function
        responseData[`name${playerNum}`] = name_finder(player.roleid, playerList) || "";

        // Custom role from role_sorter function (now available as player.c_role)
        responseData[`c_role${playerNum}`] = `C://data/playerled/role/${player.c_role}.png` || "";
        responseData[`smallrole${playerNum}`] = `C://data/playerled/smallrole/${player.c_role}.png` || "";

        // Respawn countdown - show countdown if not 0, empty string if 0
        const respawnTime = player.revive_left_time || 0;
        responseData[`respawnCountdown${playerNum}`] = respawnTime !== 0 ? respawnTime : "";

        // Is alive status
        responseData[`isAlive${playerNum}`] = player.dead ?
          "C://data/playerled/overlay/0.png" : "C://data/playerled/overlay/1.png";

        //has ult status
        responseData[`hasUlt${playerNum}`] = player.major_left_time === 0 ? "C://data/playerled/ult/1.png" : "C://data/playerled/ult/0.png"

      } else {
        // Default values for missing players
        responseData[`player${playerNum}`] = `C://data/playerled/player/0.png`;
        responseData[`name${playerNum}`] = "";
        responseData[`c_role${playerNum}`] = "";
        responseData[`respawnCountdown${playerNum}`] = "";
        responseData[`isAlive${playerNum}`] = "C://data/playerled/overlay/1.png";
        responseData[`hasUlt${playerNum}`] = "C://data/playerled/ult/0.png"
      }
    }

    let jsonData = { data: [responseData] };
    res.send(jsonData);
  });
});

app.get('/mileStone', (req, res) => {
  const firestoreUrl = 'https://firestore.googleapis.com/v1/projects/gcc-live-count/databases/(default)/documents/metrics/live_totals';
  
  request({ url: firestoreUrl, json: true }, (error, response, body) => {
    if (error) {
      return res.status(500).send('Error Fetching Data');
    }
    try {
      let responseData = {};
      let data = body;
      
      // Extract values from Firestore response
      const totalPeakViewers = parseInt(data.fields.totalPeakViewers.integerValue);
      const totalLiveViewers = parseInt(data.fields.totalLiveViewers.integerValue);
      const updatedAtTimestamp = data.fields.updatedAt.timestampValue;
      const updatedAtPeakTimestamp = data.fields.updatedAt_peak.timestampValue;
      
      // Convert all times to local time
      const currentTime = new Date();
      const updatedAtTime = new Date(updatedAtTimestamp);
      const updatedAtPeakTime = new Date(updatedAtPeakTimestamp);
      
      // Assign values to responseData
      responseData.fetchedTime = currentTime.toLocaleString();
      responseData.updatedAt = updatedAtTime.toLocaleString();
      responseData.updatedAt_peak = updatedAtPeakTime.toLocaleString();
      responseData.totalPeakViewers = totalPeakViewers;
      responseData.totalLiveViewers = totalLiveViewers;
      
      // Milestones
      responseData['125Kreached'] = totalPeakViewers >= 125000 ? 1 : 0;
      responseData['150Kreached'] = totalPeakViewers >= 150000 ? 1 : 0;
      responseData['200Kreached'] = totalPeakViewers >= 200000 ? 1 : 0;
      
      res.send(responseData);
      
    } catch (err) {
      return res.status(500).send('Error Processing Data');
    }
  });
});

app.get("/playercam", async (req, res) => {
  try {
    const battleData = `http://esportsdata-sg.mobilelegends.com/battledata?authkey=6d1fdc8b564a7ca26de867bd9d717fd4&battleid=${id}&dataid=1`;

    const { response: apiResponse, body } = await makeRequest(battleData);

    if (apiResponse.statusCode !== 200) {
      return res.status(500).json({ error: "API request failed", statusCode: apiResponse.statusCode });
    }

    if (!body || !body.data || !body.data.camp_list) {
      return res.status(500).json({ error: "Invalid API response structure" });
    }

    const campList = body.data.camp_list;

    if (!Array.isArray(campList) || campList.length < 2) {
      return res.status(500).json({ error: "Invalid camp list" });
    }

    // Get player lists and sort each team by role: exp → jg → mid → roam → gold
    const team1 = Array.isArray(campList[0]?.player_list) ? [...campList[0].player_list] : [];
    const team2 = Array.isArray(campList[1]?.player_list) ? [...campList[1].player_list] : [];

    role_sorter(team1, playerList);
    role_sorter(team2, playerList);

    const responseData = {};
    const itemPath = "C://data/pcam/item/";
    const allPlayers = [...team1.slice(0, 5), ...team2.slice(0, 5)];

    for (let i = 0; i < allPlayers.length; i++) {
      const n = i + 1;
      const player = allPlayers[i];

      try {
        if (!player) {
          responseData[`playername${n}`] = "";
          responseData[`role${n}`] = "";
          responseData[`rolePng${n}`] = "C://data/pcam/role/.png";
          responseData[`kda${n}`] = "0 / 0 / 0";
          responseData[`gold${n}`] = "0";
          for (let j = 1; j <= 6; j++) responseData[`item${n}_${j}`] = `${itemPath}0.png`;
          responseData[`ultReady${n}`] = "C://data/pcam/ult/0.png";
          responseData[`hero${n}`] = "C://data/pcam/0.png";
          responseData[`level${n}`] = 0;
          continue;
        }

        // Player name
        try {
          responseData[`playername${n}`] = name_finder(player.roleid, playerList) || player.name || "";
        } catch (e) {
          responseData[`playername${n}`] = "";
        }

        // Role
        try {
          const roleVal = role_finder(player.roleid, playerList) || player.c_role || "";
          responseData[`role${n}`] = roleVal;
          responseData[`rolePng${n}`] = `C://data/pcam/role/${roleVal}.png`;
        } catch (e) {
          responseData[`role${n}`] = "";
          responseData[`rolePng${n}`] = "C://data/pcam/role/.png";
        }

        // KDA
        try {
          const k = player.kill_num ?? 0;
          const d = player.dead_num ?? 0;
          const a = player.assist_num ?? 0;
          responseData[`kda${n}`] = `${k} / ${d} / ${a}`;
        } catch (e) {
          responseData[`kda${n}`] = "0 / 0 / 0";
        }

        // Gold in 12,345 format
        try {
          const gold = player.gold ?? 0;
          responseData[`gold${n}`] = gold.toLocaleString("en-US");
        } catch (e) {
          responseData[`gold${n}`] = "0";
        }

        // Items 1-6
        try {
          for (let j = 0; j < 6; j++) {
            responseData[`item${n}_${j + 1}`] =
              player.equip_list && player.equip_list[j]
                ? `${itemPath}${player.equip_list[j]}.png`
                : `${itemPath}0.png`;
          }
        } catch (e) {
          for (let j = 1; j <= 6; j++) responseData[`item${n}_${j}`] = `${itemPath}0.png`;
        }

        // Ult ready only after level 4 unlock, and major_left_time === 0
        try {
          const playerLevel = Number(player.level ?? 0);
          const ultReady = playerLevel >= 4 && (player.major_left_time ?? 1) === 0;
          responseData[`ultReady${n}`] = ultReady ? "C://data/pcam/ult/1.png" : "C://data/pcam/ult/0.png";
        } catch (e) {
          responseData[`ultReady${n}`] = "C://data/pcam/ult/0.png";
        }

        // Pick hero image
        try {
          responseData[`hero${n}`] = player.heroid ? `C://data/pcam/${player.heroid}.png` : "C://data/pcam/0.png";
        } catch (e) {
          responseData[`hero${n}`] = "C://data/pcam/0.png";
        }

        // Level
        try {
          responseData[`level${n}`] = player.level ?? 0;
        } catch (e) {
          responseData[`level${n}`] = 0;
        }

      } catch (playerError) {
        console.error(`Error processing player ${n} in /playercam:`, playerError);
        responseData[`playername${n}`] = "";
        responseData[`role${n}`] = "";
        responseData[`rolePng${n}`] = "C://data/pcam/role/.png";
        responseData[`kda${n}`] = "0 / 0 / 0";
        responseData[`gold${n}`] = "0";
        for (let j = 1; j <= 6; j++) responseData[`item${n}_${j}`] = `${itemPath}0.png`;
        responseData[`ultReady${n}`] = "C://data/pcam/ult/0.png";
        responseData[`hero${n}`] = "C://data/pcam/0.png";
        responseData[`level${n}`] = 0;
      }
    }

    res.json({ data: [responseData] });

  } catch (criticalError) {
    console.error("Critical error in /playercam route:", criticalError);
    res.status(500).json({
      error: "Internal server error",
      message: criticalError.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(3000, () => {
  console.log("Server Running on localhost:3000");
});
