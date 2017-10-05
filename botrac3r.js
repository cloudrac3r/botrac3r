#!/usr/local/bin/node
var botTestingMode = false;

var Discord = require("discord.io");
var spawn = require("child_process").spawn;
var fs = require("fs");
var request = require("request");
var portscanner = require("portscanner");
let path = require("path");
let Canvas = require("canvas");
let exif = require("exif");
let syncRequest = require("sync-request");
let ytdl = require("youtube-dl");
let [ botToken, ytToken ] = fs.readFileSync("token.txt", "utf8").split("\n");
let epigamCookies;
let cytubeCurrentVideo = "";
let cytubeAnnouncementChannel = "312054608535224320";
let cytubeCheck = true;
let cytubeLastPing = Date.now();
let cytubePingDelay = 600000;
try {
    if (fs.readFileSync("./cytube.txt").toString().includes("false")) {
        console.log("CyTube announcements are DISABLED!");
        cytubeCheck = false;
    }
} catch (e) {};
try {
    epigamCookies = fs.readFileSync("epigam-cookies.txt", "utf8").split("\n")[0];
} catch (e) {
    console.log("Couldn't load the Epigam cookies file. You won't be able to post to Epigam from this bot.");
}
var bot = new Discord.Client({
    token: botToken,
    autorun: true
});

const botBlacklist = ["206627682807578624", "197686571141431297"];

const botAdmins = ["176580265294954507", "117661708092309509", "238459957811478529"];
const warPeople = ["112767329347104768", "176580265294954507", "112760500130975744", "117661708092309509"];
const pinServers = ["112760669178241024", "338363692955729930"];
const channelPinList = {
    // Epicord
    "112760669178241024": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "main"
    },
    "160197704226439168": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the bot channel"
    },
    "361364140448808960": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the Hippo Clicker discussion channel"
    },
    "249968792346558465": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the art channel"
    },
    "122155380120748034": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the programming channel"
    },
    "176333891320283136": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the Wonderland channel"
    },
    "134077753485033472": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the Minecraft channel"
    },
    "189898393705906177": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the rhythm game channel"
    },
    "265617582126661642": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the music channel"
    },
    "288058913985789953": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the gaming channel"
    },
    "288882953314893825": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the Team Fortress 2 channel"
    },
    "265998010092093441": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the Marble Blast channel"
    },
    "196455508146651136": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the Toontown channel"
    },
    "132423337019310081": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the anime channel"
    },
    "266767590641238027": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the game development channel"
    },
    "121380024812044288": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the comics channel"
    },
    "130176644093575168": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the Phoenix Wright: Ace Attorney channel (← did I spell this right?)"
    },
    "134477188899536898": {
        channel: "ignore",
        name: "the Steven Universe channel"
    },
    "191487489943404544": {
        channel: "334553412698112002",
        forum: "58",
        topic: "1576",
        name: "the regular porn channel"
    },
    "359903425074561024": {
        channel: "334553412698112002",
        forum: "58",
        topic: "1576",
        name: "the dream channel"
    },
    "113414562417496064": {
        channel: "334553412698112002",
        forum: "58",
        topic: "1576",
        name: "the furry porn channel"
    },
    "312054608535224320": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the CyTube channel"
    },
    "354832988980379650": {
        channel: "331390333810376704",
        forum: "54",
        topic: "1005",
        name: "the rules channel"
    },
    // Evilgrapez's server
    "338363692955729930": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "338363692955729931": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "338369236315406346": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "338695336778268673": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "338695440876830720": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "338695597924024332": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "338695693642366977": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "338697507829710848": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "342065960393375746": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "342472805369249792": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "343140413743300617": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "343143822399897610": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "343448338298961921": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "343789503216877569": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "343790381470711832": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "343812331416977419": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "344259097182470155": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "345386852062330882": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "345777627296038923": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "346123905590624257": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "346447838370070529": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "347119389495001088": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "347473580793266178": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "347585973649014796": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "348294995654082560": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "349549541336547329": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "349552103074824192": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "349612457465085972": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "350076994450358282": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "350106549907357697": {
        "channel": "349612457465085972",
        "limit": 49
    },
    "350121558527836160": {
        "channel": "349612457465085972",
        "limit": 49
    }
};
let warPeopleOnline = false;
let lastPing = 0;
var restarted = false;
let botLoopCounter = 0;
setInterval(function() { if (botLoopCounter > 0) botLoopCounter--; }, 10000);

var wwgChannel = "";
var wwgPlayers = [];
var wwgPlayerNames = [];
var wwgPlayerInteractions = [];
var wwgPlayerInteractionsDict = [];
var wwgStartRoles = [];
var wwgNewRoles = [];
var wwgRoleConfig = [[0, 1, 1, 2, 3, 4], [0, 8, 1, 1, 2, 3, 4], [7, 8, 1, 10, 2, 3, 4, 5], [6, 6, 7, 1, 1, 2, 3, 4, 9], [6, 6, 7, 8, 1, 1, 2, 3, 4, 9], [9, 6, 6, 7, 8, 1, 1, 2, 3, 4, 5], [0, 9, 6, 6, 7, 8, 1, 1, 2, 3, 4, 5]];
// role index         0           1           2       3         4               5         6        7        8            9         10
var wwgRoleLookup = ["villager", "werewolf", "seer", "robber", "troublemaker", "tanner", "mason", "drunk", "insomniac", "minion", "dream wolf"];
var wwgWakeOrder = [1, 2, 3, 4, 7, 8];
var wwgNightHasPassed = false;
var wwgVotes = [];
var wwgVotesUsed = [];
var wwgGameStarted = false;
var wwgVoting = false;
var wwgWaitingPlayers = [];
var wwgOldPlayers = [];
var wwgOldPlayerNames = [];
var wwgTimer = 5;
let wwgWarningTimeout;
let wwgEndingTimeout;
var wwgStrict = true;
var wwgCurrentGameID = 0;
var wwgStats = {};

var voteList = [];
let userTimes = {};
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

var yesnoOptions = ["Yes.", "No.", "Yes.", "No.", "Yes, definitely!", "Yes, of course!", "Well, I guess so...", "That doesn't sound like a good idea.", "No, of course not!", "No way, are you mad?", ">///<\njust kidding, the answer is yes", ">///<\njust kidding, the answer is no", "That's completely absurd.", "Sounds good!", "Probably not.", "Without a doubt!", "Is a giraffe's neck longer than your toenails?", "Is Jutomi female?", "Ugh. Are you serious?", "Fine, if you insist."]; // Possible answers for yesno

let characters = {};

let MBqueue = [];
let MBplaying = false;
let MBsearches = [];
let MBmusic;
let MBfRegex = /https?:\/\/[^\s]{2,}(\.[^\s]{2,})+\/[^\s]+\.(mp3|ogg)/;

let otBlacklist = {};

let epigamPostHeaders = {
    "Cookie": epigamCookies,
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.55",
    "DNT": "1",
    //"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en-US"
};
let epigamUploaders = ["176580265294954507", "113340068197859328", "116718249567059974", "112814914019614720", "117661708092309509"];

function userIDToNick(userID, serverID) {
    if (serverID) { // If a server was specified...
        return (bot.servers[serverID].members[userID].nick || bot.users[userID].username); // Return the nickname if there is one, otherwise return the username
    } else {
        return bot.users[userID].username; // Return the username
    }
}

function mentionToID(string) {
    tmp = string.split(">")[0];
    return tmp.substr(tmp.length-18);
}

function pad(string, length, filler) {
    if (typeof(string) == "number") string = string.toString();
    return string+yes(filler, length-string.length);
}

function rpad(string, length, filler) {
    if (typeof(string) == "number") string = string.toString();
    return yes(filler, length-string.length)+string;
}

function reverse(string) {
    var reversed = '';
    for (var i = string.length-1; i >= 0; i--)
        reversed += string[i];
    return reversed;
}

function yes(character, count) {
    let string = "";
    for (let i = 0; i < count; i++) {
        string += character;
    }
    return string;
}

function plural(word, number) {
    var plurals = {
        is: "are", foot: "feet", person: "people", werewolf: "werewolves", wolf: "wolves"
    };
    if (number != 1) {
        if (plurals[word] != undefined) {
            word = plurals[word];
        } else {
            if (word.endsWith("s") || word.endsWith("ch")) {
                word += "es";
            } else {
                word += "s";
            }
        }
    }
    return word;
}

// Play music in the same voice channel as the command invoker
function playMusic(userID, channelID, command) {
    if (command.split(";")[1] == "stop") {
        bot.leaveVoiceChannel(bot.servers[bot.channels[channelID].guild_id].members[bot.id].voice_channel_id);
        return;
    }
    let url = (command.split(";")[1] || "https://www.youtube.com/watch?v=nknYgoMEm5s");
    url = url.replace(/ /g, "");
    let vcid = bot.servers[bot.channels[channelID].guild_id].members[userID].voice_channel_id;
    if (!vcid) {
        bot.sendMessage({to: channelID, message: "Enter a voice channel first!"});
        return;
    }
    if (userID != "176580265294954507") return; // Only cloudrac3r can use this command
    if (false) { // If the bot is already in a voice channel,
        con1(); // just continue
    } else { // Otherwise,
        bot.joinVoiceChannel(vcid, function(e,r) { // Join the voice channel
            if (bot.servers[bot.channels[channelID].guild_id].members[bot.id].voice_channel_id == vcid) {
                console.log("Joined voice channel");
                if (url.match(/youtube\.com\/playlist/)) {
                    console.log(url.match(/list=(.+)/)[1]);
                    request("https://www.googleapis.com/youtube/v3/playlistItems/?playlistId="+url.match(/list=(.+)/)[1]+"&part=snippet%2CcontentDetails&maxResults=25&key="+ytToken, function(e,r,b) {
                        if (e) {
                            bot.leaveVoiceChannel(bot.servers[bot.channels[channelID].guild_id].members[bot.id].voice_channel_id);
                        } else {
                            let a = [];
                            for (let v of JSON.parse(b).items) {
                                a.push(v.contentDetails.videoId);
                            }
                            if (command.split(";")[2]) a = a.slice(command.split(";")[2]);
                            con1(a);
                        }
                    });
                } else {
                    con1(); // then continue
                }
            } else {
                console.log("Couldn't join voice channel.");
            }
        });
    }
    function con1(list) { // Continue here
        bot.getAudioContext({channelID: vcid, stereo: true}, function(e,s) { // Not sure what this does but it's probably important
            if (e) { // Errors
                console.log(e);
            } else {
                console.log("Got audio context");
                if (!list) list = [url];
                con3(s, list, 0);
                function con3(s, list, t) {
                    let output = "[new!] Received "+t+", changing to ";
                    t = Math.floor(Math.random()*9000+1000);
                    console.log(output+t);
                    let item = list.splice(0,1)[0];
                    let music = ytdl(item, ["-x", "--format=best", "--audio-format=mp3", "--"], {maxBuffer: Infinity}); // Stream video
                    music.pipe(s, {end: false});
                    fs.createReadStream("/home/pi/Downloads/cdj.mp3").pipe(s, {end: false}); // Pipe to voice channel
                    bot.playAudioFile("/home/pi/Downloads/cdj.mp3");
                    console.log("["+t+"] Started streaming "+item);
                    s.once("done", function() { // When stream ends
                        if (list.length == 0) {
                            console.log("["+t+"] Stream ended.");
                            bot.leaveVoiceChannel(bot.servers[bot.channels[channelID].guild_id].members[bot.id].voice_channel_id); // Leave voice channel
                        } else {
                            console.log("["+t+"] "+list.length+" items left in list, continuing");
                            con3(s, list, t);
                            delete s;
                            delete music;
                        }
                    });
                }
            }
        });
    }
}

function MBaddToQueue(vID, userID, channelID, next) {
    if (typeof(vID) == "string") {
        if (next) {
            MBqueue.splice(0, 0, vID);
        } else {
            MBqueue.push(vID);
        }
        bot.sendMessage({to: channelID, message: "**"+userIDToNick(userID, bot.channels[channelID].guild_id)+"** added a video to the queue. The queue now contains **"+MBqueue.length+"** "+plural("item", MBqueue.length)+"."});
    } else if (typeof(vID) == "object") {
        if (next) {
            MBqueue = vID.concat(MBqueue);
        } else {
            MBqueue = MBqueue.concat(vID);
        }
        bot.sendMessage({to: channelID, message: "**"+userIDToNick(userID, bot.channels[channelID].guild_id)+"** added a playlist of "+vID.length+" videos to the queue. The queue now contains **"+MBqueue.length+"** "+plural("item", MBqueue.length)+"."});
    }
    if (!MBplaying) {
        new Promise(function(con, can) {
            if (false) { //bot.servers[bot.channels[channelID].guild_id].members[bot.id].voice_channel_id) {
                con();
            } else {
                bot.joinVoiceChannel(bot.servers[bot.channels[channelID].guild_id].members[userID].voice_channel_id, function(e,r) {
                    if (e) {
                        bot.sendMessage({to: channelID, message: "I couldn't join your voice channel. Maybe you're not in one?\nJoin a voice channel and use `play start` to play the current queue."});
                        can(e);
                    } else {
                        con(r);
                    }
                });
            }
        }).then(function() {
            bot.getAudioContext(bot.servers[bot.channels[channelID].guild_id].members[bot.id].voice_channel_id, function(e,s) {
                if (!e) {
                    MBplayNext(s, channelID);
                } else {
                    console.log(e);
                }
            });
        });
    }
}

