const config = require('./config');
const logger = require('./logger');
const nodemailer = require('nodemailer');
const axios = require('axios');
/**
 * 发送邮件给指定用户
 * @param {string[]} recipients - 收件人邮箱地址数组
 * @param {string} subject - 邮件主题
 * @param {string} content - 邮件内容
 * @returns {Promise<boolean>} - 发送结果
 */
async function sendEmail(recipients, subject, content) {
    try {
        // 创建邮件传输对象
        const transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.secure,
            auth: {
                user: config.email.auth.user,
                pass: config.email.auth.pass
            }
        });

        // 发送邮件
        const info = await transporter.sendMail({
            from: '"系统通知" <' + config.email.auth.user + '>',
            to: recipients.join(','),
            subject: subject,
            html: content + '<br><a href="' + config.email.linkUrl + '">点击查看详情</a>'
        });

        logger.info('邮件发送成功:', info.messageId);
        return true;
    } catch (error) {
        logger.error('邮件发送失败:', error);
        return false;
    }
}

/**
 * 发送Bot群通知消息
 * @param {string} title - 消息标题
 * @param {string} content - 消息内容
 * @returns {Promise<boolean>} - 发送结果
 */
async function sendBot(title, content) {
    try {
        // 构建富文本消息体
        const message = {
            "msg_type": "interactive",
            "card": {
                "elements": [{
                    "tag": "div",
                    "text": {
                        "content": content,
                        "tag": "lark_md"
                    }
                }, {
                    "tag": "action",
                    "actions": [{
                        "tag": "button",
                        "text": {
                            "content": "点击查看详情",
                            "tag": "plain_text"
                        },
                        "url": config.bot.linkUrl,
                        "type": "default"
                    }]
                }],
                "header": {
                    "title": {
                        "content": title,
                        "tag": "plain_text"
                    }
                }
            }
        };

        // 发送请求到Bot的Webhook
        const response = await axios.post(config.bot.webhookUrl, message);
        
        if (response.status === 200) {
            logger.info('Bot消息发送成功');
            return true;
        } else {
            logger.error('Bot消息发送失败:', response.data);
            return false;
        }
    } catch (error) {
        logger.error('Bot消息发送失败:', error);
        return false;
    }
}

module.exports = {
    sendEmail,
    sendBot
};
