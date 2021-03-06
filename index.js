const qrcode = require('qrcode-terminal')
const Client = require('whatsapp_engine_js')
const imageToBase64 = require('image-to-base64')
const { MessageMedia } = require('whatsapp_engine_js/src/structures')

const fs = require('fs')
const SESSION_FILE_PATH = './session.json'
let sessionCfg
if (fs.existsSync(SESSION_FILE_PATH)) {
	sessionCfg = require(SESSION_FILE_PATH)
}

const client = new Client({ puppeteer: { headless: true }, session: sessionCfg })
const number = "**********"
client.on('qr', qr => {
	qrcode.generate(qr, { small: true })
})

const validateAndSendMessage = (number, cb) => {
	client.getAccountId(number).then(account => {
		if (account.isValid) {
			cb(account)
		} else {
			console.log("Invalid Number ", number)
		}
	})
}

const sendTextMessage = () => {
	validateAndSendMessage(number, (account) => {
		client.sendMessage(account.id, "Teste mensagem de *texto comum* ❤️")
	})
}

const sendBase64IimageMessage = () => {
	validateAndSendMessage(number, (account) => {
		imageToBase64("./assets/image.png").then(photo => {
			const media = new MessageMedia('image/png', photo)
			client.sendMessage(account.id, media, { caption: 'Teste imagem *base64* 📷' })
		}).catch(error => console.log(error))
	})
}

const sendImageMessage = () => {
	validateAndSendMessage(number, (account) => {
		const media = MessageMedia.fromFilePath('./assets/image.png')
		client.sendMessage(account.id, media, { caption: "Teste imagem *apartir de um arquivo png* 💡" })
	})
}

const sendSendAudioMessage = () => {
	validateAndSendMessage(number, (account) => {
		const media = MessageMedia.fromFilePath('./assets/audio.mp3')
		client.sendMessage(account.id, media)
	})
}

client.on('ready', () => {
	console.log("client is ready")
	sendSendAudioMessage()
	sendTextMessage()
	sendImageMessage()
	sendBase64IimageMessage()
})

client.on('auth_failure', () => {
	console.log("auth failed")
})

client.on('authenticated', (session) => {
	console.log('Authenticated')
	sessionCfg = session
	fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
		if (err) {
			console.error(err)
		}
	})
})

client.on('message_create', message => {
	console.log(`sent message to ${message.to}`)
})

client.on('message', async msg => {
	console.log('message received', msg)
})

client.initialize()