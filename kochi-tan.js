const dns = require('dns');
var Discord = require("discord.js");
var bot = new Discord.Client();

// Global vars
var kochitanId = "243350722672852992";
var rootDir = "/opt/discord-bot/kochi-tan/"
var imgDir = rootDir + "data/img/"


var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(rootDir + "data/db/sokuhost");

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
  && !isContain(msg, "fate")) {
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

function help(cmd) {
  if (cmd === "help") {
    var sokumemes = [
          "alice5a",
          "iku2a",
          "okuu3a",
          "hijabreisen",
          "reisenj6a",
          "sakudonge",
          "sanaej5a",
          "youmucrab",
          "youmu2",
          "yukari3a",
          "yukari6a"
        ];
    var listsokumemes = "";
    for (i=0; i < sokumemes.length; i++)
      listsokumemes = listsokumemes + "\n- " + sokumemes[i];
    return "**List of Commands**\n"
      + "\nfun: `*ding`, `*dong`, `*dice`, `*om`"
      + "\nemote: `*lewdkappa`, `*playfifa`, `*ppap`, `*throwsalt`"
      + "\nhosting: `*host`, `*unhost`, `*hosting`, `*ehost`"
      + "\n"
      + "\nuse `*help [command]` to show manuals"
+ "\n\n**Soku Memes**"
+ "\n```" + listsokumemes + "```"
+ "\nHow to use, example: `*sanaej5a`";
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

bot.on("message", msg => {
  // console.log(msg.author.username);

  // * commands
  if (msg.content.startsWith("*") && msg.content.replace(/\*/g, "").length == msg.content.length - 1) {
    var fullcmd = msg.content.replace("*", "").trim();
    var cmd = fullcmd.replace(/\s.*/g, "");
    var params = fullcmd.replace(/^\S*/g, "").replace(" ", "").replace(/\s+/g, " ").split(" ");
    //console.log(cmd + "---" + params);
    //console.log(params[0]);

    // Help command
    if (cmd.toLowerCase() === "help") {
      if (params) {
        msg.channel.sendMessage(help(params[0]));
      }
      else {
        msg.channel.sendMessage(help());
      }
    }

    // DINGDONG command
    if (fullcmd.toLowerCase().startsWith("ding") || fullcmd.toLowerCase().startsWith("dong")) {
      var tmpDingDong = fullcmd.toLowerCase().replace(/ding/g, "").replace(/dong/g, "").trim();

      if (tmpDingDong.length > 0) return;
      msg.channel.sendMessage(dingdong(fullcmd));
    }

    // dice command
    if (cmd.toLowerCase() === "dice") {
      if (params.length > 0) {
        msg.channel.sendMessage(dice(params[0]));
      }
      else {
        msg.channel.sendMessage(dice());
      }
    }

    // Om Telolet Om command
    if (cmd.toLowerCase() === "om") {
      if (cmd === "OM")
      {
        msg.channel.sendMessage("TELOLET OM!");
      }
      else if (cmd === "Om")
      {
        msg.channel.sendMessage("Telolet Om");
      }
      else if (cmd === "om")
      {
        msg.channel.sendMessage("telolet om");
      }
    }

    // Soku host command
    // host command
    if (cmd.toLowerCase() === "host") {
      var hostOwner = msg.author.username;
      var hostIp = "";
      var hostStartTime = (new Date()).toISOString();
      var hostNote = "";

      // If hostIp is empty, show manuals
      if (params.length && params[0] === "") {
        msg.channel.sendMessage(help(cmd));
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
          msg.channel.sendMessage("Don't try to fool me Kochi-tan! Please input a valid ip address and port.");
          return;
        }
        if (params[1]) {
          hostNote = params.slice(1).join(" ");
        }

        db.run("DELETE FROM hosts WHERE host_owner = ?", hostOwner);
        db.run("INSERT INTO hosts VALUES (?, ?, ?, ?)", hostOwner, hostIp, hostStartTime, hostNote);

        msg.channel.sendMessage(":video_game: :arrow_up_small: " + hostOwner + " is hosting at " + hostIp + " " + hostNote);
      }
    }

    // ehost command
    if (cmd.toLowerCase() === "ehost") {
      console.log("Command: ehost");

      // If hostIp is empty, show manuals
      if (!(params && params[0] && params[1])) {
        msg.channel.sendMessage(help(cmd));
      }
      // If hostName is defined
      else if (params.length) {
        if (params[0]) {
          var hostOwner = msg.author.username;
          var hostStartTime = (new Date()).toISOString();
          var hostName = params[0];
          var hostIp = "";
          var hostNote = "";

          console.log("Command: ehost, param 0 is not empty");

          db.get("SELECT earthvpn_server_address FROM earthvpn_server WHERE earthvpn_server_name ='" + hostName +"'", function(err, row) {
            if (row) {
              console.log("Command: ehost, GET earthvpn_server_address: " + row.earthvpn_server_address);
              dns.resolve4(row.earthvpn_server_address, function(err, earthvpn_ip) {
                if (err) throw err;
                if (earthvpn_ip) hostIp = earthvpn_ip[0];
              });
            }
          });

          // wait until DNS resolve is finished
          setTimeout(function() {
            if (hostIp === "") {
              msg.channel.sendMessage("Server not found.");
              return;
            }
            // add port to ip
            if (params[1]) {
              hostIp = hostIp + ":" + params[1];
              if (!validateIpAndPort(hostIp))
              {
                msg.channel.sendMessage("Don't try to fool Kochi-tan! Please input a valid port number.");
                return;
              }
            } else {
              msg.channel.sendMessage(help(cmd));
            }

            // get ehost note
            if (params[2]) {
              hostNote = params.slice(2).join(" ");
            }

            db.run("DELETE FROM hosts WHERE host_owner = ?", hostOwner);
            db.run("INSERT INTO hosts VALUES (?, ?, ?, ?)", hostOwner, hostIp, hostStartTime, hostNote);
    
            msg.channel.sendMessage(":video_game: :arrow_up_small: " + hostOwner + " is hosting at " + hostIp + " " + hostNote);
          }, 500);
        }
      } // endif hostName is defined
    } // endif ehost

    // unhost command
    if (cmd.toLowerCase() === "unhost") {
      var hostOwner = msg.author.username;

      db.get("SELECT * FROM hosts WHERE host_owner='" + hostOwner +"'", function(err, row) {
        if (row) {
          msg.channel.sendMessage(":video_game: :small_red_triangle_down: " + hostOwner + " (" + row.host_ip + ") stopped hosting.");
        }
      });

      db.run("DELETE FROM hosts WHERE host_owner = ?", hostOwner);
    }
    // hosting command, to list all active hosts
    if (cmd.toLowerCase() === "hosting") {
      db.run("DELETE FROM hosts WHERE (julianday('now') - julianday(host_start_time)) * 24 > 3");

      // setTimeout to wait delete process finished
      setTimeout(function() {
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
            msg.channel.sendMessage("There are no open hosts. Host one!");
          }
          else {
            msg.channel.sendMessage(":video_game: **List of Hosts** :video_game:\n"
              + "```markdown\n"
              + listHostMsg
              + "```"
            );
          }
        });
      }, 100);
    }


    // Emoticon
    // lewdkappa
    lcmd = cmd.toLowerCase();
    if (lcmd === "lewdkappa" ||
        lcmd === "iku2a"     ||
        lcmd === "youmuj5a"  ||
        lcmd === "yukari6a") {
      msg.channel.sendFile(imgDir + lcmd + ".jpg", lcmd + ".jpg");
    }
    if (lcmd === "okuu3a"      ||
        lcmd === "alice5a"     ||
        lcmd === "reisenj6a"   ||
        lcmd === "hijabreisen" ||
        lcmd === "sakuya2b"    ||
        lcmd === "sakudonge"   ||
        lcmd === "sanaej5a"    ||
        lcmd === "youmucrab"   ||
        lcmd === "youmu2"      ||
        lcmd === "yukari3a") {
      msg.channel.sendFile(imgDir + lcmd + ".png", lcmd + ".png");
    }
    else if (lcmd === "playfifa") {
      msg.channel.sendMessage("https://cdn.discordapp.com/emojis/238916013679181824.png");
    }
    else if (lcmd === "throwsalt") {
      var randomsalt = getRandomInt(1, 5);
      msg.channel.sendFile(imgDir + "salt" + randomsalt + ".jpg", "throwsalt.jpg");
    }
    else if (lcmd === "ppap") {
      msg.channel.sendMessage(":pen_ballpoint: :pineapple: :apple: :pen_ballpoint:");
    }
    // else if (cmd.toLowerCase() === "kappapen") {
    //   msg.channel.sendMessage(":pen_ballpoint: :pineapple: :apple: :pen_ballpoint:");
    //   msg.channel.sendMessage(":point_right: :kappa: :ok_hand:");
    // }
    // else if (cmd.toLowerCase() === "kappanaika") {
    //   var kappaemote = msg.guild.emojis.get(243374250323345408);
    //   console.log(msg.guild.emojis);
    //   console.log(kappaemote);
    //   //msg.channel.sendMessage(kappaemote.toString());
    // }
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
      msg.channel.sendMessage(help("help"));
    }

    // I love you commands
    if (isContain(msg.content.toLowerCase(), "i love you")) {
      var postmsg = "";
      if (msg.author.username.toString() === "nin9swells") {
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
            msg.channel.sendMessage(rows[choosen_ans].answer_content);
          }
          else {
            msg.channel.sendMessage("Somehow, I don't know to answer that question. Gomen ne");
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
            msg.channel.sendMessage("Morninggu~ <3");
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
            msg.channel.sendMessage("Naito~ <3");
          }
        });
        db.run("UPDATE greetingstatus SET id=1");
      }
    }

  }
});


// // create an event listener for messages
// bot.on('message', message => {
//   // if the message is "what is my avatar",
//   if (message.content === 'test avatar') {
//     // send the user's avatar URL
//     message.reply(message.author.avatarURL);
//   }
// });


bot.on('ready', () => {
  console.log('Ready to serve you, goshuujin-sama!');
});

bot.login(process.env.DISCORD_TOKEN);
