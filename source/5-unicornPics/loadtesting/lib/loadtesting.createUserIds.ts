import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
    const numberOfUsers = event['users']['NumberOfUsers'];
    const numberOfLikesPerUser = event['users']['NumberOfLikesPerUser'];
    const testDurationMinutes = event['TestDurationMinutes'];
    console.log('Generating '+numberOfUsers+' users with numberOfLikesPerUser='+numberOfLikesPerUser+' and testDurationMinutes='+testDurationMinutes);

    const usernames = new Array();
    for (let i=0; i<numberOfUsers; i++) {
        usernames.push({
            "UserName": "loadtestuser"+i,
            "NumberOfLikesPerUser": numberOfLikesPerUser,
            "TestDurationMinutes": testDurationMinutes,
        });
    };

    return {
        "statusCode": 200,
        "userNames": usernames,
    }
}
