const dns = require('dns');
var Discord = require("discord.js");
var bot = new Discord.Client();

var exec = require('child_process').exec;
var schedule = require('node-schedule');

// Global vars
const config = require('./config');
const mapRole = config.availableRoles;

var kochitanId = "";
const ownerId = "220729183679152138"; // nin9swells
const itgServerId = "211451032847384576";
const botPlaygroundServerId = "317217154350972928";
var roleMap = new Map()
roleMap.set("shadowverse", "242640431274262528");
roleMap.set("ojey", "268651296721076224");
roleMap.set("asmr", "317378195894697987");

var availableRoles = [];
for (var key of roleMap.keys()) {
  availableRoles.push(key);
}

var rootDir = "/opt/discord-bot/kochi-tan/"
var imgDir = rootDir + "data/img/"

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(rootDir + "data/db/sokuhost");

var globalmt = process.env.MT_MODE;
var voicemt = false;

var sokumemejpg =
    ["ikuj2a",
    "youmuj5a",
    "yukari6a",
    "suika66c"];
var sokumemepng =
    ["okuu3a",
    "alice5a",
    "cirno5c",
    "reisenj6a",
    "hijabreisen",
    "sakuya2b",
    "sakudonge",
    "sanaej5a",
    "youmucrab",
    "youmu2",
    "yukari3a",
    "kanakoram",
    "komachij2a",
    "okuu4a",
    "remif5a",
    "reisen2c",
    "sanae623",
    "suikaj5a",
    "suwakoj8a",
    "yukarij6a",
    "yuyukoj2a",
    "yuyukoj6a"];

var commonmemejpg = ["lewdkappa", "lolifuckyou"];
var commonmemepng = [];

var combinedmemejpg = commonmemejpg.concat(sokumemejpg);
var combinedmemepng = commonmemepng.concat(sokumemepng);

function reverse(s){
    return s.split("").reverse().join("");
}

function isContain(msg, str) {
  if (msg.indexOf(str) > -1) {
    return true;
  }
  return false;
}

function probablyIsGreeting(msg) {
  if (!isContain(msg, "bot")
  && !isContain(msg, "ntar")
  && !isContain(msg, "nanti")
  && !isContain(msg, "bsok")
  && !isContain(msg, "besok")
  && !isContain(msg, "tomorrow")
  && !isContain(msg, "yesterday")
  && !isContain(msg, "fate")
  && !isContain(msg, "ask")
  && !isContain(msg, "definite")) {
    return true;
  }
  return false;
}

function dingdong(str) {
  var result = str.replace(/i/g, "1").replace(/o/g, "2").replace(/I/g, "3").replace(/O/g, "4");
  result = result.replace(/1/g, "o").replace(/2/g, "i").replace(/3/g, "O").replace(/4/g, "I");
  result = result + "!";

  return result;
}

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// Returns random number
function dice(num) {
  if (!num) {
    num = 6;
  }
  var randomNum = getRandomInt(1, num + 1);
  return ":1234: Dice: " + randomNum.toString();
}

function validateIpAndPort(input) {
    var parts = input.split(":");
    var ip = parts[0].split(".");
    var port = parts[1];
    return validateNum(port, 1, 65535) && ip.length == 4 && ip.every(function (segment) {
        return validateNum(segment, 0, 255);
    });
}

function validateNum(input, min, max) {
    var num = +input;
    return num >= min && num <= max && input === num.toString();
}

function sokumemehelp() {
  var listsokumemes = "";
  for (i=0; i < sokumemejpg.length; i++)
    listsokumemes = listsokumemes + "\n- " + sokumemejpg[i];

  for (i=0; i < sokumemepng.length; i++)
    listsokumemes = listsokumemes + "\n- " + sokumemepng[i];


  return "**Soku Memes**"
    + "\n```" + listsokumemes + "```"
    + "\nHow to use, example: `*sanaej5a`";
}

