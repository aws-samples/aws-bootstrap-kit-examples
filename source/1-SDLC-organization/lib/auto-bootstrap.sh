CICD_ACCOUNT_ID=$(aws organizations list-accounts | jq -r '.Accounts[] | select(.Name == "CICD") | .Id');

ACCOUNTS=$(aws organizations list-accounts | jq -c '.Accounts[] | select(.JoinedMethod == "CREATED")');

# Identifying CICD Account

for ACCOUNT in $ACCOUNTS; do
    _jq() {
        echo ${ACCOUNT} | jq -r ${1};
    }

    ACCOUNT_ID=$(_jq '.Id');
    TAGS=$(aws organizations list-tags-for-resource --resource-id ${ACCOUNT_ID})
    ACCOUNT_TYPE=$(echo $TAGS | jq -r '.Tags[] | select(.Key == "AccountType") | .Value')

    if [ "${ACCOUNT_TYPE}" = "CICD" ]; then
        echo "Identified CICD Account: ${ACCOUNT_ID}"
        CICD_ACCOUNT_ID=${ACCOUNT_ID}
    fi

done

# Bootstrapping Accounts

REGIONS_TO_BOOTSTRAP=${1}
echo "Bootstrapping the following regions: $REGIONS_TO_BOOTSTRAP"


for ACCOUNT in $ACCOUNTS; do
    _jq() {
        echo ${ACCOUNT} | jq -r ${1};
    }

    ACCOUNT_ID=$(_jq '.Id');
    ACCOUNT_NAME=$(_jq '.Name');
    TAGS=$(aws organizations list-tags-for-resource --resource-id ${ACCOUNT_ID})
    ACCOUNT_TYPE=$(echo ${TAGS} | jq -r '.Tags[] | select(.Key == "AccountType") | .Value')
    
    # Assume the right role

    assumes_role=`aws sts assume-role --role-arn arn:aws:iam::${ACCOUNT_ID}:role/OrganizationAccountAccessRole --role-session-name ${ACCOUNT_NAME}`;
    aws configure set profile.$ACCOUNT_NAME.aws_access_key_id `echo $assumes_role | jq -r .Credentials.AccessKeyId`;
    aws configure set profile.$ACCOUNT_NAME.aws_secret_access_key `echo $assumes_role | jq -r .Credentials.SecretAccessKey`;
    aws configure set profile.$ACCOUNT_NAME.aws_session_token `echo $assumes_role | jq -r .Credentials.SessionToken`;

    # Bootstrap
    echo "Bootrapping account $ACCOUNT_NAME of tagged with ${TAGS} ..."
    case $ACCOUNT_TYPE in
        CICD)
            # A custom template will apply PermissionsBoundary to CDK Execution role.
            npm run cdk bootstrap -- --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess --template ./lib/cdk-bootstrap-template.yml --profile ${ACCOUNT_NAME}
            ;;
        PLAYGROUND)
            for REGION in $REGIONS_TO_BOOTSTRAP; do
                npm run cdk bootstrap -- --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess aws://${ACCOUNT_ID}/${REGION} --profile ${ACCOUNT_NAME}
            done
            ;;
        STAGE)
            for REGION in $REGIONS_TO_BOOTSTRAP; do
                npm run cdk bootstrap -- --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess --trust ${CICD_ACCOUNT_ID} aws://${ACCOUNT_ID}/${REGION} --profile ${ACCOUNT_NAME}
            done
            ;;
        *)
            echo "Unknown type of account ${ACCOUNT_TYPE}, skipping"
    esac
done
