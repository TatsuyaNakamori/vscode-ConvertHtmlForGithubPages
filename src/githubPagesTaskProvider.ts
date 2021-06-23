/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// ============================================================
// Copyright (c) 2021 Tatsuya Nakamori. All rights reserved.
// See LICENSE in the project root for license information.
// ============================================================


import * as path from 'path';
import * as vscode from 'vscode';

interface CustomBuildTaskDefinition extends vscode.TaskDefinition {
    flavor: string;
    flags?: string[];
}

export class GithubPagesTaskProvider implements vscode.TaskProvider {
    static CustomBuildScriptType = 'github pages';
    private tasks: vscode.Task[] | undefined;

    private sharedState: string | undefined;

    constructor(private workspaceRoot: string) {}

    public async provideTasks(): Promise<vscode.Task[]> {
        return this.getTasks();
    }

    public resolveTask(_task: vscode.Task): vscode.Task | undefined {
        const flavor: string = _task.definition.flavor;
        if (flavor) {
            const definition: CustomBuildTaskDefinition = <any>_task.definition;
            return this.getTask(definition.flavor, definition.flags ? definition.flags : [], definition);
        }
        return undefined;
    }

    private getTasks(): vscode.Task[] {
        if (this.tasks !== undefined) {
            return this.tasks;
        }
        const flavors: string[] = ['32', '64'];
        const flags: string[][] = [['watch', 'incremental'], ['incremental'], []];

        this.tasks = [];
        flavors.forEach(flavor => {
            flags.forEach(flagGroup => {
                this.tasks!.push(this.getTask(flavor, flagGroup));
            });
        });
        return this.tasks;
    }

    private getTask(flavor: string, flags: string[], definition?: CustomBuildTaskDefinition): vscode.Task {
        if (definition === undefined) {
            definition = {
                type: GithubPagesTaskProvider.CustomBuildScriptType,
                flavor,
                flags
            };
        }
        return new vscode.Task(
            definition,
            vscode.TaskScope.Workspace,
            `${flavor} ${flags.join(' ')}`,
            GithubPagesTaskProvider.CustomBuildScriptType,
            new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
                return new ConvertHtmlTaskTerminal(
                    this.workspaceRoot,
                    flavor,
                    flags,
                    () => this.sharedState, (state: string) => this.sharedState = state
                );
            })
        );
    }
}

class ConvertHtmlTaskTerminal implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    onDidWrite: vscode.Event<string> = this.writeEmitter.event;

    private closeEmitter = new vscode.EventEmitter<number>();
    onDidClose?: vscode.Event<number> = this.closeEmitter.event;

    private fileWatcher: vscode.FileSystemWatcher | undefined;

    constructor(
        private workspaceRoot: string,
        private flavor: string,
        private flags: string[],
        private getSharedState: () => string | undefined,
        private setSharedState: (state: string) => void) {
    }

    open(initialDimensions: vscode.TerminalDimensions | undefined): void {
        // At this point we can start using the terminal.
        if (this.flags.indexOf('watch') > -1) {
            const pattern = path.join(this.workspaceRoot, 'customBuildFile');
            this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
            this.fileWatcher.onDidChange(() => this.doBuild());
            this.fileWatcher.onDidCreate(() => this.doBuild());
            this.fileWatcher.onDidDelete(() => this.doBuild());
        }
        this.doBuild();
    }

    close(): void {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
    }

    private async doBuild(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.writeEmitter.fire('Starting build...\r\n');
            let isIncremental = this.flags.indexOf('incremental') > -1;
            if (isIncremental) {
                if (this.getSharedState()) {
                    this.writeEmitter.fire('Using last build results: ' + this.getSharedState() + '\r\n');
                } else {
                    isIncremental = false;
                    this.writeEmitter.fire('No result from last build. Doing full build.\r\n');
                }
            }

            // Since we don't actually build anything in this example set a timeout instead.
            setTimeout(() => {
                const date = new Date();
                this.setSharedState(date.toTimeString() + ' ' + date.toDateString());
                this.writeEmitter.fire('Build complete.\r\n\r\n');
                if (this.flags.indexOf('watch') === -1) {
                    this.closeEmitter.fire(0);
                    resolve();
                }
            }, isIncremental ? 1000 : 4000);
        });
    }
}