/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// ============================================================
// Copyright (c) 2021 Tatsuya Nakamori. All rights reserved.
// See LICENSE in the project root for license information.
// ============================================================
import * as path from 'path';
import * as fs from 'fs';
import * as fsex from 'fs-extra';
import * as klawSync from 'klaw-sync';
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

interface NojekyllTerminalMessages {
    "createDirFileInfo": string,
    "dirExists": string,
    "dirNotExists": string,
    "docsDirCreate": string,
    "docsDirNotCreated": string,
    "nojekyllExists": string,
    "nojekyllCreate": string,
    "nojekyllCreated": string,
    "nojekyllNotCreated": string,
    "endsProcess": string
}

interface ToHtmlTerminalMessages {
    "start": string,
    "end": string,
    "end.success": string,
    "checkConfig": string,
    "checkConfig.source": string,
    "checkConfig.target": string,
    "checkConfig.giturl": string,
    "checkConfig.source.error": string,
    "checkConfig.target.error": string,
    "checkConfig.giturl.error": string,
    "checkConfig.ok": string,
    "emptyDir": string,
    "copyDir": string,
    "fetchFiles": string,
    "insertBaseTag": string
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

    private nojekyllTerminalMessages(directory:string, nojekyllFilePath:string):NojekyllTerminalMessages {
        const success = `${i18n.localize('htmlgithubpages.task.success')}`;
        const failed  = `${i18n.localize('htmlgithubpages.task.failed')}`;

        const createDirFileInfo = `Create .nojekyll file...\r\n` +
                                  `    Directory: ${directory}\r\n` +
                                  `    .nojekyll: ${nojekyllFilePath}\r\n\r\n`;

        const docsDirCreate = `${i18n.localize('htmlgithubpages.task.nojekyll.docs.dir.create')}\r\n` +
                              `    ${directory}\r\n`;

        const docsDirNotCreated = `[\x1b[31m${failed}\x1b[0m] ` +
                                  `${i18n.localize('htmlgithubpages.task.nojekyll.docs.dir.not.created')}\r\n`;

        const nojekyllCreate = `${i18n.localize('htmlgithubpages.task.nojekyll.file.create')}\r\n` +
                               `    ${nojekyllFilePath}\r\n`;


        const nojekyllCreated = `[\x1b[34m${success}\x1b[0m] ` +
                                `${i18n.localize('htmlgithubpages.task.nojekyll.file.created')}\r\n`;

        const nojekyllNotCreated = `[\x1b[31m${failed}\x1b[0m] ` +
                                   `${i18n.localize('htmlgithubpages.task.nojekyll.file.not.created')}\r\n`;

        let terminalMessages:NojekyllTerminalMessages = {
            "createDirFileInfo":  `${createDirFileInfo}`,

            "dirExists":          `${i18n.localize('htmlgithubpages.task.nojekyll.dir.exists')}\r\n`,
            "dirNotExists":       `${i18n.localize('htmlgithubpages.task.nojekyll.dir.not.exists')}\r\n`,

            "docsDirCreate":      `${docsDirCreate}`,
            "docsDirNotCreated":  `${docsDirNotCreated}`,

            "nojekyllExists":     `${i18n.localize('htmlgithubpages.task.nojekyll.file.exists')}\r\n`,
            "nojekyllCreate":     `${nojekyllCreate}`,
            "nojekyllCreated":    `${nojekyllCreated}`,
            "nojekyllNotCreated": `${nojekyllNotCreated}`,

            "endsProcess":        `${i18n.localize('htmlgithubpages.task.nojekyll.ends.process')}\r\n\r\n`,
        }
        return terminalMessages
    }

