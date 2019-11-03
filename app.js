const Telegraf = require('telegraf')
const AWS = require('aws-sdk')
const Fs = require('fs')
const bot = new Telegraf('<BOT_TOKEN>')

const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'eu-central-1'
})

const AllowedIds = [<IDS...>]

bot.start((ctx) => ctx.reply('I get you down, be ready.'))
bot.help((ctx) => ctx.reply('I mock you, that\'s what I do.'))
bot.on('text', (ctx) => {
	if (!AllowedIds.includes(ctx.message.from.id)) {
		ctx.reply('Only @BeLuckyDaf and his frineds can use this bot, tell him your ID: ' + ctx.message.from.id)
		return
	}

	let params = {
		'Text': ctx.message.text,
		'OutputFormat': 'mp3',
		'VoiceId': 'Kimberly'
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
					console.log("Message ID: " + ctx.message.message_id + ", from: " + ctx.from.username + " (" + ctx.from.id + "): " + params.Text)
				})
			}
		}
	})
})

bot.launch()
