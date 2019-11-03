const Telegraf = require('telegraf')
const AWS = require('aws-sdk')
const Fs = require('fs')
const Telegram = require('telegraf/telegram')

const token = "<TOKEN>"
const bot = new Telegraf(token)
const telegram = new Telegram(token)

const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'eu-central-1'
})

const AllowedIds = [146505982, <ID>...]
const BeLuckyDaf = 146505982 

bot.start((ctx) => ctx.reply('First, send your ID (' + ctx.message.from.id + ') to @BeLuckyDaf, he will add you to the whitelist.'))
bot.help((ctx) => ctx.reply('Send me a message and I will respond with voice.'))

bot.on('text', (ctx) => {
        if (!AllowedIds.includes(ctx.message.from.id)) {
            ctx.reply('Only @BeLuckyDaf and his friends can use this bot, tell him your ID: ' + ctx.message.from.id)
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
