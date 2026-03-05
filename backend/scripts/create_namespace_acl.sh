#! /bin/bash

NAMESPACE_ID=$1
if [ -z "$NAMESPACE_ID" ]; then
    echo "Usage: $0 <namespace_id> <role_name> <user_group_name> <superuser_token>"
    exit 1
fi

ROLE_NAME=$2
if [ -z "$ROLE_NAME" ]; then
    echo "Usage: $0 <namespace_id> <role_name> <user_group_name> <superuser_token>"
    exit 1
fi

USER_GROUP_NAME=$3
if [ -z "$USER_GROUP_NAME" ]; then
    echo "Usage: $0 <namespace_id> <role_name> <user_group_name> <superuser_token>"
    exit 1
fi

SUPERUSER_TOKEN=$4
if [ -z "$SUPERUSER_TOKEN" ]; then
    echo "Usage: $0 <namespace_id> <role_name> <user_group_name> <superuser_token>"
    exit 1
fi

echo "Creating role $ROLE_NAME"

ROLE_RESPONSE=$(curl -X POST http://localhost:3000/api/v1/role -d '{"name": "'$ROLE_NAME'", "description": "'$ROLE_NAME'"}' -H "X-Superuser-Token: $SUPERUSER_TOKEN")
ROLE_ID=$(echo $ROLE_RESPONSE | jq -r '.id')
echo "Created role with ID: $ROLE_ID"

echo "Creating user group $USER_GROUP_NAME"

USER_GROUP_RESPONSE=$(curl -X POST http://localhost:3000/api/v1/usergroup -d '{"name": "'$USER_GROUP_NAME'"}' -H "X-Superuser-Token: $SUPERUSER_TOKEN")
USER_GROUP_ID=$(echo $USER_GROUP_RESPONSE | jq -r '.id')
echo "Created user group with ID: $USER_GROUP_ID"

echo "granting role $ROLE_NAME to user group $USER_GROUP_NAME"

curl -X POST http://localhost:3000/api/v1/grant -d '{"role_id": "'$ROLE_ID'", "user_group_id": "'$USER_GROUP_ID'"}' -H "X-Superuser-Token: $SUPERUSER_TOKEN"

echo "granted role $ROLE_NAME to user group $USER_GROUP_NAME"

echo "creating rule for namespace $NAMESPACE_ID"

curl -X POST http://localhost:3000/api/v1/rule -d '{"action": "01W", "object_id": "'$NAMESPACE_ID'", "object_type": "NSP"}' -H "X-Superuser-Token: $SUPERUSER_TOKEN"

echo "created rule for namespace $NAMESPACE_ID"

echo "adding rule to role $ROLE_NAME"

curl -X POST http://localhost:3000/api/v1/role/rule -d '{"rule_id": "'$RULE_ID'", "role_id": "'$ROLE_ID'"}' -H "X-Superuser-Token: $SUPERUSER_TOKEN"

echo "added rule to role $ROLE_NAME"
