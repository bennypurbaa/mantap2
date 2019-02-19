'use strict'
//Changed by Localheartzst1337
const Client = require('instagram-private-api').V1;
const delay = require('delay');
const chalk = require('chalk');
const inquirer = require('inquirer');

const User = [
{
    type:'input',
    name:'username',
    message:'Insert Username:',
    validate: function(value){
      if(!value) return 'Can\'t Empty';
      return true;
  }
},
{
    type:'password',
    name:'password',
    message:'Insert Password:',
    mask:'*',
    validate: function(value){
      if(!value) return 'Can\'t Empty';
      return true;
  }
}
]

const Login = async function(User){

    /** Save Account **/
    const Device = new Client.Device(User.username);
    const Storage = new Client.CookieMemoryStorage();
    const session = new Client.Session(Device, Storage);

    try {
        await Client.Session.create(Device, Storage, User.username, User.password)
        const account = await session.getAccount();
        return Promise.resolve({session,account});
    } catch (err) {
        return Promise.reject(err);
    }

}

const Timeline = async function(session,count,cursor){
    var getCursor;
    count++;
    /** New Feed **/
    const feed = new Client.Feed.Timeline(session);
    
    /** Cursor Detect **/
    if (cursor) {
        feed.setCursor(cursor);
    }

    try {
        const media = await feed.get();
        console.log('\n[+] Detect Cursor => %s\n', count);
        await Promise.all(media.map(async(media) => {
            Like(session,media);
        }));
        if (count < 3) {
            getCursor = await feed.getCursor();
            await Timeline(session,count,getCursor);
        } else {
            console.log('[-] Repeat from scratch (Delay 60s)\n');
            await delay(60000);
            count=0;
            await Timeline(session,count);
        }
    } catch(err) {
        return Promise.reject(err);
    }

}

const Like = async function(session,media){

    try {
        var timeNow = new Date();
        timeNow = `${timeNow.getHours()}:${timeNow.getMinutes()}:${timeNow.getSeconds()}`
        if (media.params.hasLiked === false){
            const Like = await Client.Like.create(session, media.params.id);
            console.log(chalk`{bold.cyan |> Media ID: ${media.id}}]\n|> {bold.blue ${timeNow}}: Username: [${media.params.user.username}] => [{bold.green Success Liked}]\n`);
        } else {
            console.log(chalk`{bold.cyan |> Media ID: ${media.id}}]\n|> {bold.blue ${timeNow}}: Username: [${media.params.user.username}] => [{bold.red Already Liked}]\n`);
        }
    } catch (err) {
        return Promise.reject(err);
    }

}

const Excute = async function(User){
    try {
        const count = 0;
        const doLogin = await Login(User);
        await Timeline(doLogin.session,count);
    } catch (err) {
        console.log(err);
    }
}
console.log(chalk`{bold.green
  Ξ TITLE  : BOTLIKE TIMELINE v2 [Automatic]
  Ξ CODE   : CYBER SCREAMER CCOCOT (ccocot@bc0de.net)
  Ξ STATUS : ITTYW : {bold.red Not Supported!}}
      `);

inquirer.prompt(User)
.then(answers => {
    Excute({
        username:answers.username,
        password:answers.password
    });
})
