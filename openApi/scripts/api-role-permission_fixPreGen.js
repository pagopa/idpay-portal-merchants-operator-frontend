const regexReplace = require('regex-replace');

regexReplace(
  '"items": \\{\\},',
  '"items":{"type": "object"},',
  'openApi/generated/role-permission-swagger20.json',
  {
    fileContentsOnly: true,
  }
);

regexReplace(
  '"rewardRule": \\{\\},',
  '"rewardRule":{"type": "object"},',
  'openApi/generated/role-permission-swagger20.json',
  {
    fileContentsOnly: true,
  }
);

regexReplace(
  '"operationId": "returns-fixed-automated-criteria",',
  '"operationId":"returnsFixedAutomatedCriteria",',
  'openApi/generated/role-permission-swagger20.json',
  {
    fileContentsOnly: true,
  }
);
