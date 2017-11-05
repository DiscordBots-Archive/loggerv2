import { badMessageCheck } from '../system/utils'
import { sendToLog } from '../system/modlog'
import { Redis } from '../Logger'
import { updateGuildDocument } from '../handlers/update'

module.exports = {
  name: 'messageUpdate',
  type: 'messageUpdate',
  toggleable: true,
  run: function (bot, raw) {
    let newMessage = raw.newMessage
    let oldMessage = raw.oldMessage
    if (newMessage.author.id === bot.user.id) {

    } else if (newMessage.author.bot) {
      Redis.existsAsync(`${newMessage.channel.guild.id}:logBots`).then((exist) => {
        if (exist) {
          Redis.getAsync(`${newMessage.channel.guild.id}:logBots`).then((res) => {
            if (res === 'true') {
              processMessage(newMessage, oldMessage)
            }
          })
        } else {
          updateGuildDocument(newMessage.channel.guild.id, { 'logBots': false })
        }
      })
    } else if (!badMessageCheck(newMessage.content) && newMessage.content !== oldMessage.content) {
      processMessage(newMessage, oldMessage)
    }
    function processMessage (newMessage, oldMessage) {
      let obj = {
        guildID: newMessage.channel.guild.id,
        channelID: newMessage.channel.id,
        type: 'Message Updated',
          changed: `► Previously: \`${oldMessage.content.replace(/\"/g, '"').replace(/`/g, '')}\`\n► Now: \`${newMessage.content.replace(/\"/g, '"').replace(/`/g, '')}\`\n► From **${newMessage.channel.name}**.\n► Message ID: ${newMessage.id}`, // eslint-disable-line
        color: 8351671,
        against: {
          id: `${newMessage.author.id}`,
          username: `${newMessage.author.username}`,
          discriminator: `${newMessage.author.discriminator}`,
          avatar: `${newMessage.author.avatar}`
        }
      }
      if (newMessage.author.avatarURL) {
        obj.against.thumbnail = `https://cdn.discordapp.com/avatars/${newMessage.author.id}/${newMessage.author.avatar}.jpg`
      }
      sendToLog(bot, obj)
    }
  }
}
