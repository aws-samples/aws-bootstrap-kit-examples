CICD_ACCOUNT_ID=$(aws  organizations list-accounts | jq -r '.Accounts[] | select(.Name == "CICD") | .Id');

ACCOUNTS=$(aws  organizations list-accounts | jq -c '.Accounts[] | select(.JoinedMethod == "CREATED")');

for ACCOUNT in $ACCOUNTS; do
    _jq() {
        echo ${ACCOUNT} | jq -r ${1};
    }


    ACCOUNT_ID=$(_jq '.Id');
    ACCOUNT_NAME=$(_jq '.Name');
    ACCOUNT_JOINED_METHOD=$(_jq '.JoinedMethod');

    # Assume the right role

    assumes_role=`aws sts assume-role --role-arn arn:aws:iam::${ACCOUNT_ID}:role/OrganizationAccountAccessRole --role-session-name ${ACCOUNT_NAME}`;
    aws configure set profile.$ACCOUNT_NAME.aws_access_key_id `echo $assumes_role | jq -r .Credentials.AccessKeyId`;
    aws configure set profile.$ACCOUNT_NAME.aws_secret_access_key `echo $assumes_role | jq -r .Credentials.SecretAccessKey`;
    aws configure set profile.$ACCOUNT_NAME.aws_session_token `echo $assumes_role | jq -r .Credentials.SessionToken`;

    # Bootstrap
    case $ACCOUNT_NAME in
        CICD)
            npm run cdk bootstrap -- --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess --profile ${ACCOUNT_NAME} 
            ;;
            Dev|Staging|Prod)
            npm run cdk bootstrap -- --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess --trust ${CICD_ACCOUNT_ID} aws://${ACCOUNT_ID}/eu-west-1 --profile ${ACCOUNT_NAME}
            ;;
        *)
            echo "Unknown type of account, skipping"
    esac
done