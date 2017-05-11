#!/usr/local/bin/node
var botTestingMode = false;

var Discord = require("discord.io");
var spawn = require("child_process").spawn;
var fs = require("fs");
var request = require("request");
var portscanner = require("portscanner");
let botToken = fs.readFileSync("/home/pi/Documents/botrac3r/token.txt", "utf8").split("\n")[0];
var bot = new Discord.Client({
    token: botToken,
    autorun: true
});

const botAdmins = ["176580265294954507", "117661708092309509", "238459957811478529"];
const warPeople = ["113457314106740736", "112767329347104768", "176580265294954507", "112760500130975744", "117661708092309509", "116718249567059974"];
let warPeopleOnline = false;
var restarted = false;

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
var wwgStrict = true;
var wwgCurrentGameID = 0;
var wwgStats = {};

var voteList = [];
let userTimes = {};
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

var yesnoOptions = ["Yes.", "No.", "Yes.", "No.", "Yes, definitely!", "Yes, of course!", "Well, I guess so...", "That doesn't sound like a good idea.", "No, of course not!", "No way, are you mad?", ">///<\njust kidding, the answer is yes", ">///<\njust kidding, the answer is no", "That's completely absurd.", "Sounds good!", "Probably not.", "Without a doubt!", "Is a giraffe's neck longer than your toenails?", "Is Jutomi female?", "Ugh. Are you serious?", "Fine, if you insist."]; // Possible answers for yesno

let characters = {};

function mentionToID(string) {
    tmp = string.split(">")[0];
    return tmp.substr(tmp.length-18);
}

function pad(string, length, filler) {
    if (typeof(string) == "number") string = string.toString();
    return string+yes(filler, length-string.length);
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
                    bot.sendMessage({to: wwgChannel, message: "All players have performed their actions. Now start talking!\nIf you want to play with a timer, don't forget to start it now!"});
                    for (const i of wwgPlayers) {
                        bot.unmute({serverID: bot.channels[wwgChannel].guild_id, userID: i});
                    }
                    if (wwgTimer != 0) {
                        if (wwgStrict) {
                            bot.sendMessage({to: wwgChannel, message: "<@127296623779774464> remind "+wwgTimer+" minutes GAME END;"+wwgCurrentGameID});
                        } else {
                            bot.sendMessage({to: wwgChannel, message: "<@127296623779774464> remind "+wwgTimer+" minutes GAME END"});
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
                wwgRoleConfig = [[0, 1, 1, 2, 3, 4], [0, 8, 1, 1, 2, 3, 4], [7, 8, 1, 1, 2, 3, 4, 5], [6, 6, 7, 1, 1, 2, 3, 4, 9], [6, 6, 7, 8, 1, 1, 2, 3, 4, 9], [9, 6, 6, 7, 8, 1, 1, 2, 3, 4, 5], [0, 9, 6, 6, 7, 8, 1, 1, 2, 3, 4, 5]];
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
            output = output.split(0, output.length-3);
            output += "!";
        }
        break;
    case "check":
        if (voteList.length == 0) {
            output = "There are no polls... yet.";
        } else {
            if (command.split(";")[2] === undefined || command.split(";")[2] === NaN) {
                output = "Ongoing polls: ";
                for (var i = 0; i < voteList.length; i++) {
                    output += "\n**"+(i+1)+"**: "+voteList[i].title+" (<@"+voteList[i].startedBy+">)";
                }
                output += "\nType **..poll;check;*pollNumber*** for more information about a poll.";
            } else {
                var pollNumber = parseInt(command.split(";")[2])-1;
                output = "Poll: **"+voteList[pollNumber].title+"** (<@"+voteList[pollNumber].startedBy+">)";
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

function proxy(command) {
    var channelID = command.split(";")[1];
    var message = command.split(";")[2];
    bot.sendMessage({to: channelID, message: "Message sent via proxy:```"+message+"```"});
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
    var emoji = [];
    if (command.split(";")[3] != undefined) {
        for (var i = 0; i < 3; i++) {
            if (command.split(";")[i+1].indexOf("<") != -1 && command.split(";")[i+1].indexOf(">") != -1) {
                emoji[i] = "<"+command.split(";")[i+1].split("<")[1].split(">")[0]+">";
            } else {
                emoji[i] = command.split(";")[i+1];
            }
        }
        output = emoji[2]+emoji[1]+emoji[2]+emoji[1]+emoji[0]+emoji[0]+emoji[0]+emoji[0]+"\n"+emoji[1]+emoji[2]+emoji[1]+emoji[2]+emoji[1]+emoji[1]+emoji[1]+emoji[1]+"\n"+emoji[2]+emoji[1]+emoji[2]+emoji[1]+emoji[0]+emoji[0]+emoji[0]+emoji[0]+"\n"+emoji[1]+emoji[2]+emoji[1]+emoji[2]+emoji[1]+emoji[1]+emoji[1]+emoji[1]+"\n"+emoji[0]+emoji[0]+emoji[0]+emoji[0]+emoji[0]+emoji[0]+emoji[0]+emoji[0]+"\n"+emoji[1]+emoji[1]+emoji[1]+emoji[1]+emoji[1]+emoji[1]+emoji[1]+emoji[1]+"\n"+emoji[0]+emoji[0]+emoji[0]+emoji[0]+emoji[0]+emoji[0]+emoji[0]+emoji[0];
        bot.sendMessage({to: channelID, message: output});
    }
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
        });
        userTimes[userID] = command.split(";")[2];
        fs.writeFile("/home/pi/Documents/usertimes.txt", JSON.stringify(userTimes));
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
    for (let e in bot.servers[bot.channels[channelID].guild_id].emojis) {
        if (bot.servers[bot.channels[channelID].guild_id].emojis[e].name.toLowerCase().indexOf("hippo") != -1) hippos.push(bot.servers[bot.channels[channelID].guild_id].emojis[e]);
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
    }
    if (botTestingMode) {
        bot.setPresence({game: {name: "type ..help; for help!"}});
    } else {
        if (!restarted) {
            //bot.sendMessage({to: "160197704226439168", message: "(bot restarted)"});
        }
        bot.setPresence({game: {name: "type ..help; for help!"}});
    }
    restarted = true;
});

bot.on("message", function(user, userID, channelID, message, event) {
    // Manage incoming messages and take appropriate action.
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
                proxy(message);
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
            }
        }
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
});

bot.on("presence", function(user, userID, status, game, event) {
    if (userID == "113340068197859328" && status == "online") {
        bot.getPinnedMessages({channelID: "112760669178241024"}, function(e,r) {
            if (r != undefined) {
                if (r.length == 50) {
                    bot.sendMessage({to: "113340068197859328", message: "Hey <@113340068197859328>! There's "+r.length+" pinned messages on Epicord right now, so we can't pin any more! We're relying on you to clear them!\nIf these messages get annoying, either clear the pins more often, or DM cloudrac3r about your frustrations."});
                }
            }
        });
    }
    setTimeout(function() {
        let allOnline = true;
        for (let i = 0; i < warPeople.length; i++) {
            if (bot.servers["210597400514002945"].members[warPeople[i]].status != "online") allOnline = false;
        }
        if (!warPeopleOnline && allOnline) {
            warPeopleOnline = true;
            bot.sendMessage({to: "302683438010466305", message: "<@&307751497230188544> sup fam"});
        } else if (warPeopleOnline && !allOnline) {
            warPeopleOnline = false;
        }
    }, 500);
});

bot.on("disconnect", function() {
    console.log("Bot disconnected. Reconnecting...");
    bot.connect();
});