function MBplayNext(stream, channelID) {
    MBplaying = true;
    let item = MBqueue.splice(0, 1)[0];
    console.log("Playing "+item);
    if (item.match(MBfRegex)) {
        bot.sendMessage({to: channelID, message: "Attempting to play an audio file. Some features are disabled."}, function(e,r) {
            request(item).pipe(stream, {end: false});
            stream.once("done", function() {
                if (MBqueue.length == 0) {
                    bot.leaveVoiceChannel(bot.servers[bot.channels[channelID].guild_id].members[bot.id].voice_channel_id);
                    MBplaying = false;
                    bot.sendMessage({to: channelID, message: "The queue is now empty; stopped playing."});
                } else {
                    MBplayNext(stream, channelID);
                }
                bot.deleteMessage({channelID: channelID, messageID: r.id});
            });
        });
    } else {
        MBmusic = ytdl(item, ["-x", "--format=best", "--audio-format=mp3", "--"], {maxBuffer: Infinity}); // Stream video
        bot.sendMessage({to: channelID, message: "Downloading video data..."}, function(e,r) {
            //console.log(JSON.stringify(r));
            let updateDisplay;
            let finished = "";
            MBmusic.on("info", function(info) {
                let minutes, seconds;
                if (info.duration.match(/:/)) {
                    minutes = info.duration.split(":")[0];
                    seconds = rpad(info.duration.split(":")[1], 2, "0");
                } else {
                    minutes = "0";
                    seconds = rpad(info.duration, 2, "0");
                }
                let started = Date.now();
                updateDisplay = setInterval(function() {
                    let elapsed = new Date(Date.now()-started);
                    bot.editMessage({channelID, messageID: r.id, message: "Now playing: **"+info.fulltitle+"** by **"+info.uploader+"** `["+elapsed.getUTCMinutes()+":"+rpad(elapsed.getUTCSeconds(), 2, "0")+" / "+minutes+":"+seconds+"]`"});
                }, 5000);
                bot.getPinnedMessages({channelID: channelID}, function(e,a) { if (!e) {
                    if (a.length < 45) bot.pinMessage({channelID: channelID, messageID: r.id});
                }});
                bot.editMessage({channelID, messageID: r.id, message: "Now playing: **"+info.fulltitle+"** by **"+info.uploader+"** `[0:00 / "+minutes+":"+seconds+"]`"});
                finished = "Finished playing: **"+info.fulltitle+"** by **"+info.uploader+"** `["+minutes+":"+seconds+" / "+minutes+":"+seconds+"]`";
                MBmusic.pipe(stream, {end: false});
            });
            /*} catch (e) {
                bot.sendMessage({to: channelID, message: "That song (https://youtu.be/"+item+") couldn't be played.\nWill attempt to continue."});
                clearInterval(updateDisplay);
                MBplayNext(stream, channelID);
            }*/
            stream.once("done", function() {
                clearInterval(updateDisplay);
                if (MBqueue.length == 0) {
                    bot.leaveVoiceChannel(bot.servers[bot.channels[channelID].guild_id].members[bot.id].voice_channel_id);
                    MBplaying = false;
                    bot.sendMessage({to: channelID, message: "The queue is now empty; stopped playing."});
                } else {
                    MBplayNext(stream, channelID);
                }
                bot.deleteMessage({channelID: channelID, messageID: r.id});
            });
        });
    }
}

// Create a post on the Epigam forums.
function postToEpigam(channelID, forum, topic, subject, message) {
    let output = "Automatic Epigam uploads are broken. Blame Tapatalk. Anyway, somebody will have to do this for me. I choose... <@";
    let online = epigamUploaders.filter(m => bot.servers[bot.channels[channelID].guild_id].members[m].status == "online");
    if (online.length == 0) online = epigamUploaders;
    output += online[0]+">!\n"+
              "Here's the URL you have to go to: <http://epigam.prophpbb.com/posting.php?mode=reply&f="+forum+"&t="+topic+">\n"+
              "Here's the message you have to send: ```\n"+message+"```";
    bot.sendMessage({to: channelID, message: output});
    return;
    request({
        url: "http://epigam.prophpbb.com/posting.php?mode=reply&f="+forum+"&t="+topic,
        headers: Object.assign({}, epigamPostHeaders, {"Referer": "http://epigam.prophpbb.com/topic"+topic+".html"}),
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log("Error while fetching posting form");
        } else {
            let pf = /<input type="hidden" name="([a-z_]+)" value="([0-9a-f]+)"/g
            let result;
            let data = {
                "subject": subject,
                "addbbcode20": 100,
                "message": message,
                "attach_sig": "on",
                "post": "Submit"
            };
            while ((result = pf.exec(body)) != null) {
                data[result[1]] = result[2];
            }
            if (data.form_token) {
                let newHeaders = Object.assign({}, epigamPostHeaders, {"Referer": "http://epigam.prophpbb.com/posting.php?mode=reply&f="+forum+"&t="+topic});
                request.post({
                    url: "http://epigam.prophpbb.com/posting.php?mode=reply&f="+forum+"&t="+topic,
                    headers: newHeaders,
                    method: "POST",
                    form: data
                }, function(error, response, body) {
                    if (error) {
                        console.log("Error: "+error);
                    } else {
                        if (body.match(/This message has been posted successfully\./)) {
                            bot.sendMessage({to: channelID, message: "Post created successfully! "+body.match(/href="(http:\/\/epigam.prophpbb.com\/.+)">View/)[1]});
                        } else {
                            fs.writeFileSync("final.html", body);
                            bot.uploadFile({to: channelID, message: "I couldn't create that post, for whatever reason.```\n"+JSON.stringify(data, null, 4)+"```", file: "final.html"});
                        }
                    }
                });
            } else {
                fs.writeFileSync("final.html", body);
                bot.uploadFile({to: channelID, message: "I couldn't post that message, for whatever reason.", file: "final.html"});
            }
        }
    });
}

function sendToPinsChannel(channelID, pinneeID, toPin, pinnerID) {
    if (!channelPinList[channelID]) {
        bot.sendMessage({to: channelID, message: "Sorry, I couldn't pin this message because this channel has no associated pins channel to send the message to. Time to nag <@176580265294954507>."});
        return;
    }
    if (pinneeID == pinnerID && bot.channels[channelID].guild_id == "112760669178241024") {
        bot.sendMessage({to: channelID, message: "<@"+pinnerID+"> No you fucking don't. Get the fuck out of here, self-pinning trash."}, function() {
            bot.sendMessage({to: channelID, message: "s!drop PSA: "+bot.users[pinnerID].username+" is self-pinning trash."}, function() {
                //bot.sendMessage({to: channelID, message: "s!tackle <@"+pinnerID+">"});
            });
        });
    }
    if (channelPinList[channelID].limit) {
        bot.getPinnedMessages({channelID: channelID}, function(e,a) {
            if (a.length > channelPinList[channelID].limit) {
                bot.deletePinnedMessage({channelID: channelID, messageID: a[a.length-1].id});
            }
        });
    }
    let highest = 0;
    let highestID = bot.channels[channelID].guild_id;
    for (let r of bot.servers[bot.channels[channelID].guild_id].members[pinneeID].roles) {
        if (bot.servers[bot.channels[channelID].guild_id].roles[r].color != 0 && bot.servers[bot.channels[channelID].guild_id].roles[r].position > highest) {
            highest = bot.servers[bot.channels[channelID].guild_id].roles[r].position;
            highestID = r;
        }
    }
    let image = "";
    let message;
    if (toPin.attachments[0]) image = toPin.attachments[0].url;
    if (toPin.embeds[0]) if (toPin.embeds[0].type == "image") image = toPin.embeds[0].url;
    if (toPin.attachments.length+toPin.embeds.length > 1) message = "hidden attachments";
    let t = new Date(toPin.timestamp);
    let name = bot.users[pinneeID].username;
    let nick = userIDToNick(pinneeID, bot.channels[channelID].guild_id);
    bot.sendMessage({to: channelPinList[channelID].channel, embed: {
        author: {
            name: (nick != name ? (nick+" ("+name+")") : (name)),
            icon_url: "https://cdn.discordapp.com/avatars/"+pinneeID+"/"+bot.users[pinneeID].avatar+".jpg"
        },
        color: bot.servers[bot.channels[channelID].guild_id].roles[highestID].color,
        description: toPin.content,
        image: {
            url: image
        },
        footer: {
            text: channelPinList[channelID].name
        },
        timestamp: t.toJSON()
    }}, function(e) {
        if (!e) bot.getPinnedMessages({channelID: channelID}, function(e,r) {
            if (!e) {
                let message = "Okay, I pinned **"+userIDToNick(pinneeID, bot.channels[channelID].guild_id)+"**'s message, as per the request of **"+userIDToNick(pinnerID, bot.channels[channelID].guild_id)+"**. ";
                if ((pinnerID == "112770767745265664" && pinneeID == "134826546694193153") || (pinnerID == "134826546694193153" && pinneeID == "112770767745265664")) message += "*Fucking pincestuous pieces of shit... mutter mutter.* ";
                message += "This channel now has "+r.length+"/50 pinned messages.";
                bot.sendMessage({to: channelID, message: message});
                if (r.length == 50 && bot.channels[channelID].guild_id == "112760669178241024") {
                    let b = [];
                    for (let i of r.slice(25)) {
                        b.push(i.id);
                    }
                    b.reverse();
                    genPinImage(channelID, b);
                }
            };
        });
    });
}

// Given a text string, inserts line breaks to make it as wide as possible but thinner than the width.
function flowText(ctx, text, width) {
    const breakChars = ["\n", " ", "-", ".", ",", "(", ")", "/", ";", ":"];
    let output = "";
    while (text) { // Loop while text remains
        let line = ""; // Current line fits in here
        let next = false; // true = stop trying
        let c = 0;
        while (c < breakChars.length) { // Try many breaking characters in order
            next = false;
            while (!next) {
                if (ctx.measureText(line+text.split(breakChars[c])[0]+breakChars[c]).actualBoundingBoxRight <= width) { // If next word is narrower than width,
                    line += text.split(breakChars[c])[0]+breakChars[c]; // Add word to line
                    text = text.split(breakChars[c]).slice(1).join(breakChars[c]); // Remove word from text;
                    if (breakChars[c] == "\n") {
                        c = breakChars.length;
                        next = true;
                    } else {
                        c = 0;
                    }
                } else { // Otherwise,
                    next = true; // stop trying;
                    console.log("Can't fit \""+text.split(breakChars[c])[0]+breakChars[c]+"\" onto \""+line+"\".");
                }
                if (text == "") { // Quit once out of text
                    next = true;
                    c = breakChars.length;
                }
            }
            c++;
        }
        if (line == "") { // If nothing fit in
            next = false;
            while (!next) {
                if (ctx.measureText(line+text.charAt(0)).actualBoundingBoxRight <= width) { // If next letter is narrower than width,
                    line += text.charAt(0); // Add letter to line
                    text = text.slice(1); // Remove letter from text
                } else { // Otherwise,
                    next = true; // stop trying
                }
            }
        }
        line = line.split("\n").filter(l => l).join("\n");
        output += line+"\n"; // Add line to output
    }
    console.log("Finished:\n"+output);
    return output;
}

// Converts /<@!?[0-9]+>/ into **@username**
function fixMentions(t) {
    for (let m of t.mentions) t.content = t.content.replace(/<@!?\d+>/g, "|ml|@"+m.username+"|ml|");
    t.content = t.content.replace(/(https?:\/\/([-0-9a-z]+\.)+[a-z]+(\/[-._a-zA-Z0-9?=&+%/]+)?)/g, "|ml|$1|ml|");
    t.content = t.content.replace(/<:([a-z0-9_]{2,}):[0-9]{8,}>/g, ":$1:");
    return t;
}

// Allows for the display of formatted text
function fillFormattedText(ctx, text, x, y) {
    let offset = {x: 0, y: 0};
    //TODO: Re-add italics
    let mdStrings = [{name: "__", action: "underline"},{name: "**", action: "bold"},{name: "*", action: "italic"},{name: "~~", action: "strike"},{name: "\n", action: "newline"},{name: "|ml|", action: "mlink"}];
    let formattedText = [];
    let status = {bold: false, italic: false, underline: false, strike: false, newline: false, mlink: false}; // The formatting of the start of text
    let id = {name: "start"};
    while (id.name) { // Keep looping if there may be more to do
        id = {}; // Will contain first Markdown match
        let pos;
        for (let i of mdStrings) if (text.indexOf(i.name) != -1 && !(text.indexOf(i.name) >= pos)) { // Store the first Markdown match in id
            id = i;
            pos = text.indexOf(i.name);
        }
        if (id.name) { // If something was matched
            if (id.action == "newline") status[id.action] = !status[id.action];
            formattedText.push(Object.assign({text: text.slice(0, text.indexOf(id.name))}, status)); // Add the formatted text
            text = text.slice(text.indexOf(id.name)+id.name.length); // Trim the text string
            status[id.action] = !status[id.action]; // Switch the status
        } else {
            formattedText.push(Object.assign({text: text}, status)); // Add the formatted text
        }
    }
    ctx.lineWidth = 0;
    for (let i of formattedText) {
        let font = "";
        ctx.fillStyle = "#c0c1c2";
        if (i.bold) font += "bold ";
        if (i.italic) font += "italic ";
        if (i.mlink) {
            ctx.fillStyle = "#3C414D";
            let base = ctx.measureText(i.text);
            let dim = { x1: base.actualBoundingBoxLeft+offset.x+x-1,
                        y1: -base.actualBoundingBoxAscent+offset.y+y-2,
                        x2: base.actualBoundingBoxRight-base.actualBoundingBoxLeft+2,
                        y2: base.actualBoundingBoxAscent+base.actualBoundingBoxDescent+5 };
            ctx.fillRect(dim.x1, dim.y1, dim.x2, dim.y2);
            ctx.fillStyle = "#7289DA";
        }
        ctx.font = font+"15pt 'Whitney'";
        ctx.fillText(i.text, x+offset.x, y+offset.y);
        offset.x = ctx.measureText(i.text).actualBoundingBoxRight-ctx.measureText(i.text).actualBoundingBoxLeft+offset.x;
        if (i.newline) {
            offset.x = 0;
            offset.y += 23;
        }
    }
    return ctx;
    //console.log(JSON.stringify(formattedText, null, 4));
}

