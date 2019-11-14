const Telegraf = require('telegraf')
const AWS = require('aws-sdk')
const Fs = require('fs')
const Telegram = require('telegraf/telegram')

const bot = new Telegraf("<TOKEN>")
const telegram = new Telegram("<TOKEN>")

const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'eu-central-1'
})

const AllowedIds = [146505982, <IDs>...]
const BeLuckyDaf = 146505982 

SelfAllowed = []
Banned = []
CharacterLimit = 500

bot.start((ctx) => ctx.reply('First, use the \'/access\' command to get yourself added to the whitelist, type \'/help\' afterwards.'))
bot.help((ctx) => ctx.reply('Send me a message and I will respond with voice.'))

bot.command('access', (ctx) => {
        if (AllowedIds.includes(ctx.message.from.id) || SelfAllowed.includes(ctx.message.from.id)) {
            ctx.reply('You already have access to the bot.')
            return
        }

        let command = ctx.message.text.split(/[ ]+/)
        if (command.length < 2) ctx.reply('Do you agree with the rules? [y/n]')
        else {
                if (command[1] === 'y' || command[1] === 'Y') {
                        AllowedIds.push(ctx.message.from.id)
                        ctx.reply('You are now allowed to use the bot.')
                } else {
                        ctx.reply('Okay. Get back when you think you\'re ready.')
                }
        }
})

bot.command('limit', (ctx) => {
        if (ctx.message.from.id !== BeLuckyDaf) {
                ctx.reply('Not allowed.')
                return
        }

        let command = ctx.message.text.split(/[ ]+/)
        if (command.length !== 2) {
                ctx.reply('Wrong argument count.')
                return
        }

        let limit = Number(command[1])
        if (limit < 1 || isNaN(limit)) {
                ctx.reply('Invalid limit number.')
                return
        }

        CharacterLimit = limit
        ctx.reply(`Character limit set to ${CharacterLimit}.`)
})

bot.command('pardon', (ctx) => {
        if (ctx.message.from.id !== BeLuckyDaf) {
                ctx.reply('Not allowed.')
                return
        }

        let command = ctx.message.text.split(/[ ]+/)
        if (command.length !== 2) {
                ctx.reply('Wrong argument count.')
                return
        }

        let id = Number(command[1])
        if (id < 1 || isNaN(id)) {
                ctx.reply('Invalid user id.')
                return
        }

        let index = Banned.indexOf(id)
        if (index === -1) {
                ctx.reply('User is not banned.')
                return
        }
        Banned.splice(index, 1)
        ctx.reply(`UserId ${id} was removed from the blacklist.`)
})

bot.on('text', (ctx) => {
        if (!AllowedIds.includes(ctx.message.from.id) && !SelfAllowed.includes(ctx.message.from.id)) {
            ctx.reply('Type \'/access\' to request access to the bot. By using that command, you agree not send text ' +
                      `larger than ${CharacterLimit} characters.`)
            return
        }

        if (ctx.message.text.length > CharacterLimit && !Banned.includes(ctx.message.from.id)) {
                Banned.push(ctx.message.from.id)
                ctx.reply(`You are now banned from the bot, (UserId: ${ctx.message.from.id}). If you think it\'s a mistake, write to @BeLuckyDaf.`)
                return
        }

        if (Banned.includes(ctx.message.from.id)) {
                ctx.reply('You are banned. Write to @BeLuckyDaf.')
                return
        }

        let params = {
            'Text': ctx.message.text,
            'OutputFormat': 'mp3',
            'VoiceId': 'Joanna'
        }

        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                console.log(err.code)
            } else if (data) {
                if (data.AudioStream instanceof Buffer) {
                    let filename = "./recordings/" + ctx.message.message_id  + ".mp3"
                    ctx.replyWithVoice({
                        source: data.AudioStream
                    })
                    Fs.writeFile(filename, data.AudioStream, function(err) {
                        if (err) {
                            return console.log(err)
                        }
                        let logmsg = `Message ID: ` + ctx.message.message_id + ", from: @" + ctx.from.username + " (" + ctx.from.id + "): " + "\"" + params.Text + "\""
                        telegram.sendMessage(BeLuckyDaf, logmsg)
                    })
                }
            }
        })
})

bot.launch()
