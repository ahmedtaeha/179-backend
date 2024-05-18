'use strict';
const AWS = require('aws-sdk');
const { promisify } = require('util');

exports.sendEmail = async (email, email_subject, email_body, email_body_html = '') => {
  // const email_to = req.body.to;
  // const email_subject = req.body.subject;
  // const email_body = req.body.body_text;
  // const email_body_html = req.body.body_html;

  const senderAddress = process.env.SENDER_EMAIL;

  var toAddress = email;

  const appId = process.env.APPID;

  var subject = email_subject;

  var body_text = '';

  var body_html = email_body;

  var charset = 'UTF-8';

  AWS.config.update({
    region: process.env.AWS_REGION,
    apiVersion: process.env.API_VERSION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  //Create a new Pinpoint object.
  const pinpoint = new AWS.Pinpoint();

  // Specify the parameters to pass to the API.
  const params = {
    ApplicationId: appId,
    MessageRequest: {
      Addresses: {
        [toAddress]: {
          ChannelType: 'EMAIL',
        },
      },
      MessageConfiguration: {
        EmailMessage: {
          FromAddress: senderAddress,
          SimpleEmail: {
            Subject: {
              Charset: charset,
              Data: subject,
            },
            HtmlPart: {
              Charset: charset,
              Data: body_html,
            },
            TextPart: {
              Charset: charset,
              Data: body_text,
            },
          },
        },
      },
    },
  };

  // promisify the sendMessages method
  const sendMessagesPromise = promisify(pinpoint.sendMessages).bind(pinpoint);

  //Send the email
  const data = await sendMessagesPromise(params);

  if(data?.MessageResponse?.Result?.[toAddress]?.DeliveryStatus !== 'SUCCESSFUL') {
    return {
      success: false,
      messageId: data?.MessageResponse?.Result?.[toAddress]?.DeliveryStatus,
      error: data?.MessageResponse?.Result?.[toAddress]?.StatusMessage
    }
  }else{
    return {
      success: true,
      messageId: data?.MessageResponse?.Result?.[toAddress]?.MessageId
    }
  }
};

