/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// ============================================================
// Copyright (c) 2021 Tatsuya Nakamori. All rights reserved.
// See LICENSE in the project root for license information.
// ============================================================
import * as path from 'path';
import * as fs from 'fs'
import * as vscode from 'vscode';
import * as i18n from './i18n';


interface GithubPagesTaskDefinition extends vscode.TaskDefinition {
    flags: string[];
}

interface ConvertHtmlOptions {
    "From": string,
    "To": string,
    "URL for GitHub Pages": string
}


export class GithubPagesTaskProvider implements vscode.TaskProvider {
    static taskType = 'github pages';
    private tasks: vscode.Task[] | undefined;

    constructor(private workspaceRoot: string) {}

    public async provideTasks(): Promise<vscode.Task[]> {
        return this.getTasks();
    }

    public resolveTask(_task: vscode.Task): vscode.Task | undefined {
        const definition: GithubPagesTaskDefinition = <any>_task.definition;
        return this.getTask(
            definition.flags? definition.flags: [],
            definition
        );
    }

    private getTasks(): vscode.Task[] {
        if (this.tasks !== undefined) {
            return this.tasks;
        }

        // Create a data set with [taskID, label].
        const flags: string[][] = [
            ['nojekyllRoot', i18n.localize('htmlgithubpages.task.nojekyll.root.label')],
            ['nojekyllDocs', i18n.localize('htmlgithubpages.task.nojekyll.docs.label')],
            ['toHTML',       i18n.localize('htmlgithubpages.task.toHTML.label')]
        ];

        this.tasks = [];
        for (let index = 0; index < flags.length; index++) {
            this.tasks!.push(
                this.getTask(flags[index])
            );
        }
        return this.tasks;
    }

    private getTask(flags: string[], definition?: GithubPagesTaskDefinition): vscode.Task {
        if (definition === undefined) {
            definition = {
                type: GithubPagesTaskProvider.taskType,
                flags
            };
        }

        return new vscode.Task(
            definition,
            vscode.TaskScope.Workspace,
            `${flags[1]}`,
            GithubPagesTaskProvider.taskType,
            new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
                return new GithubPagesTaskTerminal(this.workspaceRoot, flags);
            })
        );
    }
}

