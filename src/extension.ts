/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// ============================================================
// Copyright (c) 2021 Tatsuya Nakamori. All rights reserved.
// See LICENSE in the project root for license information.
// ============================================================

import * as vscode from 'vscode';
import { GithubPagesTaskProvider } from './githubPagesTaskProvider';

let customTaskProvider: vscode.Disposable | undefined;

export function activate(_context: vscode.ExtensionContext): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return;
    }

    const workspaceFolder:string = workspaceFolders[0].uri.fsPath;
    console.log("workspaceFolders");
    console.log(workspaceFolders);
    console.log("workspaceFolder");
    console.log(workspaceFolder);

    customTaskProvider = vscode.tasks.registerTaskProvider(
        GithubPagesTaskProvider.taskType,
        new GithubPagesTaskProvider(workspaceFolder)
    );
}

export function deactivate(): void {
    if (customTaskProvider) {
        customTaskProvider.dispose();
    }
}