function help(cmd) {
  if (cmd === "help") {

    return "**List of Commands**\n"
      + "\nfun: `*ding`, `*dong`, `*dice`, `*om`"
      + "\nemote: `*lewdkappa`, `*playfifa`, `*ppap`, `*throwsalt`, `*lolifuckyou`"
      + "\nhosting: `*host`, `*unhost`, `*hosting`, `*ehost`"
      + "\nsearch: `*ud`"
      + "\nutility: `*join`, `*leave`"
      + "\n"
      + "\nuse `*help [command]` to show manuals"
      + "\n\n**Soku Memes**"
      + "\n Use `*help sokumeme` to show list of soku memes";
  }
  else if (cmd === "sokumeme") {
    return sokumemehelp();
  }
  else if (cmd === "ding" || cmd === "dong") {
    return "**ding dong command**\n\n"
      + "Use `*ding` and kochi-tan will reply `dong!`, otherwise `ding!`\n"
      + "You can also type `*dingdong` or `*dongdongdingding` or `*DINGDONGDONGDING`\n"
      + "Have fun!";
  }
  else if (cmd === "dice") {
    return "**dice command**\n\n"
      + "Roll a dice.\n"
      + "You can also specified number of face,\n"
      + "for example: `*dice 16`";
  }
  else if (cmd === "om") {
    return "**OM TELOLET OM command**\n\n"
      + "You can also use `*Om` and `*OM`\n";
  }
  else if (cmd === "join") {
    var msgAvailableRoles = "";
    for (i=0; i<availableRoles.length; i++) {
      msgAvailableRoles += "- " +availableRoles[i] + "\n";
    }

    return "**join command**\n\n"
      + "Command to join a Discord role.\n"
      + "example:\n"
      + "```\n*join shadowverse```\n"
      + "List of available roles:\n```"
      + msgAvailableRoles
      + "```";
  }
  else if (cmd === "leave") {
    var msgAvailableRoles = "";
    for (i=0; i<availableRoles.length; i++) {
      msgAvailableRoles += "- " +availableRoles[i] + "\n";
    }

    return "**leave command**\n\n"
      + "Command to leave a Discord role.\n"
      + "example:\n"
      + "```\n*leave shadowverse```\n"
      + "List of available roles:\n```"
      + msgAvailableRoles
      + "```";
  }

  else if (cmd === "host") {
    return "**host command**\n\n"
            + "*host __ip__[:port] [comment]\n\n"
            + "example:\n"
            + "```\n"
            + "*host 202.175.23.168\n"
            + "*host 202.175.23.168:14949 roku\n"
            + "```\n"
            + "Use `*unhost` to stop hosting.";
  }
  else if (cmd === "ehost") {
    return "**EZ Earth VPN host command**\n\n"
            + "*ehost __servername__ __port__ [comment]\n\n"
            + "example:\n"
            + "```\n"
            + "*ehost jurong 10010\n"
            + "*ehost digital 10150 roku\n"
            + "```\n"
            + "Use `*unhost` to stop hosting.";
  }
  else if (cmd === "unhost") {
    return "**unhost command**\n\n"
      + "Use `*unhost` to stop hosting.\n"
      + "You host will be automatically expired after 3 hours.";
  }
  else if (cmd === "hosting") {
    return "**hosting command**\n\n"
      + "To list all available hosts.";
  }
  else if (cmd === "emoji") {
    return "meh~";
  }
  else {
    return help("help");
  }
}

function printHostList(channel) {
  db.all("SELECT * FROM hosts ORDER BY host_start_time", function(err, rows) {
    var listHostMsg = "";
    var hostNum = 0;
    var hostStartTime = "";
    var nowTime = new Date();

    for (var i = 0, len = rows.length; i < len; i++) {
      hostNum = hostNum + 1;
      hostStartTime = new Date(Date.parse(rows[i].host_start_time));
      hostDateDiff = new Date(nowTime - hostStartTime);
      hostDateDiffReadable = hostDateDiff.getUTCHours() + " hours " + hostDateDiff.getUTCMinutes() + " minutes";

      // console.log(hostNum);
      listHostMsg = listHostMsg + "* " + rows[i].host_owner
                    + "\n> is hosting at " + rows[i].host_ip + " " + rows[i].host_note
                    + "\n> " + hostDateDiffReadable + " ago\n\n";
    }

    if (hostNum == 0) {
      channel.send("There are no open hosts. Host one!");
    }
    else {
      channel.send(":video_game: **List of Hosts** :video_game:\n"
        + "```markdown\n"
        + listHostMsg
        + "```"
      );
    }
  });
}