function genPinImage(channelID, messageArr) {
    const size = {x: 800, y: 32767};
    const textPad = {left: 20, right: 20, top: 34};
    const linePad = 15;
    const imagePos = {x1: 17, y1: 13, x2: 77, y2: 73};
    let offset = 0;
    const breakChars = [" ", "-", ".", ",", "(", ")", "/", ";", ":"];
    const maxImageHeight = 600;
    let completed = 0;
    let vpos = 0;

    let canvas = new Canvas(size.x, size.y);
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = "#36393E";
    ctx.fillRect(0, 0, size.x, size.y);

    let t = Date.now();
    let index = 0;
    let resarray = [];

    bot.simulateTyping(channelID);
    getRes();

    function getRes() {
        bot.getMessage({channelID: channelID, messageID: messageArr[index]}, function(e,r) {
            if (!e) resarray.push(r);
            if (index < messageArr.length) {
                getRes();
            } else {
                bot.sendMessage({to: channelID, message: "Converting "+messageArr.length+" "+plural("message", messageArr.length)+" to an image. Let's do it."});
                ctxAppend();
            }
        });
        index++;
    }

    function ctxAppend() {
        if (resarray.length == 0) {
            console.log("Creating new canvas");
            let correctedSize = {x: size.x, y: offset};
            let realCanvas = new Canvas(correctedSize.x, correctedSize.y);
            let realCtx = realCanvas.getContext('2d');
            realCtx.putImageData(ctx.getImageData(0, 0, correctedSize.x, correctedSize.y), 0, 0);
            console.log("Placed data on new canvas, saving");
            let write = realCanvas.createPNGStream().pipe(fs.createWriteStream("pins.png"));
            write.on("finish", function() {
                console.log("Uploading");
                bot.uploadFile({to: channelID, file: "pins.png", message: "Pins generated in "+((Date.now()-t)/1000).toFixed(1)+" seconds"}, function(e,r) {
                    if (!e) {
                        if (channelPinList[channelID]) {
                            postToEpigam(channelID, channelPinList[channelID].forum, channelPinList[channelID].topic, "Discord Quotes", "Here's the latest batch of pins from "+channelPinList[channelID].name+". Enjoy.\n\n[img]"+r.attachments[0].url+"[/img]");
                        }
                        //bot.sendMessage({to: channelID, message: "Epigam uploads are temporarily disabled. <@176580265294954507> if the pin imge turned out okay then enable it!"});
                        function deletePinnedMessage(channelID, messageID) {
                            bot.deletePinnedMessage({channelID: channelID, messageID: messageID}, function(e) {
                                try {
                                    setTimeout(function() {
                                        deletePinnedMessage(channelID, messageID)
                                    }, e.response.retry_after);
                                    console.log("Pin deletion was rate-limited.");
                                } catch (e) {}
                            });
                        }
                        for (let i of messageArr) {
                            deletePinnedMessage(channelID, i);
                        }
                        //bot.sendMessage({to: channelID, message: "Deleting pinned messages is temporarily disabled. Fix this."});
                    } else {
                        bot.sendMessage({to: channelID, message: "Uhoh. I couldn't upload the file. Sup <@176580265294954507>?"});
                    }
                });
                bot.sendMessage({to: channelID, message: "Upload started."});
            });
        } else {
            let res = resarray.splice(0, 1)[0];
            console.log(JSON.stringify(res));
            if (bot.servers[bot.channels[channelID].guild_id].members[res.author.id]) { // Make sure the user can be found (leaves server, account deleted, ...)
                // Sort out variables needed later
                res.author.nick = (bot.servers[bot.channels[channelID].guild_id].members[res.author.id].nick || bot.users[res.author.id].username);
                let highest = 0;
                let highestID = bot.channels[channelID].guild_id;
                for (let r of bot.servers[bot.channels[channelID].guild_id].members[res.author.id].roles) {
                    if (bot.servers[bot.channels[channelID].guild_id].roles[r].color != 0 && bot.servers[bot.channels[channelID].guild_id].roles[r].position > highest) {
                        highest = bot.servers[bot.channels[channelID].guild_id].roles[r].position;
                        highestID = r;
                    }
                }
                res.author.colour = bot.servers[bot.channels[channelID].guild_id].roles[highestID].color;

                // Avatar
                if (res.author.avatar) {
                    ctx.fillStyle = "#36393E";
                    ctx.beginPath();
                    ctx.arc((imagePos.x1+imagePos.x2)/2, (imagePos.y1+imagePos.y2)/2+offset, (imagePos.x2-imagePos.x1)/2, 0, Math.PI*2, false);
                    ctx.fill();
                    ctx.closePath();
                    ctx.save();
                    let i = new Canvas.Image;
                    //console.log("https://cdn.discordapp.com/avatars/"+res.author.id+"/"+res.author.avatar+".png");
                    requestAvatar();
                    function requestAvatar() {
                        request("https://cdn.discordapp.com/avatars/"+res.author.id+"/"+res.author.avatar+".png", {encoding: null}, function(e,r,b) {
                            if (e) {
                                console.log("Error while getting avatar: "+e);
                                requestAvatar();
                            } else {
                                i.onload = function() {
                                    ctx.clip();
                                    ctx.drawImage(i, imagePos.x1, imagePos.y1+offset, imagePos.x2-imagePos.x1, imagePos.y2-imagePos.y1);
                                    ctx.restore();
                                    con1();
                                }
                                i.src = new Buffer(b, "binary");
                            }
                        });
                    }
                }

                function con1() {
                    console.log("con1");
                    // Username
                    ctx.font = "regular 15pt 'Whitney'";
                    ctx.fillStyle = "#"+res.author.colour.toString(16);
                    ctx.fillText(res.author.nick+" ("+res.author.username+")", imagePos.x2+textPad.left, textPad.top+offset);
                    ctx.lineWidth = 0.5;
                    ctx.strokeStyle = "#"+res.author.colour.toString(16);
                    ctx.strokeText(res.author.nick+" ("+res.author.username+")", imagePos.x2+textPad.left, textPad.top+offset);

                    // Message
                    ctx.font = "regular 15pt 'Whitney'";
                    ctx.fillStyle = "#c0c1c2";
                    let text = flowText(ctx, fixMentions(res).content, size.x-(imagePos.x2+textPad.left)-textPad.right-8);
                    //ctx.fillText(text, imagePos.x2+textPad.left, textPad.top+28+offset);
                    ctx = fillFormattedText(ctx, text, imagePos.x2+textPad.left, textPad.top+28+offset);
                    console.log("The vertical position before text detection is "+vpos+", "+offset);
                    //vpos = (ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent + 8)*((text.match(/\n/g) || []).length+1) + textPad.top + offset + 10;
                    vpos = textPad.top + offset + linePad;
                    (text.split("\n").slice(1) || []).forEach(function(l) {
                        //vpos += ctx.measureText(l).actualBoundingBoxAscent+ctx.measureText(l).actualBoundingBoxDescent+3;
                        vpos += 23;
                        /*ctx.lineWidth = 1;
                        ctx.strokeStyle = "#a2555C";
                        ctx.beginPath();
                        ctx.moveTo(linePad, vpos);
                        ctx.lineTo(size.x-linePad, vpos);
                        ctx.stroke();*/
                    });
                    console.log("The vertical position after text detection is "+vpos+", "+offset);
                    console.log(JSON.stringify(ctx.measureText(text), null, 4));

                    // Images/Attachments
                    let attachmentsLeft = res.embeds.concat(res.attachments).length;
                    if (attachmentsLeft == 0) con2();
                    for (let a of res.embeds.concat(res.attachments)) {
                        if (!a.url) a.url = "";
                        if (a.url.match(/\.png$/i)) {
                            console.log("Requesting image");
                            request(a.url, {encoding: null}, function(e,r,b) {
                                console.log("Requested image");
                                let image = new Canvas.Image();
                                image.onload = function() {
                                    let width = size.x-(imagePos.x2+textPad.left)-textPad.right;
                                    let sf = (image.width < width ? 1 : width/image.width);
                                    if (image.height*sf > maxImageHeight) {
                                        sf = sf*maxImageHeight/(image.height*sf);
                                    }
                                    ctx.drawImage(image, imagePos.x2+textPad.left, vpos, image.width*sf, image.height*sf);
                                    console.log("Drew image");
                                    vpos += image.height*sf+15;
                                    attachmentsLeft--;
                                    console.log(attachmentsLeft);
                                    if (attachmentsLeft == 0) con2();
                                }
                                image.src = new Buffer(b, "binary");
                            });
                        } else if (a.url.match(/\.jpg$/) || a.url.match(/\.jpeg$/i)) {
                            request(a.url, {encoding: null}, function(e,r,b) {
                                new exif.ExifImage({image: b}, function(e, exifData) {
                                    let image = new Canvas.Image();
                                    image.onload = function() {
                                        let width = size.x-(imagePos.x2+textPad.left)-textPad.right;
                                        let sf = (image.width < width ? 1 : width/image.width);
                                        if (image.height*sf > maxImageHeight) {
                                            sf = sf*maxImageHeight/(image.height*sf);
                                        }
                                        let complete = false;
                                        if (!e) {
                                            console.log("Image orientation is "+exifData.image.Orientation);
                                            if (exifData.image.Orientation == 6) {
                                                ctx.rotate(90*Math.PI/180);
                                                ctx.translate(vpos-(imagePos.x2+textPad.left), -(imagePos.x2+textPad.left)-vpos-image.height*sf);
                                                ctx.drawImage(image, imagePos.x2+textPad.left, vpos, image.width*sf, image.height*sf);
                                                ctx.setTransform(1, 0, 0, 1, 0, 0);
                                                vpos += image.width*sf+15;
                                                complete = true;
                                            }
                                        }
                                        if (!complete) {
                                            ctx.drawImage(image, imagePos.x2+textPad.left, vpos, image.width*sf, image.height*sf);
                                            vpos += image.height*sf+15;
                                        }
                                        console.log("Drew image");
                                        attachmentsLeft--;
                                        console.log(attachmentsLeft);
                                        if (attachmentsLeft == 0) con2();
                                    };
                                    image.src = new Buffer(b, "binary");
                                });
                            });
                        } else {
                            attachmentsLeft--;
                            if (attachmentsLeft == 0) con2();
                        }
                    };

                    function con2() {
                        console.log("con2");
                        // Divider
                        vpos += linePad;
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = "#52555C";
                        ctx.beginPath();
                        ctx.moveTo(linePad, vpos);
                        ctx.lineTo(size.x-linePad, vpos);
                        ctx.stroke();
                        con3();
                    }
                }
            } else {
                con3();
            }

            function con3() {
                offset = vpos;
                completed++;
                console.log("Completed "+completed+"; "+resarray.length+" remaining.");
                ctxAppend();
            }
        }
    }
}

