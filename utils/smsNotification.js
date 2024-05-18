"use strict";
var AWS = require("aws-sdk");
const { promisify } = require('util');

exports.sendOtp = async (senderMobileNumber, message) => {
  var originationNumber = process.env.AWS_TOLL_FREE_NUMBER;
  var destinationNumber = senderMobileNumber;
  var applicationId = process.env.APPID;
  var messageType = process.env.MESSAGE_TYPE;
  var registeredKeyword = process.env.REGSITERED_KEYWORD;
  var senderId = process.env.SENDERID;
  AWS.config.update({
    region: process.env.AWS_REGION,
    apiVersion: "latest",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  // Specify the region.
  // AWS.config.update({ region: aws_region });

  //Create a new Pinpoint object.
  var pinpoint = new AWS.Pinpoint();

  // Specify the parameters to pass to the API.
  var params = {
    ApplicationId: applicationId,
    MessageRequest: {
      Addresses: {
        [destinationNumber]: {
          ChannelType: "SMS",
        },
      },
      MessageConfiguration: {
        SMSMessage: {
          Body: message,
          Keyword: registeredKeyword,
          MessageType: messageType,
          OriginationNumber: originationNumber,
          SenderId: senderId,
        },
      },
    },
  };

  // promisify the sendMessages method
  const sendMessagesPromise = promisify(pinpoint.sendMessages).bind(pinpoint);

  //Send the email
  const data = await sendMessagesPromise(params);

  if(data?.MessageResponse?.Result?.[senderMobileNumber]?.DeliveryStatus !== 'SUCCESSFUL') {
    return {
      success: false,
      messageId: data?.MessageResponse?.Result?.[senderMobileNumber]?.DeliveryStatus
    }
  }else{
    return {
      success: true,
      messageId: data?.MessageResponse?.Result?.[senderMobileNumber]?.MessageId
    }
  }
};