function updateHostList(msg) {
  db.all("SELECT * FROM hosts ORDER BY host_start_time", function(err, rows) {
    var listHostMsg = "";
    var hostNum = 0;
    var hostStartTime = "";
    var nowTime = new Date();

    for (var i = 0, len = rows.length; i < len; i++) {
      hostNum = hostNum + 1;
      hostStartTime = new Date(Date.parse(rows[i].host_start_time));
      hostDateDiff = new Date(nowTime - hostStartTime);
      hostDateDiffReadable = hostDateDiff.getUTCHours() + " hours " + hostDateDiff.getUTCMinutes() + " minutes";

      // console.log(hostNum);
      listHostMsg = listHostMsg + "* " + rows[i].host_owner
                    + "\n> is hosting at " + rows[i].host_ip + " " + rows[i].host_note
                    + "\n> " + hostDateDiffReadable + " ago\n\n";
    }

    if (hostNum == 0) {
      msg.edit("There are no open hosts. Host one!");
    }
    else {
      msg.edit(":video_game: **List of Hosts** :video_game:\n"
        + "```markdown\n"
        + listHostMsg
        + "```"
      );
    }
  });
}

function restartKochiFm() {
  restarting = exec('sudo pm2 restart musicbot', // command line argument directly in string
  function (error, stdout, stderr) {
    console.log('Kochifm restarting stdout: ' + stdout);
    console.log('Kochifm restarting stderr: ' + stderr);
    if (error !== null) {
      console.log('Kochifm restarting exec error: ' + error);
    }
  }); // end of exec function
}

function restartWakowako() {
  restarting = exec('sudo pm2 restart wakowako', // command line argument directly in string
  function (error, stdout, stderr) {
    console.log('Wakowako restarting stdout: ' + stdout);
    console.log('Wakowako restarting stderr: ' + stderr);
    if (error !== null) {
      console.log('Wakowako restarting exec error: ' + error);
    }
  }); // end of exec function
}

function stopWakowako() {
  restarting = exec('sudo pm2 stop wakowako', // command line argument directly in string
  function (error, stdout, stderr) {
    console.log('Wakowako stopping stdout: ' + stdout);
    console.log('Wakowako stopping stderr: ' + stderr);
    if (error !== null) {
      console.log('Wakowako stopping exec error: ' + error);
    }
  }); // end of exec function
}

