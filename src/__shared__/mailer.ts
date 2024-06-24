import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';
import { config } from './config';
import sgMailer from '@sendgrid/mail';

const credentials = {
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  sessionToken: config.AWS_SESSION_TOKEN,
};

const ses = new SESClient({
  credentials,
});

sgMailer.setApiKey(config.SENDGRID_API_KEY ?? '');

export const sendEmail = async (
  input: Omit<SendEmailCommandInput, 'Source'>
) => {
  if (config.AWS_SES_SENDER_EMAIL) {
    await ses
      .send(
        new SendEmailCommand({
          Source: config.AWS_SES_SENDER_EMAIL,
          ...input,
        })
      )
      .catch(console.error);
  }

  if (config.SENDGRID_API_KEY && config.SENDGRID_SENDER_EMAIL) {
    await sgMailer
      .send({
        from: config.SENDGRID_SENDER_EMAIL,
        to: input.Destination?.ToAddresses,
        subject: input.Message?.Subject?.Data,
        text: input.Message?.Body?.Text?.Data ?? '',
      })
      .catch(console.error);
  }
};