    private async createNojekyll(directory:string) {
        return new Promise<void>((resolve) => {
            const nojekyllFilePath = path.join(directory, ".nojekyll");

            // Generate a message to be displayed in the terminal
            const terminalMessages = this.nojekyllTerminalMessages(directory, nojekyllFilePath);
            this.writeEmitter.fire(`${terminalMessages["createDirFileInfo"]}`);

            const dirExists:boolean = fs.existsSync(directory);
            if (dirExists) {
                this.writeEmitter.fire(`${terminalMessages["dirExists"]}`);
            } else {
                this.writeEmitter.fire(`${terminalMessages["dirNotExists"]}`);
            }

            // 作成するディレクトリが存在することを確実にする
            // (Rootが存在していない場合/docsフォルダが作られなかった場合は、処理終了[エラー終了])
            const createDirType = this.flags[0];
            if (createDirType == "nojekyllRoot" && !dirExists) {
                this.writeEmitter.fire(`${terminalMessages["endsProcess"]}`);
                this.closeEmitter.fire(2);
                resolve();
                return

            } else if (createDirType == "nojekyllDocs") {
                if (!dirExists) {
                    this.writeEmitter.fire(`${terminalMessages["docsDirCreate"]}`);
                    fs.mkdirSync(directory, {recursive: true});
                }

                if (!fs.existsSync(directory)) {
                    this.writeEmitter.fire(`${terminalMessages["docsDirNotCreated"]}`);
                    this.writeEmitter.fire(`${terminalMessages["endsProcess"]}`);
                    this.closeEmitter.fire(2);
                    resolve();
                    return
                }
            }

            // .nojekyll ファイルがあれば、処理終了[正常終了]
            if (fs.existsSync(nojekyllFilePath)) {
                this.writeEmitter.fire(`${terminalMessages["nojekyllExists"]}`);
                this.writeEmitter.fire(`${terminalMessages["endsProcess"]}`);
                this.closeEmitter.fire(0);
                resolve();
                return
            }

            // Create .nojekyll file
            this.writeEmitter.fire(`${terminalMessages["nojekyllCreate"]}`);
            fs.closeSync(fs.openSync(nojekyllFilePath, 'w'));

            // .nojekyllが作られたかチェックし、終了する
            if (fs.existsSync(nojekyllFilePath)) {
                this.writeEmitter.fire(`${terminalMessages["nojekyllCreated"]}`);
                this.writeEmitter.fire(`${terminalMessages["endsProcess"]}`);
                this.closeEmitter.fire(0);
                resolve();
                return
            } else {
                this.writeEmitter.fire(`${terminalMessages["nojekyllNotCreated"]}`);
                this.writeEmitter.fire(`${terminalMessages["endsProcess"]}`);
                this.closeEmitter.fire(2);
                resolve();
                return
            }
        });
    }