function fullparam(param) {
  return param.slice(0).join(" ");
}
function fullparam(param, startParam) {
  return param.slice(startParam - 1).join(" ");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

bot.on("messageDelete", msg => {
  console.log("[" + (new Date()).toISOString() + "] [Delete] content:[" + msg.content + "] author:[" + msg.author.username + "]");
});

bot.on("message", msg => {
  // console.log(msg.author.username);

  if (globalmt == "true") {
    if (msg.guild.id != botPlaygroundServerId) {
      return;
    }
  }
  else {
    if (msg.guild.id == botPlaygroundServerId) {
      return;
    }
  } 


  // * commands
  if (msg.content.startsWith("*") && msg.content.replace(/\*/g, "").length == msg.content.length - 1) {
    var fullcmd = msg.content.replace("*", "").trim();
    var cmd = fullcmd.replace(/\s.*/g, "");
    var lcmd = cmd.toLowerCase();
    var params = fullcmd.replace(/^\S*/g, "").replace(" ", "").replace(/\s+/g, " ").split(" ");
    //console.log(cmd + "---" + params);
    //console.log(params[0]);

    // Admin command // admin command
    if (msg.author.id.toString() === ownerId) {
      if (lcmd === "voicemt") {
        voicemt = !voicemt; 
      }
      else if (lcmd === "restartkochifm") {
        restartKochiFm();
      }
      else if (lcmd === "restartwakowako") {
        restartWakowako();
      }
      else if (lcmd === "stopwakowako") {
        stopWakowako();
      }
      else if (lcmd === "updateavatar") {
        if (msg.attachments.first()) {
          msg.channel.send("Ok goshujin-sama, processing...");
          var newAvaUrl = msg.attachments.first().url
          bot.user.setAvatar(newAvaUrl)
            .then(user => msg.channel.send("New avatar setto!"))
            .catch(console.error);
        }
        else {
          msg.channel.send("Please provide a picture on attachment");
        }
      }
      else if (lcmd === "updatestatus") {
        if (params) {
          console.log(params);
          console.log(fullparam(params));
          var game = fullparam(params);
          bot.user.setGame(game)
            .then(user => msg.channel.send("I'm playing " + game))
            .catch(console.error);
        }
      }
      else if (lcmd === "getrole") {
        res = msg.guild.roles.find("name", params[0]);
        msg.channel.send(res.id);
      }
    }

    // Help command
    if (lcmd === "help") {
      if (params) {
        msg.channel.send(help(params[0]));
      }
      else {
        msg.channel.send(help());
      }
    }
    // DINGDONG command
    if (fullcmd.toLowerCase().startsWith("ding") || fullcmd.toLowerCase().startsWith("dong")) {
      var tmpDingDong = fullcmd.toLowerCase().replace(/ding/g, "").replace(/dong/g, "").trim();

      if (tmpDingDong.length > 0) return;
      msg.channel.send(dingdong(fullcmd));
    }
    // dice command
    if (lcmd === "dice") {
      if (params.length > 0) {
        msg.channel.send(dice(params[0]));
      }
      else {
        msg.channel.send(dice());
      }
    }
    
    if (lcmd === "ud") {
      if (params) {
        var urban = require('urban'),
        udsearch = urban(params[0]);

        udsearch.first(function(udresult) {
          console.log(udresult.definition);
          msg.channel.send(
                  // ":regional_indicator_u:rban :regional_indicator_d:ictionary\n" +
                  "**Urban Dictionary**\n" + 
                  "```markdown\n" +
                  "* " + params[0] + "\n" +
                  udresult.definition +
                  "```");
        });
      }
    }
    // Om Telolet Om command
    if (lcmd === "om") {
      if (cmd === "OM")
      {
        msg.channel.send("TELOLET OM!");
      }
      else if (cmd === "Om")
      {
        msg.channel.send("Telolet Om");
      }
      else if (cmd === "om")
      {
        msg.channel.send("telolet om");
      }
    }

    if (lcmd === "go")
    {
      msg.channel.send("chicken gooOooOooOoo~");
    }

    if (lcmd === "join") {
      if (msg.guild.id != itgServerId) {
        msg.channel.send("this command only available in ITG discord server");
      }
      else if (params.length && params[0] === "") {
        msg.channel.send(help(lcmd));
      }
      else if (params.length) {
        if (params[0]) {
          var roleToJoin = params[0].toLowerCase();
          if (!availableRoles.includes(roleToJoin)) {
            msg.channel.send("Role is not available to join");
            msg.channel.send(help(lcmd));
          }
          else {
            var roleToJoinId = roleMap.get(roleToJoin);

            if (msg.member.roles.has(roleToJoinId)) {
              msg.reply("You are already member of " + roleToJoin);
            }
            else
            {
              msg.member.addRole(roleToJoinId);
              msg.reply("You're added to " + roleToJoin);
              console.log("[role]" + msg.author.username + "@" + msg.author.id + " added to " + roleToJoin);
            }
          }
        }
        else {
          console.log("something wrong happen on join command, can't read param");
        }
      }
    }
    else if (lcmd === "leave") {
      if (msg.guild.id != itgServerId) {
        msg.channel.send("this command only available in ITG discord server");
      }
      else if (params.length && params[0] === "") {
        msg.channel.send(help(lcmd));
      }
      else if (params.length) {
        if (params[0]) {
          var roleToLeave = params[0].toLowerCase();
          if (!availableRoles.includes(roleToLeave)) {
            msg.channel.send(help(lcmd));
          }
          else {
            var roleToLeaveId = roleMap.get(roleToLeave);

            if (!msg.member.roles.has(roleToLeaveId)) {
              msg.reply("You are not member of " + roleToLeave);
            }
            else {
              msg.member.removeRole(roleToLeaveId);
              msg.reply("You're removed from " + roleToLeave);
              console.log("[role]" + msg.author.username + "@" + msg.author.id + " removed from " + roleToJoin);
            }
          }
        }
        else {
          console.log("something wrong happen on leave command, can't read param");
        }
      }
    }

    // Soku host command
    // host command
    if (lcmd === "host") {
      var hostOwner = msg.author.username;
      var hostIp = "";
      var hostStartTime = (new Date()).toISOString();
      var hostNote = "";

      // If hostIp is empty, show manuals
      if (params.length && params[0] === "") {
        msg.channel.send(help(lcmd));
      }
      // If hostIp is defined
      else if (params.length) {
        if (params[0]) {
          hostIp = params[0];

          // If port is not defined, set port to default 10800
          if (!(hostIp.indexOf(":") > -1)) {
            hostIp = hostIp + ":10800";
          }
        }
        // check if ips and port is valid
        // if (!hostIp.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})/))
        if (!validateIpAndPort(hostIp))
        {
          msg.channel.send("Don't try to fool me Kochi-tan! Please input a valid ip address and port.");
          return;
        }
        if (params[1]) {
          hostNote = params.slice(1).join(" ");
        }

        db.run("DELETE FROM hosts WHERE host_owner = ?", hostOwner);
        db.run("INSERT INTO hosts VALUES (?, ?, ?, ?)", hostOwner, hostIp, hostStartTime, hostNote);

        msg.channel.send(":video_game: :arrow_up_small: " + hostOwner + " is hosting at " + hostIp + " " + hostNote);
      }
    }

    // ehost command
    if (lcmd === "ehost") {

      // If hostIp is empty, show manuals
      if (!(params && params[0] && params[1])) {
        msg.channel.send(help(cmd));
      }
      // If hostName is defined
      else if (params.length) {
        if (params[0]) {
          var hostOwner = msg.author.username;
          var hostStartTime = (new Date()).toISOString();
          var hostName = params[0];
          var hostIp = "";
          var hostNote = "";

          var dnsResolvedTime = ""; // initialize

          db.get("SELECT earthvpn_server_address FROM earthvpn_server WHERE earthvpn_server_name ='" + hostName +"'", function(err, row) {
            if (row) {
              console.log("[" + (new Date()).toISOString() + "] [Command:ehost] GET earthvpn_server_address: " + row.earthvpn_server_address);
              dns.resolve4(row.earthvpn_server_address, function(dnserr, earthvpn_ip) {
                if (dnserr) console.log("[" + (new Date()).toISOString() + "] [Error] Failed to resolve DNS: " + row.earthvpn_server_address);
                if (earthvpn_ip) {
                  hostIp = earthvpn_ip[0];
                  dnsResolvedTime = (new Date()).toISOString();
                }
              });
            }
          });

          // wait until DNS resolve is finished
          setTimeout(function() {
            if (hostIp === "") {
              msg.channel.send("Server not found.");

              setTimeout(function() {
                if (dnsResolvedTime === "")
                  console.log("[" + (new Date()).toISOString() + "] [Error] Server not found weirdly");
                else
                console.log("[" + (new Date()).toISOString() + "] [Error] Server not found on time: command issued on: " +
                            hostStartTime + " and resolved on: " + dnsResolvedTime);
              }, 5000);
              return;
            }
            // add port to ip
            if (params[1]) {
              hostIp = hostIp + ":" + params[1];
              if (!validateIpAndPort(hostIp))
              {
                msg.channel.send("Don't try to fool Kochi-tan! Please input a valid port number.");
                return;
              }
            } else {
              msg.channel.send(help(cmd));
            }

            // get ehost note
            if (params[2]) {
              hostNote = params.slice(2).join(" ");
            }

            db.run("DELETE FROM hosts WHERE host_owner = ?", hostOwner);
            db.run("INSERT INTO hosts VALUES (?, ?, ?, ?)", hostOwner, hostIp, hostStartTime, hostNote);
    
            msg.channel.send(":video_game: :arrow_up_small: " + hostOwner + " is hosting at " + hostIp + " " + hostNote);
          }, 500);
        }
      } // endif hostName is defined
    } // endif ehost

    // unhost command
    if (lcmd === "unhost") {
      var hostOwner = msg.author.username;

      db.get("SELECT * FROM hosts WHERE host_owner='" + hostOwner +"'", function(err, row) {
        if (row) {
          msg.channel.send(":video_game: :small_red_triangle_down: " + hostOwner + " (" + row.host_ip + ") stopped hosting.");
        }
      });

      db.run("DELETE FROM hosts WHERE host_owner = ?", hostOwner);
    }
    // hosting command, to list all active hosts
    if (lcmd === "hosting") {
      db.run("DELETE FROM hosts WHERE (julianday('now') - julianday(host_start_time)) * 24 > 3");

      // setTimeout to wait delete process finished
      printHostList(msg.channel);
    }


    // Emoticon
    // lewdkappa
    if (combinedmemejpg.includes(lcmd) ) {
      msg.channel.sendFile(imgDir + lcmd + ".jpg", lcmd + ".jpg");
    }
    if (combinedmemepng.includes(lcmd)) {
      msg.channel.sendFile(imgDir + lcmd + ".png", lcmd + ".png");
    }
    else if (lcmd === "playfifa") {
      msg.channel.send("https://cdn.discordapp.com/emojis/238916013679181824.png");
    }
    else if (lcmd === "throwsalt") {
      var randomsalt = getRandomInt(1, 5);
      msg.channel.sendFile(imgDir + "salt" + randomsalt + ".jpg", "throwsalt.jpg");
    }
    else if (lcmd === "ppap") {
      msg.channel.send(":pen_ballpoint: :pineapple: :apple: :pen_ballpoint:");
    }
  }

  // Kochi-tan's mention
  else if (msg.content.startsWith("<@" + kochitanId + ">")) {

    // If only kochi-tan, introduce her self
    if (msg.content.trim().endsWith("<@" + kochitanId + ">")) {
      msg.reply("Konichiwa~ kochi-tan desu! type `@kochi-tan help` for help");
    }

    var params = msg.content.trim().replace("<@" + kochitanId + ">", "").trim();

    // Help commands
    if (params.startsWith("help")) {
      msg.channel.send(help("help"));
    }

    // I love you commands
    if (isContain(msg.content.toLowerCase(), "i love you")) {
      var postmsg = "";
      if (msg.author.id.toString() === ownerId) {
          postmsg = " love you too <3"
      }
      msg.channel.sendFile(imgDir + "subaruthx.png", "arigatou.png", "arigatou~" + postmsg);
    }

    // check in database
    var chatMappingId = 0;
    console.log(params.toLowerCase());
    db.all("SELECT chat_mapping_id FROM chat_questions where question_content like '%" + params.toLowerCase() + "%'", function(err, rows) {
      if (rows.length > 0) {
        chatMappingId = rows[0].chat_mapping_id;
      }
    });

    setTimeout(function() {
      if (chatMappingId > 0) {
        db.all("SELECT answer_content FROM chat_answers where chat_mapping_id = " + chatMappingId, function(err, rows) {
          var num_of_answers = rows.length;
  
          if (num_of_answers > 0) {
            var choosen_ans = getRandomInt(0, num_of_answers);
            msg.channel.send(rows[choosen_ans].answer_content);
          }
          else {
            msg.channel.send("Somehow, I don't know to answer that question. Gomen ne");
          }
  
        });
      }   
    }, 100); //set timeout

  }
  // Not command, nor mention
  else if (!(msg.author.username === "kochi-tan")) {
    var _msg = msg.content.toLowerCase();

    if (isContain(_msg, "any")
    && (
        isContain(_msg, "soku")
        || isContain(_msg, "roku")
      )
    )
    {
      db.get("SELECT 1 FROM noticedPlayer where username = ?", msg.author.username, function(err, row) {
        if (!row) {
          msg.reply("anyway, you can use `*host` command to host or use `*hosting` to list available hosts. Have a good day!")
        }
      });
      db.run("INSERT OR IGNORE INTO noticedPlayer VALUES (?, ?)", msg.author.username, (new Date()).toISOString());
    }

    // Morning greeting
    if (isContain(_msg, "marunin")
        || isContain(_msg, "mornin")
        || isContain(_msg, "moning")
        || isContain(_msg, "pagi")
        || isContain(_msg, "guten tag")
      )
    {
      if (probablyIsGreeting(_msg))
      {
        db.get("SELECT id FROM greetingstatus", function(err, row) {
          if (row && row.id == 1) {
            msg.channel.send("Morninggu~ <3");
          }
        });
        db.run("UPDATE greetingstatus SET id=0");
      }
    }
    // Night greeting
    else if (isContain(_msg, "nite")
        || isContain(_msg, "naito")
        || isContain(_msg, "night")
        || isContain(_msg, "malam")
        || isContain(_msg, "bye hooman")
        || isContain(_msg, "bye human")
      )
    {
      if (probablyIsGreeting(_msg))
      {
        db.get("SELECT id FROM greetingstatus", function(err, row) {
          if (row && row.id == 0) {
            msg.channel.send("Naito~ <3");
          }
        });
        db.run("UPDATE greetingstatus SET id=1");
      }
    }

  }
});


var cron_hosting = require('node-schedule');
var hostListChannel;
var hostListMessage;
var j = cron_hosting.scheduleJob('*/' + config.hostlist.interval + ' * * * * *', async function(){
  // console.log('The answer to life, the universe, and everything!');
  // printHostList(hostListChannel);

  hostListChannel = bot.channels.get(config.roleToggleChannelId);
  hostListChannel.fetchMessages().then(msgs => {
    // console.log(msgs);
    console.log(msgs.array().length);
    if (msgs.array().length) {
      console.log("sip " + msgs.array().length);
      updateHostList(msgs.array()[0]);
    }
    else {
      console.log("eh " + msgs.array().length);
      printHostList(hostListChannel);
    }
  });
  // if (hostListMessage) {
  //   updateHostList(hostListMessage);
  // }
  // else {
  //   printHostList(hostListChannel);
  // }
});

bot.on('raw', async (event) => {
  if (event.t === "MESSAGE_REACTION_ADD" || event.t === "MESSAGE_REACTION_REMOVE") {
    packet = event.d;
    user = bot.users.get(packet.user_id);
    channel = bot.channels.get(packet.channel_id);

    message = await channel.fetchMessage(packet.message_id);
    if (typeof reaction === "undefined") return;

    reaction = message.reactions.get(packet.emoji.name);

    if (event.t === "MESSAGE_REACTION_ADD") {
      bot.emit('messageReactionAdd', reaction, user);
    }
    else if (event.t === "MESSAGE_REACTION_REMOVE") {
      bot.emit('messageReactionRemove', reaction, user);
    }

  }
});

function isToggleAction(msgReaction, user) {
  if (!(user.id === kochitanId))
  if (msgReaction.message.channel.id === config.roleToggleChannelId)
  return true;

  return false;
};

bot.on('messageReactionAdd', (msgReaction, user) => {
  if (isToggleAction(msgReaction, user)) {
    if (msgReaction.emoji.name === "✅") {
      Object.keys(mapRole).forEach(key => {
        if (msgReaction.message.id === mapRole[key].toggleMsgId) {
          msgReaction.message.guild.member(user).addRole(mapRole[key].roleId);
        }
      });
    }
    else {
      msgReaction.remove(user);
    }
  }
});

bot.on('messageReactionRemove', (msgReaction, user) => {
  if (!(user.id === kochitanId)) {
    Object.keys(mapRole).forEach(key => {
      if (msgReaction.message.id === mapRole[key].toggleMsgId) {
        msgReaction.message.guild.member(user).removeRole(mapRole[key].roleId);
      }
    });
  }
});

process.on('unhandledRejection', error => {
	console.error(`Uncaught Promise Rejection: \n${error.stack}`);
});

bot.on('ready', () => {
  console.log('Ready to serve you, goshuujin-sama!');

  kochitanId = bot.user.id;
  console.log("Logged in as " + bot.user.username + " (" + bot.user.id + ")");
  Object.keys(mapRole).forEach(key => {
    bot.channels.get(config.roleToggleChannelId).fetchMessage(mapRole[key].toggleMsgId)
      .then(message => message.react("✅"))
  });

  hostListChannel = bot.channels.get(config.roleToggleChannelId);
  hostListChannel.fetchMessages().then(msgs =>
    msgs.forEach(msg => {
      msg.delete();
    })
  );

});

bot.login(process.env.DISCORD_TOKEN);