function werewolf(user, userID, channelID, command) {
    if (command == "..wwg" || command == "..wwg;" || command == "..wwg;help") {
        bot.sendMessage({to: channelID, message: "__**One Night Ultimate Werewolf**__\nControl ONUW with the command **..wwg;**.\nAfter the semicolon, type one of **join**, **leave**, **check** or **start**. If you're still confused or want to know what those do, type **..wwg;explain**."});
    } else {
        var sendAsDM = false;
        var output = "The command didn't produce any output. Check you typed a valid command, and if you did, tell cloudrac3r about the problem! (Not pinged automatically anymore for obvious reasons.)";
        switch(command.split(";")[1]) {
        /*case "autotest":
            wwgPlayers.push("176580265294954507");
            wwgPlayerNames.push("cloudrac3r");
            //wwgPlayers.push(bot.id);
            //wwgPlayerNames.push("botrac3r");
            wwgPlayers.push("117661708092309509");
            wwgPlayerNames.push("Master Wonder Mage");
            wwgPlayers.push("112767329347104768");
            wwgPlayerNames.push("Jutomi");
            output = "..wwg;check";
            break;*/
        case "explain":
            output = "__**Explain One Night Ultimate Werewolf**__\nHow to play and rules: http://fully-faltoo.com/uploads/werewolf.pdf\n**..wwg;join**       Join the game.\n**..wwg;leave**    Leave the game\n**..wwg;check**   Check if you can start and who is playing\n**..wwg;start**    Start the game!\nStill confused? Read the docs for even more information.";
            break;
        /*case "add":
            playerToAdd1 = command.split(";")[2].split(">")[0];
            playerToAdd2 = playerToAdd1.substr(playerToAdd1.length-18)
            wwgPlayers.push(playerToAdd2);
            wwgPlayerNames.push(playerToAdd2);
            output = "<@"+playerToAdd2+"> was added to the game. Good luck!";
            break;*/
        case "join":
            if (wwgGameStarted) {
                output = "<@"+userID+"> You can't join because there is currently a game in progress. I'll DM you when it ends.";
                wwgWaitingPlayers.push(userID);
            } else {
                var position = wwgPlayers.indexOf(userID);
                if (position != -1) {
                    output = "<@"+userID+"> You're already in this game.";
                } else {
                    wwgPlayers.push(userID);
                    wwgPlayerNames.push(user);
                    wwgPlayerInteractions.push(false);
                    output = "<@"+userID+"> You were added to the game: there "+plural("is", wwgPlayers.length)+" now "+wwgPlayers.length+" "+plural("player", wwgPlayers.length)+".";
                }
            }
            break;
        case "leave":
            if (wwgGameStarted) {
                output = "<@"+userID+"> You can't leave in the middle of a game.";
            } else {
                var position = wwgPlayers.indexOf(userID);
                if (position == -1) {
                    position = wwgOldPlayers.indexOf(userID);
                    if (position != -1) {
                        wwgOldPlayers.splice(position, 1);
                        wwgOldPlayerNames.splice(position, 1);
                        output = "<@"+userID+"> You left the replay list.";
                    } else {
                        output = "<@"+userID+"> You weren't in the game anyway.";
                    }
                } else {
                    wwgPlayers.splice(position, 1);
                    wwgPlayerNames.splice(position, 1);
                    output = "<@"+userID+"> You left the game: there "+plural("is", wwgPlayers.length)+" now "+wwgPlayers.length+" "+plural("player", wwgPlayers.length)+".";
                }
            }
            break;
        case "kick":
            if (botAdmins.indexOf(userID) != -1) {
                playerToAdd1 = command.split(";")[2].split(">")[0];
                playerToAdd2 = playerToAdd1.substr(playerToAdd1.length-18);
                let position = wwgPlayers.indexOf(playerToAdd2);
                if (position != -1) {
                    wwgPlayers.splice(position, 1);
                    wwgPlayerNames.splice(position, 1);
                    output = "<@"+playerToAdd2+"> was kicked from the game.";
                } else {
                    output = "<@"+playerToAdd2+"> is not in this game.";
                }
            } else {
                output = "You don't have sufficient credibility to run this command.";
            }
            break;
        case "check":
            if (wwgPlayers.length == 0) {
                output = "No one has joined the game yet.";
            } else if (wwgPlayers.length < 3) {
                output = wwgPlayers.length+" people have joined the game so far, but you need 3 people to play. Players so far: ";
                output += wwgPlayerNames.toString().replace(/,/, ", ");
            } else if (wwgPlayers.length > wwgRoleConfig.length+2) {
                output = "Whoa! "+wwgPlayers.length+" people have joined the game, but "+(wwgRoleConfig.length+2)+" is the maximum. Someone needs to type **..wwg;leave** in order for the rest to be able to play the game!";
            } else {
                output = wwgPlayers.length+" people have joined the game so far. They are: ";
                output += wwgPlayerNames.toString().replace(/,/, ", ");
                if (wwgGameStarted) {
                    output += "\nThese roles are in play: ";
                } else {
                    output += "\nHere are the roles which will be used: ";
                }
                for (const i of wwgRoleConfig[wwgPlayers.length-3]) {
                    output += "`"+wwgRoleLookup[i]+"` ";
                }
                if (wwgTimer == 0) {
                    output += "\nThe timer is disabled.";
                } else {
                    output += "\nThe timer is set to "+wwgTimer+" minutes.";
                }
                if (wwgStrict) {
                    output += "\nStrict mode is enabled - the game will end automatically when the time runs out.";
                } else {
                    output += "\nStrict mode is disabled - you will have to end the game manually.";
                }
                if (wwgGameStarted) {
                    output += "\nThere is a game in progress.";
                } else if (bot.channels[channelID] == undefined) {
                    output += "\nYou cannot start the game in a DM.";
                } else {
                    output += "\nWhen you're ready to go, type **..wwg;start** and let the game begin!";
                }
            }
            break;
        case "start":
            if (wwgGameStarted) {
                output = "<@"+userID+"> There's already a game in progress.";
            } else if (wwgPlayers.indexOf(userID) == -1) {
                output = "<@"+userID+"> You can't start the game because you aren't a player. You can join the game using **..wwg;join** if you wish. If you were in the last game, type **..wwg;replay** to add everyone who played in it.";
            } else if (wwgPlayers.length < 3 || wwgPlayers.length > wwgRoleConfig.length+2 || bot.channels[channelID] == undefined) {
                output = "Something went wrong, and the game was not started! Type **..wwg;check** for more information.";
            } else {
                wwgCurrentGameID++;
                wwgChannel = channelID;
                wwgNightHasPassed = false;
                wwgNewRoles = [];
                wwgPlayerInteractions = [];
                wwgPlayerInteractionsDict = [];
                wwgVotes = new Array(wwgPlayers.length);
                wwgVotesUsed = [];
                wwgGameStarted = true;
                for (var i = 0; i < wwgPlayers.length; i++) {
                    wwgVotes[i] = 0;
                }
                let loneMinion = true;
                while (loneMinion) {
                    let werewolfFound = false;
                    let minionFound = false;
                    wwgStartRoles = wwgRoleConfig[wwgPlayers.length-3].slice(0);
                    for (var i = wwgStartRoles.length-1; i > 0; i--) {
                        var j = Math.floor(Math.random()*i);
                        var t = wwgStartRoles[i];
                        wwgStartRoles[i] = wwgStartRoles[j];
                        wwgStartRoles[j] = t;
                    }
                    for (let i = 0; i < wwgStartRoles.length-3; i++) {
                        if (wwgStartRoles[i] == 1) werewolfFound = true;
                        if (wwgStartRoles[i] == 9) minionFound = true;
                    }
                    if (minionFound && !werewolfFound) {
                        loneMinion = true;
                    } else {
                        loneMinion = false;
                    }
                }
                for (var i = 0; i < wwgStartRoles.length; i++) {
                    wwgNewRoles[i] = wwgStartRoles[i];
                }
                for (var i = 0; i < wwgPlayers.length; i++) {
                    bot.sendMessage({to: wwgPlayers[i], message: "Your role is: **"+wwgRoleLookup[wwgStartRoles[i]]+"**"});
                }
                output = "The game has started and DMs have been sent. All players using voice chat will be muted, and unmuted automatically once everyone has finished interacting.";
                setTimeout(function() {
                    for (var i = 0; i < wwgPlayers.length; i++) {
                        switch (wwgStartRoles[i]) {
                        case 0:
                            bot.sendMessage({to: wwgPlayers[i], message: "Villagers cannot do anything during the night."});
                            wwgPlayerInteractions[i] = true;
                            break;
                        case 1:
                            var newDM = "Here are all the werewolves in this game:";
                            var werewolves = 0;
                            for (var j = 0; j < wwgPlayers.length; j++) {
                                if (wwgStartRoles[j] == 1 || wwgStartRoles[j] == 10) {
                                    newDM = newDM + "\n"+wwgPlayerNames[j];
                                    werewolves++;
                                }
                            }
                            if (werewolves == 1) {
                                newDM += "\nSince you are the only werewolf, you may look at a centre card. Do this by typing **..wwg;interact;*id*** where *id* is a number from 1 to 3, representing which card you want to look at.";
                                wwgPlayerInteractions[i] = false;
                            } else {
                                wwgPlayerInteractions[i] = true;
                            }
                            bot.sendMessage({to: wwgPlayers[i], message: newDM});
                            break;
                        case 2:
                            var newDM = "Seers get to look at either any player's card, or two cards from the centre.\nIf you want to look at two cards from the centre, you must enter **..wwg;interact;*id1*;*id2***, where *id1* and *id2* are numbers from 1 to 3, representing which cards you want to look at.\nIf you want to look at a player's card instead, you must enter **..wwg;interact;*id***, where *id* is the number of one of the players in the following list:";
                            for (var j = 0; j < wwgPlayerNames.length; j++) {
                                newDM = newDM + "\n**"+(j+1)+"**: "+wwgPlayerNames[j];
                            }
                            bot.sendMessage({to: wwgPlayers[i], message: newDM});
                            wwgPlayerInteractions[i] = false;
                            break;
                        case 3:
                            var newDM = "Robbers get to steal a card from another player.\nYou must enter **..wwg;interact;*id***.\nReplace *id* with the number of one of the players in the following list:";
                            for (var j = 0; j < wwgPlayerNames.length; j++) {
                                newDM = newDM + "\n**"+(j+1)+"**: "+wwgPlayerNames[j];
                            }
                            bot.sendMessage({to: wwgPlayers[i], message: newDM});
                            wwgPlayerInteractions[i] = false;
                            break;
                        case 4:
                            var newDM = "Troublemakers get to swap the cards of 2 other players.\nYou must enter **..wwg;interact;*player1*;*player2***.\nReplace *player1* and *player2* with the numbers of the players whose cards you wish to swap.";
                            for (var j = 0; j < wwgPlayerNames.length; j++) {
                                newDM = newDM + "\n**"+(j+1)+"**: "+wwgPlayerNames[j];
                            }
                            bot.sendMessage({to: wwgPlayers[i], message: newDM});
                            wwgPlayerInteractions[i] = false;
                            break;
                        case 5:
                            bot.sendMessage({to: wwgPlayers[i], message: "Tanners cannot do anything during the night."});
                            wwgPlayerInteractions[i] = true;
                            break;
                        case 6:
                            var newDM = "Here are all the masons in this game:";
                            for (var j = 0; j < wwgPlayers.length; j++) {
                                if (wwgStartRoles[j] == 6) {
                                    newDM = newDM + "\n"+wwgPlayerNames[j];
                                }
                            }
                            bot.sendMessage({to: wwgPlayers[i], message: newDM});
                            wwgPlayerInteractions[i] = true;
                            break;
                        case 7:
                            var newDM = "Drunks must replace their card with one from the centre (without looking at their new card).\nYou must enter **..wwg;interact;*id***.\nReplace *id* with a number from 1 to 3, representing which card you want to swap with.";
                            bot.sendMessage({to: wwgPlayers[i], message: newDM});
                            wwgPlayerInteractions[i] = false;
                            break;
                        case 8:
                            bot.sendMessage({to: wwgPlayers[i], message: "Insomniacs cannot do anything during the night."});
                            wwgPlayerInteractions[i] = true;
                            wwgPlayerInteractionsDict.push({role: 8, user: i});
                            console.log(i+"\n"+wwgPlayers.toString());
                            break;
                        case 9:
                            var newDM = "Here are all the werewolves in this game:";
                            for (var j = 0; j < wwgPlayers.length; j++) {
                                if (wwgStartRoles[j] == 1) {
                                    newDM = newDM + "\n"+wwgPlayerNames[j];
                                }
                            }
                            bot.sendMessage({to: wwgPlayers[i], message: newDM});
                            break;
                        case 10:
                            bot.sendMessage({to: wwgPlayers[i], message: "Dream wolves cannot do anything during the night."});
                            break;
                        default:
                            bot.sendMessage({to: wwgPlayers[i], message: "Your role hasn't been programmed yet."});
                            wwgPlayerInteractions[i] = true;
                            break;
                        }
                    }
                    for (const i of wwgPlayers) {
                        bot.mute({serverID: bot.channels[wwgChannel].guild_id, userID: i});
                    }
                }, 2000);
            }
            break;
        case "interact":
            sendAsDM = true;
            var position = wwgPlayers.indexOf(userID);
            if (position == -1) {
                output = "You're not in this game!";
            } else {
                if (wwgPlayerInteractions[position] == true) {
                    output = "Either you've already done your action for the night, or you don't even have an action in the first place! Stop trying to cheat, you cheating cheater!";
                } else {
                    switch (wwgStartRoles[position]) {
                    case 1:
                        var werewolves = 0;
                        for (var j = 0; j < wwgPlayers.length; j++) {
                            if (wwgStartRoles[j] == 1 || wwgStartRoles[j] == 10) {
                                werewolves++;
                            }
                        }
                        if (werewolves == 1) {
                            if (command.split(";")[2] != undefined) {
                                if (parseInt(command.split(";")[2]) >= 1 && parseInt(command.split(";")[2]) <= 3) {
                                    output = "Card #"+command.split(";")[2]+" is "+wwgRoleLookup[wwgStartRoles[parseInt(command.split(";")[2])+wwgPlayers.length-1]]+".";
                                    wwgPlayerInteractions[position] = true;
                                } else {
                                    output = "Hmm. Read the instructions more closely and have another go.";
                                }
                            }
                        } else {
                            output = "You nitwit! You don't even know friendship when it's staring you in the face! If you thought you could get away with this, you don't even deserve to be playing this game.";
                        }
                        break;
                    case 2:
                        if (command.split(";")[3] != undefined) {
                            if (parseInt(command.split(";")[2]) >= 1 && parseInt(command.split(";")[2]) <= 3 && parseInt(command.split(";")[3]) >= 1 && parseInt(command.split(";")[3]) <= 3) {
                                output = "Card #"+command.split(";")[2]+" is "+wwgRoleLookup[wwgStartRoles[parseInt(command.split(";")[2])+wwgPlayers.length-1]]+" and card #"+command.split(";")[3]+" is "+wwgRoleLookup[wwgStartRoles[parseInt(command.split(";")[3])+wwgPlayers.length-1]]+".";
                                wwgPlayerInteractions[position] = true;
                            } else {
                                output = "Hmm. Read the instructions more closely and have another go.";
                            }
                        } else if (command.split(";")[2] != undefined) {
                            if (parseInt(command.split(";")[2]) >= 1 && parseInt(command.split(";")[2]) <= wwgPlayers.length) {
                                output = wwgPlayerNames[command.split(";")[2]-1]+"'s card is "+wwgRoleLookup[wwgStartRoles[command.split(";")[2]-1]]+".";
                                wwgPlayerInteractions[position] = true;
                            } else {
                                output = "Hmm. Read the instructions more closely and have another go.";
                            }
                        } else {
                            output = "Hmm. Read the instructions more closely and have another go.";
                        }
                        break;
                    case 3:
                        if (command.split(";")[2] != undefined) {
                            if (parseInt(command.split(";")[2]) >= 1 && parseInt(command.split(";")[2]) <= wwgPlayers.length && parseInt(command.split(";")[2]) != undefined) {
                                wwgPlayerInteractionsDict.push({role: 3, user: position, target: parseInt(command.split(";")[2])-1});
                                wwgPlayerInteractions[position] = true;
                                output = "Alright! Your action was recorded. Now sit tight and wait for everyone else!";
                            } else {
                                output = "Hmm. Read the instructions more closely and have another go.";
                            }
                        } else {
                            output = "Hmm. Read the instructions more closely and have another go.";
                        }
                        break;
                    case 4:
                        if (command.split(";")[3] != undefined) {
                            if (parseInt(command.split(";")[2]) >= 1 && parseInt(command.split(";")[2]) <= wwgPlayers.length && parseInt(command.split(";")[2]) != undefined && parseInt(command.split(";")[3]) >= 1 && parseInt(command.split(";")[3]) <= wwgPlayers.length && parseInt(command.split(";")[3]) != undefined) {
                                if (parseInt(command.split(";")[2])-1 == position || parseInt(command.split(";")[3])-1 == position) {
                                    output = "You can't swap your own card! Choose someone else!";
                                } else {
                                    wwgPlayerInteractionsDict.push({role: 4, user: position, targets: [parseInt(command.split(";")[2])-1, parseInt(command.split(";")[3])-1]});
                                    wwgPlayerInteractions[position] = true;
                                    output = "Alright! Your action was recorded. Now sit tight and wait for everyone else!";
                                }
                            } else {
                                output = "Hmm. Read the instructions more closely and have another go.";
                            }
                        } else {
                            output = "Hmm. Read the instructions more closely and have another go.";
                        }
                        break;
                    case 7:
                        if (command.split(";")[2] != undefined) {
                            if (parseInt(command.split(";")[2]) >= 1 && parseInt(command.split(";")[2]) <= 3) {
                                wwgPlayerInteractionsDict.push({role: 7, user: position, target: parseInt(command.split(";")[2])-1});
                                wwgPlayerInteractions[position] = true;
                                output = "Alright! Your action was recorded. Now sit tight and wait for everyone else!";
                            } else {
                                output = "Hmm. Read the instructions more closely and have another go.";
                            }
                        } else {
                            output = "Hmm. Read the instructions more closely and have another go.";
                        }
                        break;
                    default:
                        output = "Your role does not allow you to change anything.";
                        break;
                    }
                }
                var allInteracted = true;
                for (var i = 0; i < wwgPlayerInteractions.length; i++) {
                    if (wwgPlayerInteractions[i] == false) {
                        allInteracted = false;
                    }
                }
                if (allInteracted == true && wwgNightHasPassed == false) {
                    wwgNightHasPassed = true;
                    for (var i = 0; i < wwgWakeOrder.length; i++) {
                        for (var j = 0; j < wwgPlayerInteractionsDict.length; j++) {
                            if (wwgPlayerInteractionsDict[j].role == wwgWakeOrder[i]) {
                                //console.log("It's time for "+JSON.stringify(wwgPlayerInteractionsDict[j]));
                                switch (wwgPlayerInteractionsDict[j].role) {
                                case 3:
                                    var t = wwgNewRoles[wwgPlayerInteractionsDict[j].user];
                                    wwgNewRoles[wwgPlayerInteractionsDict[j].user] = wwgNewRoles[wwgPlayerInteractionsDict[j].target];
                                    wwgNewRoles[wwgPlayerInteractionsDict[j].target] = t;
                                    bot.sendMessage({to: wwgPlayers[wwgPlayerInteractionsDict[j].user], message: "Your role is now: **"+wwgRoleLookup[wwgNewRoles[wwgPlayerInteractionsDict[j].user]]+"**"});
                                    break;
                                case 4:
                                    var t = wwgNewRoles[wwgPlayerInteractionsDict[j].targets[0]];
                                    wwgNewRoles[wwgPlayerInteractionsDict[j].targets[0]] = wwgNewRoles[wwgPlayerInteractionsDict[j].targets[1]];
                                    wwgNewRoles[wwgPlayerInteractionsDict[j].targets[1]] = t;
                                    break;
                                case 7:
                                    //console.log("Px: "+wwgPlayerInteractionsDict[j].user+"   Pr: "+wwgNewRoles[wwgPlayerInteractionsDict[j]]);
                                    //console.log("Ci: "+wwgPlayerInteractionsDict[j].target+"   Cx: "+(wwgPlayerInteractionsDict[j].target+wwgPlayers.length)+"   Cr: "+wwgNewRoles[wwgPlayerInteractionsDict[j].target+wwgPlayers.length]);
                                    var t = wwgNewRoles[wwgPlayerInteractionsDict[j].user];
                                    wwgNewRoles[wwgPlayerInteractionsDict[j].user] = wwgNewRoles[wwgPlayerInteractionsDict[j].target + wwgPlayers.length];
                                    wwgNewRoles[wwgPlayerInteractionsDict[j].target + wwgPlayers.length] = t;
                                    break;
                                case 8:
                                    var role = wwgNewRoles[wwgPlayerInteractionsDict[j].user];
                                    if (role == 8) {
                                        bot.sendMessage({to: wwgPlayers[wwgPlayerInteractionsDict[j].user], message: "Your role was unchanged and is still: **"+wwgRoleLookup[wwgNewRoles[wwgPlayerInteractionsDict[j].user]]+"**"});
                                    } else {
                                        bot.sendMessage({to: wwgPlayers[wwgPlayerInteractionsDict[j].user], message: "Your role has been changed and is now: **"+wwgRoleLookup[wwgNewRoles[wwgPlayerInteractionsDict[j].user]]+"**"});
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    /*for (var i = 0; i < wwgPlayers.length; i++) {
                        console.log(wwgPlayerNames[i]+" is now a "+wwgRoleLookup[wwgNewRoles[i]]);
                    }*/
                    for (var i = 0; i < wwgPlayers.length; i++) {
                        bot.sendMessage({to: wwgPlayers[i], message: "All players have performed their actions. Now go back to the main channel and start talking!"});
                    }
                    bot.sendMessage({to: wwgChannel, message: "All players have performed their actions. Now start talking!"});
                    for (const i of wwgPlayers) {
                        bot.unmute({serverID: bot.channels[wwgChannel].guild_id, userID: i});
                    }
                    if (wwgTimer != 0) {
                        /*if (wwgStrict) {
                            bot.sendMessage({to: wwgChannel, message: "<@127296623779774464> remind "+wwgTimer+" minutes GAME END;"+wwgCurrentGameID});
                        } else {
                            bot.sendMessage({to: wwgChannel, message: "<@127296623779774464> remind "+wwgTimer+" minutes GAME END"});
                        }*/
                        wwgWarningTimeout = setTimeout(function() {
                            bot.sendMessage({to: wwgChannel, message: "30 seconds left! Make sure you've got a plan. If you're done already, you can just type **..wwg;end** to end the game early."});
                        }, (wwgTimer*1000*60)-30000);
                        if (wwgStrict) {
                            wwgEndingTimeout = setTimeout(function() {
                                bot.sendMessage({to: wwgChannel, message: "..wwg;end"});
                            }, (wwgTimer*1000*60));
                        } else {
                            wwgEndingTimeout = setTimeout(function() {
                                bot.sendMessage({to: wwgChannel, message: "The ONUW timer has expired."});
                            }, (wwgTimer*1000*60));
                        }
                    }
                }
                var dict = "";
                for (var i = 0; i < wwgPlayerInteractionsDict.length; i++) {
                    dict += "\n"+JSON.stringify(wwgPlayerInteractionsDict[i]);
                }
            }
            /*console.log(wwgPlayerNames.toString()+"\n"+wwgNewRoles.toString());
            for (const i of wwgPlayerInteractionsDict) {
                console.log(JSON.stringify(i,null,2));
            }*/
            break;
        case "end":
            clearTimeout(wwgWarningTimeout);
            clearTimeout(wwgEndingTimeout);
            if (wwgPlayers.indexOf(userID) == -1 && userID != bot.id) {
                output = "<@"+userID+"> You aren't in this game and therefore can't end it.";
            } else {
                if (wwgVoting) {
                    output = "<@"+userID+"> The game has already ended. Go vote!";
                } else if (!wwgGameStarted) {
                    output = "<@"+userID+"> Are you stupid or what?!";
                } else {
                    var output = "**The game has ended! Stop talking now!** If you are currently typing a message, you must abandon it.\nEveryone must now vote on which player will die. Check your DMs for instructions on how to do this.";
                    output += "\nAll players using voice chat have been muted, and will be unmuted automatically once everyone has voted."
                    for (const i of wwgPlayers) {
                        bot.mute({serverID: bot.channels[wwgChannel].guild_id, userID: i});
                        let newDM = "Here's the list of players in this game:";
                        for (var j = 0; j < wwgPlayerNames.length; j++) {
                            newDM += "\n**"+(j+1)+"**: "+wwgPlayerNames[j];
                        }
                        newDM += "\nSend in your vote by typing **..wwg;vote;*id*** where *id* is the number of the player that you want to kill in the above list.";
                        bot.sendMessage({to: i, message: newDM});
                    }
                    wwgVoting = true;
                }
            }
            break;
        case "forceend":
            while (wwgVotesUsed.length < wwgPlayers.length) {
                wwgVotesUsed.push(wwgPlayers[0]);
            }
            bot.sendMessage({to: wwgChannel, message: "..wwg;vote;0"});
            output = "Okay.";
            break;
        case "vote":
            if (wwgPlayers.indexOf(userID) == -1 && userID != bot.id) {
                output = "<@"+userID+"> You aren't in this game!";
            } else {
                if (!wwgVoting) {
                    output = "<@"+userID+"> The game hasn't ended yet.";
                } else {
                    if (wwgGameStarted && wwgNightHasPassed) {
                        if (wwgVotesUsed.indexOf(userID) == -1) {
                            if (parseInt(command.split(";")[2]) != undefined) {
                                if (parseInt(command.split(";")[2]) > 0 && parseInt(command.split(";")[2]) <= wwgPlayers.length) {
                                    wwgVotes[parseInt(command.split(";")[2])-1]++;
                                    wwgVotesUsed.push(userID);
                                    output = "<@"+userID+"> Ok! Your vote was counted.";
                                } else {
                                    output = "<@"+userID+"> That number is not in range!";
                                }
                            } else {
                                output = "<@"+userID+"> That's not a number!";
                            }
                        } else {
                            output = "<@"+userID+"> You've already voted! Stop trying to cheat, you cheating cheater!";
                        }
                        if (wwgVotesUsed.length == wwgPlayers.length) {
                            for (const i of wwgPlayers) {
                                bot.unmute({serverID: bot.channels[wwgChannel].guild_id, userID: i});
                            }
                            setTimeout(function() {
                                var sortedNames = wwgPlayerNames.slice(0);
                                var sortedVotes = wwgVotes.slice(0);
                                var finalResults = "**All the votes are in!** Here's a list of all players and their roles, in order of most votes:";
                                for (var i = 0; i < wwgPlayers.length; i++) {
                                    for (var j = 0; j < wwgPlayers.length-1; j++) {
                                        if (sortedVotes[j] < sortedVotes[j+1]) {
                                            var t = sortedVotes[j];
                                            sortedVotes[j] = sortedVotes[j+1];
                                            sortedVotes[j+1] = t;
                                            t = sortedNames[j];
                                            sortedNames[j] = sortedNames[j+1];
                                            sortedNames[j+1] = t;
                                        }
                                    }
                                }
                                for (var i = 0; i < sortedNames.length; i++) {
                                    finalResults += "\n**"+sortedVotes[i]+"**: "+sortedNames[i]+" ("+wwgRoleLookup[wwgStartRoles[wwgPlayerNames.indexOf(sortedNames[i])]]+" → "+wwgRoleLookup[wwgNewRoles[wwgPlayerNames.indexOf(sortedNames[i])]]+")";
                                };
                                finalResults += "\nHere's what happened to the centre cards:";
                                for (var i = 0; i < 3; i++) {
                                    finalResults += "\nCard #"+(i+1)+" ("+wwgRoleLookup[wwgStartRoles[wwgPlayers.length+i]]+" → "+wwgRoleLookup[wwgNewRoles[wwgPlayers.length+i]]+")";
                                }
                                var deathList = [];
                                var progress = 0;
                                do {
                                    deathList.push(sortedNames[progress]);
                                    progress++;
                                } while (progress < wwgPlayers.length && sortedVotes[progress-1] == sortedVotes[progress]);
                                if (sortedVotes[wwgPlayers.length-1] == 1) {
                                    finalResults += "\nNo one died because everyone had 1 vote.";
                                } else {
                                    finalResults += "\nThese people died: "+deathList.toString();
                                }
                                // status 0 = none, 1 = alive, 2 = dead
                                let werewolfStatus = 0;
                                let tannerStatus = 0;
                                let minionStatus = 0;
                                for (let i = 0; i < wwgPlayers.length; i++) {
                                    if (wwgNewRoles[i] == 1 || wwgNewRoles[i] == 10) {
                                        werewolfStatus = 1;
                                    } else if (wwgNewRoles[i] == 5) {
                                        tannerStatus = 1;
                                    } else if (wwgNewRoles[i] == 9) {
                                        minionStatus = 1;
                                    }
                                }
                                if (sortedVotes[0] != 1) {
                                    for (let i of deathList) {
                                        if (wwgNewRoles[wwgPlayerNames.indexOf(i)] == 1 || wwgNewRoles[wwgPlayerNames.indexOf(i)] == 10) {
                                            werewolfStatus = 2;
                                        } else if (wwgNewRoles[wwgPlayerNames.indexOf(i)] == 5) {
                                            tannerStatus = 2;
                                        }
                                    }
                                }
                                finalResults += "\n";
                                if (werewolfStatus == 1) {
                                    if (minionStatus == 0) {
                                        finalResults += "None of the werewolves died. The werewolves win and the villagers lose.";
                                    } else {
                                        finalResults += "None of the werewolves died. The werewolves and the minion win, and the villagers lose.";
                                    }
                                } else if (werewolfStatus == 2) {
                                    if (minionStatus == 0) {
                                        finalResults += "At least one werewolf died. The werewolves lose and the villagers win.";
                                    } else {
                                        finalResults += "At least one werewolf died. The werewolves and the minion lose, and the villagers win.";
                                    }
                                } else {
                                    if (sortedVotes[wwgPlayers.length-1] == 1) {
                                        finalResults += "The villagers win.";
                                    } else {
                                        finalResults += "The villagers lose.";
                                    }
                                }
                                if (tannerStatus == 1) {
                                    finalResults += "\nThe tanner loses.";
                                } else if (tannerStatus == 2) {
                                    finalResults += "\nThe tanner wins.";
                                }
                                finalResults += "\n```";
                                for (let i = 0; i < wwgPlayers.length; i++) {
                                    finalResults += "\n";
                                    if (wwgStats[wwgPlayers[i]] == undefined) {
                                        wwgStats[wwgPlayers[i]] = {wins: {villager: 0, werewolf: 0, tanner: 0}, losses: {villager: 0, werewolf: 0, tanner: 0}};
                                    }
                                    wwgStats[wwgPlayers[i]].avatar = bot.users[wwgPlayers[i]].avatar;
                                    wwgStats[wwgPlayers[i]].username = bot.users[wwgPlayers[i]].username;
                                    switch (wwgNewRoles[i]) {
                                    case 0:
                                    case 2:
                                    case 3:
                                    case 4:
                                    case 6:
                                    case 7:
                                    case 8:
                                        if (werewolfStatus == 0) {
                                            if (sortedVotes[wwgPlayers.length-1] == 1) {
                                                finalResults += "[WIN ]";
                                                wwgStats[wwgPlayers[i]].wins.villager++;
                                            } else {
                                                finalResults += "[LOSE]";
                                                wwgStats[wwgPlayers[i]].losses.villager++;
                                            }
                                        } else if (werewolfStatus == 1) {
                                            finalResults += "[LOSE]";
                                            wwgStats[wwgPlayers[i]].losses.villager++;
                                        } else {
                                            finalResults += "[WIN ]";
                                            wwgStats[wwgPlayers[i]].wins.villager++;
                                        }
                                        break;
                                    case 1:
                                    case 9:
                                    case 10:
                                        if (werewolfStatus == 1) {
                                            finalResults += "[WIN ]";
                                            wwgStats[wwgPlayers[i]].wins.werewolf++;
                                        } else if (werewolfStatus == 2) {
                                            finalResults += "[LOSE]";
                                            wwgStats[wwgPlayers[i]].losses.werewolf++;
                                        } else {
                                            finalResults += "[ugh ]";
                                        }
                                        break;
                                    case 5:
                                        if (tannerStatus == 2) {
                                            finalResults += "[WIN ]";
                                            wwgStats[wwgPlayers[i]].wins.tanner++;
                                        } else {
                                            finalResults += "[LOSE]";
                                            wwgStats[wwgPlayers[i]].losses.tanner++;
                                        }
                                        break;
                                    }
                                finalResults += " "+wwgPlayerNames[i];
                                }
                                fs.writeFile("/home/pi/Documents/wwgstats.txt", JSON.stringify(wwgStats, null, 4));
                                fs.writeFile("/var/www/html/stats.js", "let wwgStats = "+JSON.stringify(wwgStats)+";");
                                finalResults += "```";
                                wwgGameStarted = false;
                                wwgVoting = false;
                                wwgOldPlayers = wwgPlayers.slice(0);
                                wwgOldPlayerNames = wwgPlayerNames.slice(0);
                                wwgPlayers = [];
                                wwgPlayerNames = [];
                                finalResults += "\nThe game is over. The list of active players has been cleared. However, if you want to play again with the same people, just type **..wwg;replay** to quickly set it up again!";
                                bot.sendMessage({to: wwgChannel, message: finalResults});
                                if (wwgWaitingPlayers.length > 0) {
                                    for (const i of wwgWaitingPlayers) {
                                        bot.sendMessage({to: i, message: "The old ONUW game has ended. If you still want to play, get into the main channel and type **..wwg;join**!"});
                                    }
                                }
                                wwgWaitingPlayers = [];
                            }, 2000);
                        }
                    }
                }
            }
            break;
        case "stats":
            output = "<@"+userID+"> DM sent. You can also view a much prettier version of the same stats online at http://cloudrac3r.ddns.net/wwgstats.html";
            let newDM = "ONUW stats:```md\n";
            for (const i in wwgStats) {
                newDM += "<"+bot.users[i].username+">\n";
                newDM += "        Villager    Werewolf    Tanner      Total\n";
                newDM += "Wins    "+pad(wwgStats[i].wins.villager, 12, " ")+pad(wwgStats[i].wins.werewolf, 12, " ")+pad(wwgStats[i].wins.tanner, 12, " ")+pad(wwgStats[i].wins.villager+wwgStats[i].wins.werewolf+wwgStats[i].wins.tanner, 12, " ")+"\n";
                newDM += "Losses  "+pad(wwgStats[i].losses.villager, 12, " ")+pad(wwgStats[i].losses.werewolf, 12, " ")+pad(wwgStats[i].losses.tanner, 12, " ")+pad(wwgStats[i].losses.villager+wwgStats[i].losses.werewolf+wwgStats[i].losses.tanner, 12, " ")+"\n";
            }
            newDM += "```\nYou can view a much prettier version of these same stats online at http://cloudrac3r.ddns.net/wwgstats.html  ";
            bot.sendMessage({to: userID, message: newDM});
            break;
        case "replay":
            if (wwgGameStarted == true) {
                output = "<@"+userID+"> A game is already being played!";
            } else if (wwgOldPlayers.indexOf(userID) == -1) {
                output = "<@"+userID+"> You weren't a player in the last game!";
            } else {
                wwgPlayers = wwgPlayers.concat(wwgOldPlayers);
                wwgPlayerNames = wwgPlayerNames.concat(wwgOldPlayerNames);
                for (var i = 0; i < wwgPlayers.length; i++) {
                    for (var j = i+1; j < wwgPlayers.length; j++) {
                        if (wwgPlayers[i] == wwgPlayers[j]) {
                            wwgPlayers.splice(j, 1);
                            wwgPlayerNames.splice(j, 1);
                            j--;
                        }
                    }
                }
                wwgChannel = channelID;
                output = "..wwg;check";
            }
            break;
        case "timer":
            if (wwgGameStarted) {
                output = "A game is already being played and the timer cannot be changed.";
            } else {
                if (command.split(";")[2] != undefined) {
                    if (parseInt(command.split(";")[2]) != undefined) {
                        wwgTimer = parseInt(command.split(";")[2]);
                        if (wwgTimer == 0) {
                            output = "The timer has been disabled.";
                        } else {
                            output = "The timer has been set to "+wwgTimer+" minutes.";
                        }
                    }
                } else {
                    wwgTimer = 0;
                    output = "The timer has been disabled.";
                    if (wwgStrict) {
                        output += " Strict mode has been automatically disabled.";
                    }
                }
            }
            break;
        case "reset":
            if (botAdmins.indexOf(userID) != -1) {
                for (const i of wwgPlayers) {
                    bot.unmute({serverID: bot.channels[channelID].guild_id, userID: i});
                }
                wwgChannel = "";
                wwgPlayers = [];
                wwgPlayerNames = [];
                wwgPlayerInteractions = [];
                wwgPlayerInteractionsDict = [];
                wwgStartRoles = [];
                wwgNewRoles = [];
                wwgRoleConfig = [[0, 1, 1, 2, 3, 4], [0, 8, 1, 1, 2, 3, 4], [7, 8, 1, 10, 2, 3, 4, 5], [6, 6, 7, 1, 1, 2, 3, 4, 9], [6, 6, 7, 8, 1, 1, 2, 3, 4, 9], [9, 6, 6, 7, 8, 1, 1, 2, 3, 4, 5], [0, 9, 6, 6, 7, 8, 1, 1, 2, 3, 4, 5]];
                wwgNightHasPassed = false;
                wwgVotes = [];
                wwgVotesUsed = [];
                wwgGameStarted = false;
                wwgVoting = false;
                wwgWaitingPlayers = [];
                wwgOldPlayers = [];
                wwgOldPlayerNames = [];
                wwgTimer = 5;
                wwgStrict = true;
                clearTimeout(wwgEndingTimeout);
                clearTimeout(wwgWarningTimeout);
                wwgCurrentGameID = 0;
                output = "Everything related to ONUW has been reset to the default values.";
            } else {
                output = "You don't have sufficient credibilty to run this command.";
            }
            break;
        case "strict":
            if (wwgGameStarted) {
                output = "A game is already in progress and strict mode cannot be modified.";
            } else {
                if (wwgTimer == 0) {
                    wwgStrict = true;
                    wwgTimer = 5;
                    output = "Strict mode has been enabled. The timer has been automatically set to 5 minutes.";
                } else {
                    wwgStrict = !wwgStrict;
                    if (wwgStrict) {
                        output = "Strict mode has been enabled.";
                    } else {
                        output = "Strict mode has been disabled.";
                    }
                }
            }
            break;
        case "fix":
            for (let i in wwgStats) {
                wwgStats[i].username = bot.users[i].username;
                wwgStats[i].avatar = bot.users[i].avatar;
            }
            fs.writeFile("/home/pi/Documents/wwgstats.txt", JSON.stringify(wwgStats, null, 4));
            fs.writeFile("/var/www/html/stats.js", "let wwgStats = "+JSON.stringify(wwgStats)+";");
            output = "Usernames and avatars have been corrected on the statistics webpage.";

            break;
        }
        if (sendAsDM) {
            bot.sendMessage({to: userID, message: output});
        } else {
            bot.sendMessage({to: channelID, message: output});
        }
    }
}

function ruralporn(channelID, message) {
    let number = 0;
    let sub = "/user/kjoneslol/m/sfwpornnetwork";
    try {
        if (message.split(";")[2]) if (message.split(";")[2].match(/[1-9][0-9]*/)) {
            number = parseInt(message.split(";")[2]);
        } else if (message.split(";")[1].match(/[1-9][0-9]*/)) {
            number = parseInt(message.split(";")[1]);
        }
    } catch (e) {};
    try {
        if (message.split(";")[1] && number != 0) sub = message.split(";")[1];
    } catch (e) {};
    bot.simulateTyping(channelID);
    request("https://www.reddit.com"+sub+"/new.json?sort=new&raw_json=1", function(e,r,b) {
        try {
            let i = 0;
            while (i < 3) {
                if (JSON.parse(b).data.children[number+i].data.preview.images[0].source.url) {
                    bot.sendMessage({to: channelID, message: "**Link:** <"+JSON.parse(b).data.children[number+i].data.url+">\n"+
                        "**Thread:** <https://reddit.com"+JSON.parse(b).data.children[number+i].data.permalink+">\n"+
                        "**Preview:** "+JSON.parse(b).data.children[number+i].data.preview.images[0].source.url});
                    i = 3;
                } else {
                    i++;
                }
            }
        } catch (err) {
            try {
                bot.sendMessage({to: channelID, message: "ahaha that didn't work. It's probably your fault 😎```\n"+JSON.stringify(JSON.parse(b).data.children[0].data)+"```"});
            } catch (err) {
                bot.sendMessage({to: channelID, message: "...wow, something REALLY went wrong. It's probably still your fault though 😎😎😎"});
            }
        }
    });
}

function vote(userID, channelID, command) {
    var output = "The command didn't produce any output. Check you typed a valid command, and if you did, tell <@176580265294954507> about the problem!";
    switch(command.split(";")[1]) {
    case "start":
        if (command.split(";")[4] !== undefined && command.split(";")[2].length > 1) {
            var optionSearch = [];
            output = "Poll `"+command.split(";")[2]+"` started with the options `";
            for (var i = 3; i < command.split(";").length; i++) {
                output += command.split(";")[i]+"`, `";
                optionSearch.push({name: command.split(";")[i], votes: 0});
            }
            voteList.push({title: command.split(";")[2], startedBy: userID, options: optionSearch, people: []});
            output = output.slice(0, output.length-3);
            output += "! Its ID is "+voteList.length+" and you can check it with **..vote;check;"+voteList.length+"**.";
        }
        break;
    case "check":
        if (voteList.length == 0) {
            output = "There are no polls... yet.";
        } else {
            if (command.split(";")[2] === undefined || command.split(";")[2] === NaN) {
                output = "Ongoing polls: ";
                for (var i = 0; i < voteList.length; i++) {
                    output += "\n**"+(i+1)+"**: "+voteList[i].title+" (<@"+voteList[i].startedBy+")";
                }
                output += "\nType **..vote;check;*pollNumber*** for more information about a poll.";
            } else {
                var pollNumber = parseInt(command.split(";")[2])-1;
                output = "Poll: **"+voteList[pollNumber].title+"** ("+bot.users[voteList[pollNumber].startedBy].username+">)";
                for (var i = 0; i < voteList[pollNumber].options.length; i++) {
                    output += "\n**"+(i+1)+"**: "+voteList[pollNumber].options[i].name+" ("+voteList[pollNumber].options[i].votes+")";
                }
                output += "\nTo vote, type **..vote;add;"+(pollNumber+1)+";*choiceNumber***!";
            }
        }
        break;
    case "add":
        if (command.split(";")[3] !== undefined && command.split(";")[2] !== NaN && command.split(";")[3] !== NaN) {
            var pollNumber = parseInt(command.split(";")[2])-1;
            var choiceNumber = parseInt(command.split(";")[3])-1;
            if (voteList[pollNumber].people.indexOf(userID) == -1) {
                voteList[pollNumber].options[choiceNumber].votes ++;
                voteList[pollNumber].people.push(userID);
                output = "Your vote was cast - type **..vote;check;"+(pollNumber+1)+"** to see it!";
            } else {
                output = "You've already voted on this poll.";
            }
        }
        break;
    }
    bot.sendMessage({to: channelID, message: output});
}

function proxy(command, number) {
    var channelID = command.split(";")[1];
    var message = command.split(";").slice(2).join(";");
    if (bot.channels[channelID] || bot.users[channelID]) {
        bot.sendMessage({to: channelID, message: "​"+message});
    } else {
        let ok = false;
        for (let c in bot.channels) {
            if (bot.channels[c].name == channelID && !ok) {
                bot.sendMessage({to: c, message: "​"+message}); // Zero-width space!!!!
                ok = true;
            }
        }
    }
}

function convertTemp(userID, channelID, command) {
    var temperature = parseFloat(command.split(";")[1]);
    var fahrenheit = temperature*1.8+32;
    var celsius = (temperature-32)/1.8;
    bot.sendMessage({to: channelID, message: "<@"+userID+">, "+temperature.toFixed(1)+"°F = "+celsius.toFixed(1)+"°C, and "+temperature.toFixed(1)+"°C = "+fahrenheit.toFixed(1)+"°F."});
}

function roll(userID, channelID, command) {
    var lowestNumber = 0;
    var highestNumber = 0;
    var number1 = parseInt(command.split(";")[1]);
    var number2 = parseInt(command.split(";")[2]);
    var description = command.split(";")[3];
    if (description == undefined) {
        description = "Your number is";
    }
    if (number1 != parseInt(number1) || number2 != parseInt(number2)) {
        bot.sendMessage({to: channelID, message: "<@"+userID+"> "+description+": **69420!!**"});
    } else {
        if (number1 < number2) {
            lowestNumber = number1;
            highestNumber = number2;
        } else if (number1 > number2) {
            lowestNumber = number2;
            highestNumber = number1;
        }
        if (lowestNumber != highestNumber) {
            bot.sendMessage({to: channelID, message: "<@"+userID+"> "+description+": **"+Math.floor(Math.random()*(highestNumber-lowestNumber+1)+lowestNumber)+"**"});
        } else {
            bot.sendMessage({to: channelID, message: "<@"+userID+"> "+description+": **Hmm, let me think about that one. I choose... "+number1+". Surprised?**"});
        }
    }
}

function choose(userID, channelID, command) {
    let index = Math.floor(Math.random()*(command.split(";").length-1))+1;
    bot.sendMessage({to: channelID, message: "<@"+userID+"> I choose: **"+command.split(";")[index]+"**"});
}

function flag(channelID, command) {
    let el = [];
    let template = "";
    let output = "";
    console.log("OK");
    if (command.split(";")[3]) {
        for (let i of command.split(";").slice(1, 4)) {
            if (i.match(/</)) {
                el.push(i.replace(/\s/g, ""));
            } else if (i.match(/:/)) {
                el.push(emoji("", "", channelID, i.replace(/\s/g, ""), {}));
            } else {
                el.push(i.replace(/\s/g, ""));
            }
        }
        switch (parseInt(command.split(4))) {
        default:
            template = "+.+.----\n"+
                       ".+.+....\n"+
                       "+.+.----\n"+
                       ".+.+....\n"+
                       "--------\n"+
                       "........\n"+
                       "--------\n"+
                       "........";
            break;
        }
        output = template.replace(/-/g, el[0]).replace(/\./g, el[1]).replace(/\+/g, el[2]);
    } else {
        output = "Try **..flag;*emoji1*;*emoji2*;*emoji3***.";
    }
    bot.sendMessage({to: channelID, message: output});
    //~ if (command.split(";")[3] != undefined) {
        //~ for (var i = 0; i < 3; i++) {
            //~ if (command.split(";")[i+1].indexOf("<") != -1 && command.split(";")[i+1].indexOf(">") != -1) {
                //~ el[i] = "<"+command.split(";")[i+1].split("<")[1].split(">")[0]+">";
            //~ } else {
                //~ el[i] = command.split(";")[i+1];
            //~ }
        //~ }
        //~ output = el[2]+el[1]+el[2]+el[1]+el[0]+el[0]+el[0]+el[0]+"\n"+el[1]+el[2]+el[1]+el[2]+el[1]+el[1]+el[1]+el[1]+"\n"+el[2]+el[1]+el[2]+el[1]+el[0]+el[0]+el[0]+el[0]+"\n"+el[1]+el[2]+el[1]+el[2]+el[1]+el[1]+el[1]+el[1]+"\n"+el[0]+el[0]+el[0]+el[0]+el[0]+el[0]+el[0]+el[0]+"\n"+el[1]+el[1]+el[1]+el[1]+el[1]+el[1]+el[1]+el[1]+"\n"+el[0]+el[0]+el[0]+el[0]+el[0]+el[0]+el[0]+el[0];
        //~ bot.sendMessage({to: channelID, message: output});
    //~ }
}

function yesno(userID, channelID, command) {
    let description = command.split(";")[1];
    if (description == undefined) {
        description = "I decided";
    }
    let output = "";
    if (Math.random() < 0.002) {
        output = "That's a very important decision. You should decide for yourself.\nBy the way, this only has a 1/500 chance of showing up!";
    } else {
        output = yesnoOptions[Math.floor(Math.random()*yesnoOptions.length)];
    }
    bot.sendMessage({to: channelID, message: "<@"+userID+"> "+description+": **"+output+"**"});
}

function wiki(channelID, command) {
    bot.simulateTyping(channelID);
    var title = command.split(";")[1];
    if (title != undefined) {
        request("http://en.wikipedia.org/w/api.php?action=query&format=json&uselang=en&prop=extracts%7Cinfo&titles="+title+"&redirects=1&exchars=600&exintro=1&explaintext=1&inprop=url", function(error, response, body) {
            content = JSON.parse(body);
            for (let pageID of Object.keys(content.query.pages)) {
                if (content.query.pages[pageID].extract != undefined) {
                    bot.sendMessage({to: channelID, message: "__**Wikipedia article for "+content.query.pages[pageID].title+"**__\n"+content.query.pages[pageID].extract+"\nRead on Wikipedia: <"+content.query.pages[pageID].fullurl+">"});
                } else {
                    bot.sendMessage({to: channelID, message: "Couldn't find "+title+" on Wikipedia."});
                }
                //console.log(JSON.stringify(content));
            }
        });
    }
}

function tz(userID, channelID, command) {
    let output = "<@"+userID+"> ";
    switch(command.split(";")[1]) {
    case "help":
        output += "__**Time difference**__\nThis command lets you see another person's local time. You can look up someone's time with the command **..time; *@person*** where *@person* is a mention of the person whose time you want to check.";
        output += "You can set your own local time with **..time;set;*timezone*** where *timezone* is either a TZ-formatted location (see <http://bit.do/tzlist> for the list of possibilities) or a time zone (e.g. PDT, EST, NZST). The latter may not account for Daylight Savings Time, so use the former if possible.";
        bot.sendMessage({to: channelID, message: output});
        break;
    case "set":
        request("http://api.timezonedb.com/v2/get-time-zone?key=0M1HC5J1KSQ1&format=json&by=zone&zone="+command.split(";")[2], function(error, response, body) {
            let answer = JSON.parse(body);
            console.log(JSON.stringify(answer, null, 4));
            if (answer.status != "OK") {
                bot.sendMessage({to: channelID, message: "<@"+userID+"> Problem detected! Response message: "+answer.message});
            } else {
                let time = new Date(answer.timestamp*1000);
                bot.sendMessage({to: channelID, message: "<@"+userID+"> Your local time was set to "+time.getUTCHours()+":"+(time.getUTCMinutes() <= 9 ? ("0"+time.getUTCMinutes().toString()) : time.getUTCMinutes())+" (24hr)."});
            }
            userTimes[userID] = command.split(";")[2];
            fs.writeFile("/home/pi/Documents/usertimes.txt", JSON.stringify(userTimes));
        });
        break;
    default:
        if (command.split(";")[1] == undefined) {
            output += "Try using **..time;help** instead.";
        } else {
            tmp = command.split(";")[1].split(">")[0];
            let targetUserID = tmp.substr(tmp.length-18);
            if (bot.users[targetUserID] == undefined) {
                output += "You must specify a username. Type **..time;help** for more information.";
                bot.sendMessage({to: channelID, message: output});
            } else if (userTimes[targetUserID] == undefined) {
                output += bot.users[targetUserID].username+" hasn't set their local time yet. They can do this by typing **..time;set;*timezone***. *timezone* is either a TZ-formatted location (see <http://bit.do/tzlist>) or a time zone (e.g. PDT, EST, NZST). The latter may not account for Daylight Savings Time, so use the former if possible.";
                bot.sendMessage({to: channelID, message: output});
            } else {
                request("http://api.timezonedb.com/v2/get-time-zone?key=0M1HC5J1KSQ1&format=json&by=zone&zone="+userTimes[targetUserID], function(error, response, body) {
                    let answer = JSON.parse(body);
                    //console.log(JSON.stringify(answer, null, 4));
                    if (answer.status != "OK") {
                        bot.sendMessage({to: channelID, message: "<@"+userID+"> Problem detected! Response message: "+answer.message});
                    } else {
                        let time = new Date(answer.timestamp*1000);
                        userTimes[userID] = command.split(";")[2];
                        bot.sendMessage({to: channelID, message: "<@"+userID+"> "+bot.users[targetUserID].username+"'s local time is "+time.getUTCHours()+":"+(time.getUTCMinutes() <= 9 ? ("0"+time.getUTCMinutes().toString()) : time.getUTCMinutes())+" (24hr)."});
                    }
                });
            }
        }
        break;
    }
}

function char(userID, channelID, command) {
    output = "Nothing appears to have happened.";
    switch (command.split(";")[1]) {
    case "create":
        characters[userID] = {name: command.split(";")[2], hp: command.split(";")[3], inventory: [], weapon: {damage: 3, name: "Pellet Gun"}};
        output = "Created "+characters[userID].name+" with "+characters[userID].hp+" HP";
        break;
    case "check":
        output = "__**"+characters[userID].name+"**__\n**HP**: "+characters[userID].hp;
        break;
    case "attack":
        let target = mentionToID(command.split(";")[2]);
        output = characters[userID].name+" attacks "+characters[target].name+"!";
        output += "\n"+characters[userID].name+" uses "+characters[userID].weapon.name+" ("+characters[userID].weapon.damage+" damage)";
        output += "\n"+characters[target].name+" was hit.";
        characters[target].hp -= characters[userID].weapon.damage;
        output += "\n"+characters[target].name+" now has "+characters[target].hp+" HP.";
    }
    bot.sendMessage({to: channelID, message: output});
}

function eightHippo(userID, channelID, command) {
    let description = command.split(";")[1];
    if (description == undefined || description == "") {
        description = "Roses are red / Violets are blue / Here's a hippo / Just for you";
    }
    let hippos = [];
    let output = "<@"+userID+"> "+description+": ";
    for (let s in bot.servers) {
        for (let e in bot.servers[s].emojis) {
            if (bot.servers[s].emojis[e].name.toLowerCase().indexOf("hippo") != -1) hippos.push(bot.servers[s].emojis[e]);
        }
    }
    let choice = Math.floor(Math.random()*hippos.length);
    output += "<:"+hippos[choice].name+":"+hippos[choice].id+">";
    bot.sendMessage({to: channelID, message: output});
}

function epicraft(userID, channelID, command) {
    portscanner.checkPortStatus(25565, "75.155.151.151", function(error, status) {
        let server = "unknown";
        if (status == "open") server = "running";
        if (status == "closed") server = "not running";
        bot.sendMessage({to: channelID, message: "<@"+userID+"> The Epicraft server is "+server});
    });
}

function twatrDetect(userID, channelID, command) {
    let numberOnline = 0;
    let onlineList = [];
    let offlineList = [];
    for (let i = 0; i < warPeople.length; i++) {
        if (bot.servers["210597400514002945"].members[warPeople[i]].status == "online") {
            numberOnline++;
            onlineList.push(bot.users[warPeople[i]].username);
        } else {
            offlineList.push(bot.users[warPeople[i]].username);
        }
    }
    bot.sendMessage({to: channelID, message: "<@"+userID+"> "+numberOnline+"/"+warPeople.length+" WatR players are online.\nOnline: "+onlineList+"\nOffline/Idle: "+offlineList});
}

function exec(userID, channelID, command, event) {
    try {
        let output = eval(command.split(";").slice(1).join(";"));
        if (typeof(output) == "number") output = output.toString();
        if (typeof(output) == "object") output = JSON.stringify(output);
        if (output == undefined) {
            bot.sendMessage({to: channelID, message: "Command did not produce any output."});
        } else if (output.length > 1900) {
            bot.sendMessage({to: channelID, message: "Output too long. First 1900 characters of output: ```\n"+output.slice(0, 1900)+"```"});
        } else {
            bot.sendMessage({to: channelID, message: "Output of command: ```\n"+output+"```"});
        }
    } catch (e) {
        bot.sendMessage({to: channelID, message: "Error caught while running command: "+e});
    }
}

function emoji(user, userID, channelID, command, event) {
    let replaced = false;
    command = reverse(command);
    for (let s in bot.servers) {
        for (let e in bot.servers[s].emojis) {
            let name = reverse(bot.servers[s].emojis[e].name);
            if (command.search(new RegExp(":"+name+":(?!<)", "g")) != -1) {
                replaced = true;
                command = command.replace(new RegExp(":"+name+":(?!<)", "g"), ">"+reverse(bot.servers[s].emojis[e].id)+":"+name+":<");
            }
        }
    }
    if (replaced) return reverse(command);
}

function calculateDistance(userID, channelID, command) {
    if (command.split(";").length < 3) {
        bot.sendMessage({to: channelID, message: "<@"+userID+"> Try **..dist;*number1*;*number2***."});
        return;
    }
    let n1 = parseInt(command.split(";")[1]);
    let n2 = parseInt(command.split(";")[2]);
    if (isNaN(n1) || isNaN(n2)) {
        bot.sendMessage({to: channelID, message: "<@"+userID+"> Looks like one of your numbers isn't a number. Try **..dist;*number1*;*number2***."});
        return;
    }
    let dist = Math.sqrt(n1**2 + n2**2);
    bot.sendMessage({to: channelID, message: "<@"+userID+"> The distance is **"+Math.floor(dist+0.5)+"** ("+dist.toFixed(3)+")"});
}

function eightName(userID, channelID, command) {
    let description = command.split(";")[1];
    if (description == undefined || description == "") {
        description = "You got";
    }
    request("https://randomuser.me/api", function(error, response, body) {
        if (error) {
            console.log("Looks like something didn't go to plan. Try again, I guess?");
        } else {
            let firstName = JSON.parse(body).results[0].name.first;
            let lastName = JSON.parse(body).results[0].name.last;
            bot.sendMessage({to: channelID, message: "<@"+userID+"> "+description+": "+firstName.charAt(0).toUpperCase()+firstName.slice(1)+" "+lastName.charAt(0).toUpperCase()+lastName.slice(1)+"."});
        }
    });
}

function getTurnInfo(callback) {
    bot.getMessages({channelID: "304384243130171395", limit: 40}, function(error, messageArray) {
        if (!error) {
            let roundStart;
            //~ let hasSpoken = new Array(warPeople.length);
            let everyoneSpoken;
            let justFinished;
            //~ for (let i = 0; i < hasSpoken.length; i++) hasSpoken[i] = false;
            for (let i = messageArray.length-1; i >= 0; i--) { // Find the start of the round
                if (messageArray[i].content.toLowerCase().indexOf("round") != -1 && messageArray[i].author.id == "113457314106740736") roundStart = i;
            }
            //~ for (let i = 0; i < roundStart; i++) {
                //~ if (warPeople.indexOf(messageArray[i].author.id) != -1) hasSpoken[warPeople.indexOf(messageArray[i].author.id)] = true;
            //~ }
            everyoneSpoken = warPeople.every(p => messageArray.slice(0, roundStart).map(i => i.author.id).includes(p));
            justFinished = !warPeople.every(p => messageArray.slice(1, roundStart).map(i => i.author.id).includes(p)) && everyoneSpoken;
            //~ let notTaken = [];
            //~ for (let i = 0; i < warPeople.length; i++) {
                //~ if (!hasSpoken[i]) {
                    //~ notTaken.push(warPeople[i]);
                //~ }
            //~ }
            callback({everyoneSpoken: everyoneSpoken, notTaken: warPeople.filter(p => !messageArray.slice(0, roundStart).map(i => i.author.id).includes(p)), justFinished: justFinished});
        }
    });
}

function checkTurn(channelID, command) {
    let response = getTurnInfo(function(response) {
        let output = "These people have not yet taken a turn:\n";
        for (let i = 0; i < response.notTaken.length; i++) {
            output += (bot.servers["210597400514002945"].members[response.notTaken[i]].nick || bot.users[response.notTaken[i]].username) + "\n";
        }
        if (response.everyoneSpoken) {
            bot.sendMessage({to: channelID, message: "Everyone has taken a turn. <@113457314106740736>, write up the summary on Epigam!"});
        } else {
            bot.sendMessage({to: channelID, message: output});
        }
    });
}

bot.on("ready", function() { // When the bot comes online...
    console.log("I'm online!");
    if (!restarted) {
        fs.readFile("/home/pi/Documents/wwgstats.txt", "utf8", function(err, data) {
            if (!err) {
                wwgStats = JSON.parse(data);
                //console.log("Loaded wwg stats: "+JSON.stringify(wwgStats));
            }
        });
        userTimes = JSON.parse(fs.readFileSync("/home/pi/Documents/usertimes.txt", "utf8"));
        //console.log("Loaded user times: "+JSON.stringify(userTimes, null, 4));
        setInterval(function(){bot.sendMessage({to: "330164254969823233", message: "<@113852329832218627>"})}, 30000);
        //bot.leaveVoiceChannel(bot.servers["112760669178241024"].members["176580265294954507"].voice_channel_id);
        function logCTPlaying() {
            if (cytubeCheck) {
                //console.log("CyTube change detected at "+Date.now());
                let playing = fs.readFileSync("/tmp/cytube.txt").toString();
                if (playing.length > 1 && !playing.includes("0 items")) {
                    if (cytubeCurrentVideo == "" && Date.now()-cytubeLastPing > cytubePingDelay) {
                        bot.sendMessage({to: cytubeAnnouncementChannel, message: "Now playing on CyTube: **"+playing+"**\nGet in here, <@&352291384021090304>! <https://cytu.be/r/epicord>"});
                        cytubeLastPing = Date.now();
                    } else if (cytubeCurrentVideo != playing) {
                        bot.sendMessage({to: cytubeAnnouncementChannel, message: "Now playing on CyTube: **"+playing+"**\nJoin us! <https://cytu.be/r/epicord>"});
                        cytubeLastPing = Date.now();
                    }
                    cytubeCurrentVideo = playing;
                } else {
                    if (cytubeCurrentVideo.length > 1) {
                        bot.sendMessage({to: cytubeAnnouncementChannel, message: "CyTube playback ended."});
                        cytubeLastPing = Date.now();
                    }
                    cytubeCurrentVideo = "";
                }
            }
        }
        fs.writeFileSync("/tmp/cytube.txt", "");
        fs.watchFile("/tmp/cytube.txt", logCTPlaying);
    }
    bot.setPresence({game: {name: "type ..help; for help!", type: 0}});
    restarted = true;
});

bot.on("message", function(user, userID, channelID, message, event) {
    try {
        if (bot.channels[channelID].guild_id == "301392540723052544" && message.match(/^\.\.[a-z]{2,}/i)) {
            bot.sendMessage({to: channelID, message: "Sorry, commands beginning with `..` are disabled on this server. Check the pinned messages in <#342556834155986944> for information on music commands."});
            return;
        }
    } catch (e) {};
    if (botBlacklist.indexOf(userID) != -1) return;
    // Manage incoming messages and take appropriate action.
    if (message == "?help" && bot.servers["112760669178241024"].members["309960863526289408"].nick == "Dyno") {
        bot.sendMessage({to: channelID, message: "~?help"}, function(e,r) {
            if (!e) bot.deleteMessage({channelID: channelID, messageID: r.id});
        });
    }
    if (event.d.type == 6 && userID == bot.id) {
        bot.deleteMessage({channelID: channelID, messageID: event.d.id});
    }
    if (event.d.type == 6 && userID == bot.id) { // Bail! Bail!
        return;
    }
    if (event.d.type == 6 && pinServers.includes(bot.channels[channelID].guild_id)) {
        if (channelPinList[channelID]) {
            if (channelPinList[channelID].channel == "ignore") {
                return;
            }
        }
        let realPin = true;
        for (let c in channelPinList) {
            if (channelPinList[c].channel == channelID) {
                realPin = false;
                bot.deleteMessage({channelID: channelID, messageID: event.d.id});
                bot.getPinnedMessages({channelID: channelID}, function(e,r) {
                    if (!e) bot.deletePinnedMessage({channelID: channelID, messageID: r[0].id});
                });
            }
        }
        if (realPin) {
            bot.getPinnedMessages({channelID: channelID}, function(e,r) {
                if (!e) bot.getMessage({channelID: channelID, messageID: r[0].id}, function(e,r) {
                    sendToPinsChannel(channelID, r.author.id, r, userID);
                });
            });
        }
    }
    if (channelID == "304384243130171395" && userID == "113457314106740736" && message.match(/round/i)) {
        bot.getPinnedMessages({channelID: channelID}, function(e,a) {
            bot.deletePinnedMessage({channelID: channelID, messageID: a[a.length-1].id}, function(e,r) {
                bot.pinMessage({channelID: channelID, messageID: event.d.id});
            });
        });
    }
    if (channelID == "304384243130171395" && warPeople.indexOf(userID) != -1) {
        getTurnInfo(function(response) {
            if (response.justFinished) bot.sendMessage({to: channelID, message: "Everyone has taken a turn. <@113457314106740736>, write up the summary on Epigam!"});
        });
    }
    if (event.d.mentions.length == 1) {
        if (message.indexOf("FUCK YOU!") != -1 && event.d.mentions[0].id == bot.id) {
            setTimeout(function() {
                if (botLoopCounter < 5) {
                    botLoopCounter++;
                    bot.sendMessage({to: channelID, message: "<@"+userID+"> FUCK YOU!"});
                } else {
                    bot.sendMessage({to: channelID, message: "<@"+userID+"> Hmph. I guess you win this time."});
                }
            }, 1200);
        }
    }
    if (message.substr(0, 2) == "..") {
        console.log(user+": "+message);
        if (bot.users[userID].bot && userID != bot.id) {
            bot.sendMessage({to: channelID, message: "( ͡° ͜ʖ ͡°)"});
        } else {
            switch (message.split(";")[0]) {
            case "..help":
                bot.sendMessage({to: channelID, message: "Hey there <@"+userID+">! Welcome to botrac3r, proud to be the least used bot on Epicord! Maybe some usage instructions will help convince people to use me... Oh look!\nUp-to-date documentation for botrac3r is available at http://cloudrac3r.ddns.net/data/botrac3r-docs.pdf (PDF, 200kB)\nAn editable version is available at http://cloudrac3r.ddns.net/data/botrac3r-docs.odt (ODT, 11MB)\nThanks for using botrac3r!"});
                break;
            case "..yn":
                yesno(userID, channelID, message);
                break;
            case "..roll":
                roll(userID, channelID, message);
                break;
            case "..vote":
            case "..poll":
                vote(userID, channelID, message);
                break;
            case "..temp":
                convertTemp(userID, channelID, message);
                break;
            case "..proxy":
                if (!["134826546694193153"].includes(userID)) proxy(message);
                break;
            case "..wwg":
            case "..onuw":
                werewolf(user, userID, channelID, message);
                break;
            case "..flag":
                flag(channelID, message);
                break;
            case "..wiki":
                wiki(channelID, message);
                break;
            case "..unmute":
                bot.unmute({serverID: bot.channels[channelID].guild_id, userID: userID});
                break;
            case "..time":
                tz(userID, channelID, message);
                break;
            case "..choose":
                choose(userID, channelID, message);
                break;
            case "..char":
                char(userID, channelID, message);
                break;
            case "..epicraft":
                epicraft(userID, channelID, message);
                break;
            case "..twatr":
                twatrDetect(userID, channelID, message);
                break;
            case "..8hippo":
                eightHippo(userID, channelID, message);
                break;
            case "..exec":
                if (botAdmins.indexOf(userID) != -1) exec(userID, channelID, message, event);
                break;
            case "..dist":
                calculateDistance(userID, channelID, message);
                break;
            case "..8name":
                eightName(userID, channelID, message);
                break;
            case "..turn":
                checkTurn(channelID, message);
                break;
            case "..pinimage":
                if (userID == "176580265294954507") {
                    if (message.split(";")[1]) {
                        genPinImage(channelID, message.split(";").slice(1));
                    } else {
                        bot.getPinnedMessages({channelID: channelID}, function(e,r) {
                            if (!e) {
                                if (r.length == 50) {
                                    let b = [];
                                    for (let i of r.slice(25)) {
                                        b.push(i.id);
                                    }
                                    b.reverse();
                                    genPinImage(channelID, b);
                                }
                            }
                        });
                    }
                }
                break;
            //~ case "..music":
                //~ playMusic(userID, channelID, message);
                //~ break;
            case "..sfwporn":
                ruralporn(channelID, message);
                break;
            case "..stopcytube":
                fs.writeFileSync("./cytube.txt", "false");
                cytubeCheck = false;
                bot.sendMessage({to: channelID, message: "Killswitch flipped. CyTube announcements are irreversibly disabled."});
                break;
            case "..rsrb":
                require("child_process").exec("ps aux | grep -v grep | grep rnl.*start.sh", function(e,r) {
                    bot.sendMessage({to: channelID, message: "This device is "+(r ? "either hosting or" : "not hosting nor")+" ready to host RNL's bot."});
                });
                break;
            }
        }
    }
    if (reverse(message).search(/:\w*:(?!<)/) != -1 && !bot.users[userID].bot) {
        let result = emoji(user, userID, channelID, message, event);
        if (result) bot.sendMessage({to: channelID, message: "**"+user+"**: "+result});
    }
    if (message.indexOf("..lenny") != -1) {
        message = message.replace(/..lenny;/g, "( ͡° ͜ʖ ͡°)");
        message = message.replace(/..lenny/g, "( ͡° ͜ʖ ͡°)");
        bot.deleteMessage({channelID: channelID, messageID: event.d.id});
        bot.sendMessage({to: channelID, message: "**"+user+"**: "+message});
    }
    if (message.indexOf("..shrug") != -1) {
        message = message.replace(/..shrug;/g, "¯\\_(ツ)\_/¯");
        message = message.replace(/..shrug/g, "¯\\_(ツ)\_/¯");
        bot.deleteMessage({channelID: channelID, messageID: event.d.id});
        bot.sendMessage({to: channelID, message: "**"+user+"**: "+message});
    }
    if (message == "lmao" && userID == "109379894718234624") {
        bot.deleteMessage({channelID: channelID, messageID: event.d.id});
    }
    //console.log(JSON.stringify(event, null, 4));
    if (userID == "127296623779774464" && message.split(";")[0].substr(message.split(";")[0].length-8, 8) == "GAME END" && parseInt(message.split(";")[1]) == wwgCurrentGameID && wwgStrict && wwgGameStarted && !wwgVoting) {
        bot.sendMessage({to: channelID, message: "..wwg;end"});
    }
    /*if (message == "..fix;") {
        for (let i in wwgStats) {
            wwgStats[i].username = bot.users[i].username;
            wwgStats[i].avatar = bot.users[i].avatar;
        }
        fs.writeFile("/home/pi/Documents/wwgstats.txt", JSON.stringify(wwgStats, null, 2));
        fs.writeFile("/var/www/html/stats.js", "let wwgStats = "+JSON.stringify(wwgStats)+";");
        bot.sendMessage({to: channelID, message: "OK."});
    }*/
    if (message.match(/play/i) && message.charAt(0).match(/\w/)) {
        let vRegexes = [/https?:\/\/.*youtube\.co.*\/watch\?.*v=([-_a-zA-Z0-9]{10,})/, /https?:\/\/youtu\.be\/([-_a-zA-Z0-9]{10,})/];
        let pRegexes = [/https?:\/\/.*youtube\.co.*\/playlist\?.*list=([-_a-zA-Z0-9]+)/];
        let started = false;
        for (let r = 0; r < vRegexes.length; r++) {
            if (message.match(vRegexes[r]) && !started) {
                started = true;
                MBaddToQueue(message.match(vRegexes[r])[1], userID, channelID, message.match(/next/i));
                r = vRegexes.length;
            }
        }
        if (message.match(pRegexes[0]) && !started) {
            let a = [];
            started = true;
            fetchPlaylist();
            function fetchPlaylist(token) {
                request("https://www.googleapis.com/youtube/v3/playlistItems/?playlistId="+message.match(pRegexes[0])[1]+"&part=snippet%2CcontentDetails&maxResults=50&key="+ytToken+(token ? "&pageToken="+token : ""), function(e,r,b) {
                    if (!e) {
                        if (b.error) {
                            console.log(JSON.parse(b));
                        } else {
                            for (let v of JSON.parse(b).items) {
                                a.push(v.contentDetails.videoId);
                            }
                            if (JSON.parse(b).nextPageToken) {
                                bot.simulateTyping(channelID);
                                fetchPlaylist(JSON.parse(b).nextPageToken);
                            } else {
                                if (message.match(/item ([0-9]+)/i)) a = a.slice(parseInt(message.match(/item ([0-9]+)/i)[1])-1, 1);
                                if (message.match(/\s([0-9+])\s?-\s?([0-9+])/)) a = a.slice(parseInt(message.match(/\s([0-9+])\s?-\s?([0-9+])/)[1])-1, parseInt(message.match(/\s([0-9+])\s?-\s?([0-9+])/)[2]));
                                if (message.match(/start[a-z]* at ([0-9]+)/i)) a = a.slice(parseInt(message.match(/start[a-z]* at ([0-9]+)/i)[1])-1);
                                if (message.match(/random/i)) {
                                    let c = [];
                                    while (a.length > 0) {
                                        c.push(a[Math.floor(Math.random()*a.length)]);
                                    }
                                    a = c;
                                }
                                MBaddToQueue(a, userID, channelID, message.match(/next/i));
                            }
                        }
                    } else {
                        console.log(e);
                    }
                });
            }
        }
        if (message.match(MBfRegex) && !started) {
            started = true;
            MBaddToQueue(message.match(MBfRegex)[0], userID, channelID, message.match(MBfRegex)[0]);
        }
        if (message == "play start" && !started && userID != bot.id) {
            started = true;
            MBaddToQueue(undefined, userID, channelID);
        }
    }
    let search = message.match(/^(youtube|yt) search (.{4,})$/i);
    if (search) {
        request({method: "GET", url: "https://www.googleapis.com/youtube/v3/search/", qs: {
            q: search[2],
            part: "snippet",
            type: "video",
            maxResults: "1",
            key: ytToken
        }}, function (e,r,b) {
            if (JSON.parse(b).error) {
                console.log(b);
            } else {
                b = JSON.parse(b).items[0];
                bot.sendMessage({to: channelID, embed: {
                    title: "YouTube search results",
                    description: "Query: \""+search[2]+"\"\nDisplaying the first result only",
                    fields: [
                        {
                            name: "Title",
                            value: b.snippet.title,
                        },{
                            name: "Uploader",
                            value: b.snippet.channelTitle,
                        }
                    ],
                    image: {
                        url: b.snippet.thumbnails.default.url
                    },
                    color: 0xE32E28,
                    footer: {
                        text: "Click the play reaction to queue this video"
                    }
                }}, function(e,r) { if (!e) {
                    bot.addReaction({channelID: channelID, messageID: r.id, reaction: "▶"});
                    MBsearches.push({url: b.id.videoId, messageID: r.id});
                }});
            }
        });
    }
});

bot.on("presence", function(user, userID, status, game, event) {
    if (botBlacklist.indexOf(userID) != -1) return;
    if (userID == "113852329832218627") {
        bot.sendMessage({to: "112760669178241024", message: "@everyone <@&212762309364285440> <@113852329832218627> <@&212762309364285440> @everyone"});
        let pings = "";
        for (let i in bot.servers["112760669178241024"].members) pings += "<@"+i+"> ";
        bot.sendMessage({to: "112760669178241024", message: pings+" Didn't you realise that our god, dlcs18, has finally and truely come?"});
    }
    setTimeout(function() {
        let allOnline = true;
        for (let i = 0; i < warPeople.length; i++) {
            if (bot.servers["210597400514002945"].members[warPeople[i]].status != "online") allOnline = false;
        }
        if (!warPeopleOnline && allOnline) {
            warPeopleOnline = true;
            if ((lastPing+1000*60*60*2) < Date.now()) {
                getTurnInfo(function(response) {
                    if (!response.everyoneSpoken) {
                        bot.sendMessage({to: "302683438010466305", message: "You're all online, and <@"+response.notTaken.join("> and <@")+"> still "+plural("need", (response.notTaken.length != 1))+" to decide on an action."});
                    }
                });
                console.log("Sent twatr message (lastPing: "+lastPing+", test: "+(lastPing+1000*60*60*2)+", now: "+Date.now()+")");
                lastPing = Date.now();
            } else {
                console.log("Didn't send twatr message: not enough time has passed (lastPing: "+lastPing+", test: "+(lastPing+1000*60*60*2)+", now: "+Date.now()+")");
            }
        } else if (warPeopleOnline && !allOnline) {
            warPeopleOnline = false;
        }
    }, 500);
});

bot.on("disconnect", function() {
    console.log("Bot disconnected. Reconnecting...");
    bot.connect();
});

bot.on("any", function(event) {
    if (event.t == "MESSAGE_REACTION_ADD") {
        if (event.d.emoji.name == "markedforpinning" && event.d.emoji.id == "292130109215735808" && bot.channels[event.d.channel_id].guild_id == "112760669178241024") {
            bot.getMessage({channelID: event.d.channel_id, messageID: event.d.message_id}, function(err, res) {
                if (!err) {
                    let ok = true;
                    for (let r of res.reactions) {
                        if (r.emoji.name == "markedforpinning" && r.count != 1) ok = false;
                    }
                    if (ok) {
                        sendToPinsChannel(event.d.channel_id, res.author.id, res, event.d.user_id);
                    }
                }
            });
        }
        if (event.d.emoji.name == "▶" && event.d.user_id != bot.id) {
            s = 0;
            while (s < MBsearches.length) {
                if (MBsearches[s].messageID == event.d.message_id) {
                    MBaddToQueue(MBsearches[s].url, event.d.user_id, event.d.channel_id);
                    MBsearches.splice(s, 1);
                    s = MBsearches.length;
                }
                s++;
            }
        }
    }
});