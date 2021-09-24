import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
    console.log(event);
    
    var address = event.request.userAttributes.email.split("@")
    event.response.autoConfirmUser = (address[1] === 'octank.com');
    
    return event;
}
