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

let taskProvider: vscode.Disposable | undefined;

export function activate(_context: vscode.ExtensionContext): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return;
    }

    const workspaceFolder:string = workspaceFolders[0].uri.fsPath;
    taskProvider = vscode.tasks.registerTaskProvider(
        GithubPagesTaskProvider.taskType,
        new GithubPagesTaskProvider(workspaceFolder)
    );
}

export function deactivate(): void {
    if (taskProvider) {
        taskProvider.dispose();
    }
}