class GithubPagesTaskTerminal implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    private closeEmitter = new vscode.EventEmitter<number>();
    onDidWrite: vscode.Event<string> = this.writeEmitter.event;
    onDidClose?: vscode.Event<number> = this.closeEmitter.event;

    constructor(
        private workspaceRoot: string,
        private flags: string[]) {
    }

    open(initialDimensions: vscode.TerminalDimensions | undefined): void {
        const taskType = this.flags[0];
        if (taskType == 'nojekyllRoot') {
            this.createNojekyll(this.workspaceRoot);

        } else if (taskType == 'nojekyllDocs') {
            this.createNojekyll(
                path.join(this.workspaceRoot, "./docs")
            );

        } else if (taskType == 'toHTML') {
            this.toHtmlToGithubPages();
        }
    }

    close(): void {}

    private async createNojekyll(directory:string) {
        return new Promise<void>((resolve) => {
            const nojekyllFilePath = path.join(directory, ".nojekyll");

            const successLabel = `${i18n.localize('htmlgithubpages.task.success')}`;
            const failedLabel = `${i18n.localize('htmlgithubpages.task.failed')}`;
            this.writeEmitter.fire(`Create .nojekyll file...\r\n`);
            this.writeEmitter.fire(`    Directory: ${directory}\r\n`);
            this.writeEmitter.fire(`    .nojekyll: ${nojekyllFilePath}\r\n\r\n`);

            const dirExists:boolean = fs.existsSync(directory);
            if (dirExists) {
                this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.dir.exists')}\r\n`);
            } else {
                this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.dir.not.exists')}\r\n`);
            }

            // 作成するディレクトリが存在することを確実にする
            // (Rootが存在していない場合/docsフォルダが作られなかった場合は、処理終了[エラー終了])
            const createDirType = this.flags[0];
            if (createDirType == "nojekyllRoot" && !dirExists) {
                this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.ends.process')}\r\n\r\n`);
                this.closeEmitter.fire(2);
                resolve();
                return

            } else if (createDirType == "nojekyllDocs") {
                if (!dirExists) {
                    this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.docs.dir.create')}\r\n`);
                    this.writeEmitter.fire(`    ${directory}\r\n`);
                    fs.mkdirSync(directory, {recursive: true});
                }

                const docDirExists:boolean = fs.existsSync(directory);
                if (!docDirExists) {
                    this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.docs.dir.not.created')}\r\n`);
                    this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.ends.process')}\r\n\r\n`);
                    this.closeEmitter.fire(2);
                    resolve();
                    return
                }
            }

            // .nojekyll ファイルがあれば、処理終了[正常終了]
            let fileExists:boolean = fs.existsSync(nojekyllFilePath);
            if (fileExists) {
                this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.file.exists')}\r\n`);
                this.writeEmitter.fire(`    ${nojekyllFilePath}\r\n`);
                this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.ends.process')}\r\n\r\n`);
                this.closeEmitter.fire(0);
                resolve();
                return
            }

            // Create .nojekyll file (empty)
            this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.file.create')}\r\n`);
            this.writeEmitter.fire(`    ${nojekyllFilePath}\r\n`);
            fs.closeSync(
                fs.openSync(nojekyllFilePath, 'w')
            );

            // .nojekyllが作られたかチェックし、終了する
            fileExists = fs.existsSync(nojekyllFilePath);
            if (fileExists) {
                this.writeEmitter.fire(`[\x1b[34m${successLabel}\x1b[0m] ${i18n.localize('htmlgithubpages.task.nojekyll.file.created')}\r\n`);
                this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.ends.process')}\r\n\r\n`);
                this.closeEmitter.fire(0);
                resolve();
                return
            } else {
                this.writeEmitter.fire(`[\x1b[31m${failedLabel}\x1b[0m] ${i18n.localize('htmlgithubpages.task.nojekyll.file.not.created')}\r\n`);
                this.writeEmitter.fire(`${i18n.localize('htmlgithubpages.task.nojekyll.ends.process')}\r\n\r\n`);
                this.closeEmitter.fire(2);
                resolve();
                return
            }
        });
    }

    private async toHtmlToGithubPages() {
        return new Promise<void>((resolve) => {
            const options: ConvertHtmlOptions|undefined = vscode.workspace.getConfiguration().get("ConvertHtmlForGithubPages.settings");
            if (!options) {
                console.log(i18n.localize('htmlgithubpages.task.toHTML.getconfig.error'));
                return
            }
            let source:string = options["From"];
            let target:string = options["To"];
            let gitUrl:string = options["URL for GitHub Pages"];

            // ===================
            // configの検証
            // ===================
            // Whether or not the source path exists.
            if (!path.isAbsolute(source)) {
                source = path.join(this.workspaceRoot, source);
            }
            if (!fs.existsSync(source)) {
                console.error(source);

                this.closeEmitter.fire(2);
                resolve();
                return
            }

            // Whether the target directory exists or not
            // If not, create it.
            if (!path.isAbsolute(target)) {
                target = path.join(this.workspaceRoot, target);
            }
            if (!fs.existsSync(target)) {
                fs.mkdirSync(target, {recursive: true});

                if (!fs.existsSync(target)) {
                    console.error(target);

                    this.closeEmitter.fire(2);
                    resolve();
                    return
                }
            }

            // Make sure that the URL of the GitHub Pages is not left in the template.
            const regPlaceholder = /(<USERNAME>|<REPOSITORY>)/;
            const match = regPlaceholder.exec(gitUrl);

            if (match) {
                console.error(gitUrl);

                this.closeEmitter.fire(2);
                resolve();
                return
            }



            this.writeEmitter.fire(`Workfolder...${this.workspaceRoot}\r\n`);
            this.writeEmitter.fire(`Copy from...${source}\r\n`);
            this.writeEmitter.fire(`Copy to...${target}\r\n`);
            this.writeEmitter.fire(`URL for HitHub Pages...${gitUrl}\r\n`);
            this.writeEmitter.fire(`    ${this.flags}\r\n`);
            console.log(this.workspaceRoot);

            "https://<USERNAME>.github.io/<REPOSITORY>/"

            // ============================
            // 全てのファイルをコピーする
            // ============================


            // ===========================================================================================
            // コピー先のフォルダ内のHTMLをスキャンし、フルパスとurlのペアを作る
            // pairsOfHtmlUrlList = [["c:/local/path/~/index.html", "https://~.github.io/~/index.html"]]
            // ===========================================================================================
            let pairsOfHtmlUrlList:string[][] = []


            // ================================================================
            // Insert the base tag after the head tag.
            // Open the file, extract the text (contents),
            // insert the base tag, and then write the text in the same file.
            // ================================================================

            // const gitHtmlUrl = `${gitUrl}/${relPath}`;
            // const baseTag = `<base href=\"${gitHtmlUrl}\">`;



            this.closeEmitter.fire(0);
            resolve();
        });
    }
}
