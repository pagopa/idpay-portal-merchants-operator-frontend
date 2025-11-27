
import regexReplace from 'regex-replace';

regexReplace(
    'docNumber_.uri',
    'docNumber',
    'src/api/generated/merchants/client.ts',
    { fileContentsOnly: true }
);