    private toHtmlTerminalMessages():ToHtmlTerminalMessages {
        let terminalMessages:ToHtmlTerminalMessages = {
            "start":                    `${i18n.localize('htmlgithubpages.task.tohtml.start')}\r\n`,
            "end":                      `${i18n.localize('htmlgithubpages.task.tohtml.end')}\r\n\r\n`,
            "end.success":              `\x1b[34m${i18n.localize('htmlgithubpages.task.tohtml.end.success')}\x1b[0m\r\n\r\n`,
            "checkConfig":              `${i18n.localize('htmlgithubpages.task.tohtml.checkConfig')}\r\n`,
            "checkConfig.source":       `${i18n.localize('htmlgithubpages.task.tohtml.checkConfig.source')}\r\n`,
            "checkConfig.target":       `${i18n.localize('htmlgithubpages.task.tohtml.checkConfig.target')}\r\n`,
            "checkConfig.giturl":       `${i18n.localize('htmlgithubpages.task.tohtml.checkConfig.giturl')}\r\n`,
            "checkConfig.source.error": `\x1b[31m${i18n.localize('htmlgithubpages.task.tohtml.checkConfig.source.error')}\x1b[0m\r\n`,
            "checkConfig.target.error": `\x1b[31m${i18n.localize('htmlgithubpages.task.tohtml.checkConfig.target.error')}\x1b[0m\r\n`,
            "checkConfig.giturl.error": `\x1b[31m${i18n.localize('htmlgithubpages.task.tohtml.checkConfig.giturl.error')}\x1b[0m\r\n`,
            "checkConfig.ok":           `${i18n.localize('htmlgithubpages.task.tohtml.checkConfig.ok')}\r\n\r\n`,
            "emptyDir":                 `${i18n.localize('htmlgithubpages.task.tohtml.emptyDir')}\r\n`,
            "copyDir":                  `${i18n.localize('htmlgithubpages.task.tohtml.copyDir')}\r\n`,
            "fetchFiles":               `${i18n.localize('htmlgithubpages.task.tohtml.fetchFiles')}\r\n`,
            "insertBaseTag":            `${i18n.localize('htmlgithubpages.task.tohtml.insertBaseTag')}\r\n`,
        }
        return terminalMessages
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

            // Generate a message to be displayed in the terminal
            const terminalMessages = this.toHtmlTerminalMessages();
            this.writeEmitter.fire(`${terminalMessages["start"]}`);
            this.writeEmitter.fire(`${terminalMessages["checkConfig"]}`);

            // =====================================================================
            // configの検証
            // =====================================================================
            // Whether or not the source path exists.
            this.writeEmitter.fire(`${terminalMessages["checkConfig.source"]}`);
            if (!path.isAbsolute(source)) {
                source = path.join(this.workspaceRoot, source);
            }
            if (!fs.existsSync(source)) {
                this.writeEmitter.fire(`${terminalMessages["checkConfig.source.error"]}`);
                this.writeEmitter.fire(`${terminalMessages["end"]}`);
                this.closeEmitter.fire(2);
                resolve();
                return
            }

            // Whether the target directory exists or not
            // If not, create it.
            this.writeEmitter.fire(`${terminalMessages["checkConfig.target"]}`);
            if (!path.isAbsolute(target)) {
                target = path.join(this.workspaceRoot, target);
            }
            if (!fs.existsSync(target)) {
                fs.mkdirSync(target, {recursive: true});

                if (!fs.existsSync(target)) {
                    this.writeEmitter.fire(`${terminalMessages["checkConfig.target.error"]}`);
                    this.writeEmitter.fire(`${terminalMessages["end"]}`);
                    this.closeEmitter.fire(2);
                    resolve();
                    return
                }
            }

            // Make sure that the URL of the GitHub Pages is not left in the template.
            this.writeEmitter.fire(`${terminalMessages["checkConfig.giturl"]}`);
            const regPlaceholder = /(<USERNAME>|<REPOSITORY>)/;
            const match = regPlaceholder.exec(gitUrl);
            if (match) {
                this.writeEmitter.fire(`${terminalMessages["checkConfig.giturl.error"]}`);
                this.writeEmitter.fire(`${terminalMessages["end"]}`);
                this.closeEmitter.fire(2);
                resolve();
                return
            }
            const baseName = path.basename(this.workspaceRoot);
            gitUrl = gitUrl.replace(/(\$\{DIR_NAME\})/, baseName);

            this.writeEmitter.fire(`${terminalMessages["checkConfig.ok"]}`);

            // .nojekyll が存在しているかどうか
            const nojekyllFilePath = path.join(target, ".nojekyll");
            const hasNojekyll:boolean = fs.existsSync(nojekyllFilePath);

            this.writeEmitter.fire(`Workfolder... ${this.workspaceRoot}\r\n`);
            this.writeEmitter.fire(`Copy from... ${source}\r\n`);
            this.writeEmitter.fire(`Copy to... ${target}\r\n`);
            this.writeEmitter.fire(`Has .nojekyll... ${hasNojekyll}\r\n`);
            this.writeEmitter.fire(`URL for HitHub Pages... ${gitUrl}\r\n\r\n`);

            // =====================================================================
            // targetフォルダ内のファイルを全て削除し、sourceのファイルをコピーする
            // =====================================================================
            this.writeEmitter.fire(`${terminalMessages["emptyDir"]}`);
            fsex.emptyDirSync(target);
            this.writeEmitter.fire(`${terminalMessages["copyDir"]}`);
            fsex.copySync(source, target);

            if (hasNojekyll) {
                fs.closeSync(fs.openSync(nojekyllFilePath, 'w'));
            }

            // ===========================================================================================
            // コピー先のフォルダ内のHTMLをスキャンし、フルパスとurlのペアを作る
            // pairsOfHtmlUrlList = [["c:/local/path/~/index.html", "https://~.github.io/~/index.html"]]
            // ===========================================================================================
            this.writeEmitter.fire(`${terminalMessages["fetchFiles"]}`);

            let pairsOfHtmlUrlList:string[][] = [];
            const files = klawSync(target, {nodir: true});
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                if (!file.path.endsWith(".html")) {
                    continue
                }

                const relPath = path.relative(target, file.path)
                let href = `${gitUrl}/${relPath}`;
                href = href.replace(/\\/g, "/");
                href = href.replace(/(?<!https:)\/\//g, "/");

                pairsOfHtmlUrlList.push([file.path, href]);
            }

            // ================================================================
            // Insert the base tag after the head tag.
            // Open the file, extract the text (contents),
            // insert the base tag, and then write the text in the same file.
            // ================================================================
            this.writeEmitter.fire(`${terminalMessages["insertBaseTag"]}`);

            const regHeadTag = /(<head>)/;
            for (let index = 0; index < pairsOfHtmlUrlList.length; index++) {
                const html = pairsOfHtmlUrlList[index][0];
                const href = pairsOfHtmlUrlList[index][1];

                let contents = fs.readFileSync(html, 'utf-8');
                const match = regHeadTag.exec(contents);
                if (!match) {continue}

                const lastIndex   = match.index + 6;  // "<head>".length == 6
                const before_head = contents.slice(0, lastIndex);
                const base_tag    = `  <base href=\"${href}\" charset="utf-8"/>`;
                const after_head  = contents.slice(lastIndex);
                const newContents = `${before_head}\n${base_tag}${after_head}`;

                fs.writeFileSync(html, newContents);
            }

            this.writeEmitter.fire(`${terminalMessages["end.success"]}`);
            this.closeEmitter.fire(0);
            resolve();
        });
    }
}
