var net = require('net');
var readline = require('readline');

var colors = require('colors');


var host = process.argv[2] || 'localhost';

/*
 * Port to connect to.
 */
var port = 6666;

/*
 * Inteface to `readline` library
 */
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


var client = net.connect(port, host)
client.setEncoding('utf-8');

/*
 * Name of the speaking chat robot
 */
var bot = 'Ivashka \u2603 '.green;

/*
 * Name of you :)
 */
var me = 'me'.magenta;

/*
 * Prepare a stage for a speaker
 *
 * @param who {string} A speaker
 */
function setPrompt(who) {
  rl.setPrompt(' ' + who + ' > '.grey);
  rl.prompt(true);
}

/*
 * Say something to chat
 *
 * @param who {string} A speaker name
 * @param what {string} What is being said
 */
function say(who, what) {
  if (who === bot) what = what.grey;

  // remember what we were going to say
  var line = rl.line;

  // delete current line
  rl.write(null, {
    ctrl: true,
    name: 'u'
  });

  // say message
  setPrompt(who);
  console.log(what);

  // proceed from where we were interrupted
  setPrompt(me);
  rl.write(line);
}

/*
 * Prints a message and exits.
 *
 * @param message {string} A message to print on exit.
 */
function sayBye(message) {
  setPrompt(bot);
  console.log(message.grey);
  process.exit(0);
}

client.on('data', function (data) {
  var message = JSON.parse(data);

  if (message.author === 'Welcome') {
    process.stdout.write('\n > Welcome to ' + bot + ' chat!' +
      '\n > ' + ('' + message.text).green + ' other people are connected at this time.' +
      '\n > Please write your name and press <enter>: ');
  } else if (message.author === 'Ivashka') {

    // If it is Ivashka, we need to colorize him :)
    say(bot, message.text);
  } else {
    say(message.author.blue, message.text);
  }

});

client.on('end', function () {
  sayBye('Connection has been dropped...');
});

rl.on('line', function (line) {
  line = line.trim();
  if (line.startsWith('/')) {
    switch (line) {
    case '/quit':
      rl.close();
      break;
    case '/help':
      say(bot, 'Yep, below is what I already can:' + 
          '\n\t' + 'quit'.white + ' - exit from chat'.grey +
          '\n\t' + 'help'.white + ' - print this help'.grey);
      break;
    default:
      say(bot, 'Sorry, don\'t know this command yet. :('); // smiley
    }
  } else {
    client.write(line.trim());
    setPrompt(me);
  }
}).on('close', function () {
  sayBye('Have a great day!');
})

.on('SIGINT', function () {
  sayBye('Have a great day!');
})

.on('SIGTSTP', function () {

  // This will override SIGTSTP and prevent the program from going to the
  // background.
  say(bot, 'Caught SIGTSTP.');
}).on('SIGCONT', function () {

  // `prompt` will automatically resume the stream
  rl.prompt();
});

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str) {
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str) {
    return this.slice(-str.length) == str;
  };
}