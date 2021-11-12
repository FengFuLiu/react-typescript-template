import * as vscode from 'vscode';
const fs = require('fs');

// eslint-disable-next-line @typescript-eslint/naming-convention
enum SNIPPETS_TYPE {
  component = '组件',
  page = '页面'
}

type Props = {
  name: string;
  path: string;
  type: string
};

const line2camelCase = (name: string) =>
  name.replace(/\-(\w)/g, (_all, letter) => letter.toUpperCase());

const generateComponent = ({ name, path, type }: Props) => {
  const templateName = line2camelCase(name).replace(/^\S/, s => s.toUpperCase());

  try {
    const content = SNIPPETS_TYPE.page === type ?
      `import React from 'react';

type Props = {};

const ${templateName}: React.FC<Props> = () => {
  return <></>;
};

export default ${templateName};
`
      :
      `import React from 'react';

type Props = {};

const ${templateName}: React.FC<Props> = () => {
  return <></>;
};

export default React.memo(${templateName});
`
      ;
    fs.mkdirSync(`${path}`);
    fs.writeFileSync(`${path}/index.tsx`, content);

    setTimeout(() => {
      const openPath = vscode.Uri.file(`${path}/index.tsx`);
      vscode.workspace.openTextDocument(openPath).then(doc => {
        vscode.window.showTextDocument(doc);
      });
    }, 10);


  } catch (err) {
    vscode.window.showWarningMessage(String(err));
  }
};

export function activate(context: vscode.ExtensionContext) {

  const createPageCommand = vscode.commands.registerCommand('extension.createPage', async function (param) {
    const folderPath = param.fsPath;
    const name = await vscode.window.showInputBox({
      placeHolder: `Enter your page name like 'main-page'`
    });
    if (name) {
      const path = `${folderPath}/${name}`;
      generateComponent({ name, path, type: SNIPPETS_TYPE.page });
    } else {
      vscode.window.showWarningMessage('Input cancel');
    }
  });


  const createComponentCommand = vscode.commands.registerCommand('extension.createComponent', async function (param) {
    const folderPath = param.fsPath;
    const name = await vscode.window.showInputBox({
      placeHolder: `Enter your Component name`
    });
    if (name) {
      const path = `${folderPath}/${name}`;
      generateComponent({ name, path, type: SNIPPETS_TYPE.component });
    } else {
      vscode.window.showWarningMessage('Input cancel');
    }
  });

  context.subscriptions.concat([createPageCommand, createComponentCommand]);
}
