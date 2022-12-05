const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const intialDBandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("localhost:3000");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
intialDBandserver();

app.get("/players/", async (req, res) => {
  const Query = `SELECT * FROM player_details;`;
  const result = await db.all(Query);
  const finalresult = result.map((arr) => {
    return {
      playerId: arr.player_id,
      playerName: arr.player_name,
    };
  });
  res.send(finalresult);
});

app.get("/players/:playerId/", async (req, res) => {
  const playerId = req.params;
  console.log(playerId);
  const Query = `SELECT * FROM player_details WHERE player_id = ${playerId.playerId};`;
  const result = await db.get(Query);
  const finalresult = {
    playerId: result.player_id,
    playerName: result.player_name,
  };
  res.send(finalresult);
});

app.put("/players/:playerId/", async (req, res) => {
  const playerId = req.params;
  const detailsput = req.body;
  const { playerName } = detailsput;

  console.log(playerId);
  const Query = `UPDATE player_details SET player_name='${playerName}'
  WHERE player_id = ${playerId.playerId}`;

  const result = await db.run(Query);
  res.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (req, res) => {
  const matchId = req.params;

  const Query = `SELECT * FROM match_details  WHERE match_id = ${matchId.matchId};`;
  const result = await db.get(Query);
  const finalresult = {
    matchId: result.match_id,
    match: result.match,
    year: result.year,
  };
  res.send(finalresult);
});

app.get("/players/:playerId/matches", async (req, res) => {
  const playerId = req.params;
  const Query = `SELECT * FROM match_details LEFT JOIN player_match_score
    ON match_details.match_id = player_match_score.match_id
    WHERE player_id = ${playerId.playerId};`;
  const result1 = await db.all(Query);
  const finalresult = result1.map((result) => {
    return {
      matchId: result.match_id,
      match: result.match,
      year: result.year,
    };
  });
  res.send(finalresult);
});
//api7
app.get("/players/:playerId/playerScores/", async (req, res) => {
  const playerId = req.params;

  const Query = `SELECT player_match_score.player_id as playerId,player_details.player_name as playerName,sum(score) as totalScore,
  sum(fours) as totalFours,sum(sixes) as totalSixes FROM player_details LEFT JOIN player_match_score
    ON player_details.player_id = player_match_score.player_id WHERE player_match_score.player_id = ${playerId.playerId};`;

  const result = await db.get(Query);
  res.send(result);
});
//API 6
app.get("/matches/:matchId/players", async (req, res) => {
  const matchId = req.params;
  const Query = `SELECT * FROM player_details LEFT JOIN player_match_score
    ON player_details.player_id = player_match_score.player_id
    WHERE match_id = ${matchId.matchId};`;

  const result = await db.all(Query);
  const finalresult = result.map((arr) => {
    return {
      playerId: arr.player_id,
      playerName: arr.player_name,
    };
  });
  res.send(finalresult);
});

module.exports = app;
