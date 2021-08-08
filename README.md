# Rapper Vocab

Analyze the vocabulary of rappers. Built with SvelteKit and AWS.

## AWS Setup

1. `aws iam create-role --role-name RapperVocabLambdaRole \ --path "/service-role/" \ --assume-role-policy-document file://aws/trust-relationship.json`

2. `aws iam put-role-policy --role-name RapperVocabLambdaRole \ --policy-name RapperVocabRolePolicy \ --policy-document file://aws/role-policy.json`
