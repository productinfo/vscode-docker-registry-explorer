import * as vscode from 'vscode';
import { RegistryNode, RegistrySettings } from '../models/registryNode';
import { RepositoryNode } from '../models/repositoryNode';
import { TagNode } from '../models/tagNode';
//import * as keytarType from 'keytar';
import { URL } from 'url';

export class PrivateDockerExplorerProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem> = new vscode.EventEmitter<vscode.TreeItem>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem> = this._onDidChangeTreeData.event;

    async refresh(): Promise<void> {
        this._onDidChangeTreeData.fire();
    }

    constructor(private context: vscode.ExtensionContext) {

    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        if (!element) {
            return new Promise(resolve => {
                let chldrns: RegistryNode[] = new Array<RegistryNode>();
                // chldrns.push(new RegistryNode("qaimodeljsacr.azurecr.io", vscode.TreeItemCollapsibleState.Collapsed, 'https://qaimodeljsacr.azurecr.io', '', ''));
                // chldrns.push(new RegistryNode("dummy.reg.io", vscode.TreeItemCollapsibleState.Collapsed, 'https://dummy.reg.io', '', ''));

                let regSettings = this.getAddedRegistries();
                regSettings.forEach(element => {
                    chldrns.push(new RegistryNode(element.url.hostname, vscode.TreeItemCollapsibleState.Collapsed, element.url.toString(), element.user, element.password));
                });

                resolve(chldrns);
            });
        } else if (element.contextValue === 'registryNode') {
            return (element as RegistryNode).getChildren();
        } else if (element.contextValue === 'repositoryNode') {
            return (element as RepositoryNode).getChildren();
        } else if (element.contextValue === 'tagNode') {

            return (element as TagNode).getChildren(undefined, this._onDidChangeTreeData);
        }
    }

    private getAddedRegistries(): RegistrySettings[] {
        //this.context.globalState.update('vscode-private-docker-registry-explorer-nodes', null);
        let nodesData: string[] = this.context.globalState.get('vscode-private-docker-registry-explorer-nodes', []);
        let registrySettings: RegistrySettings[] = new Array<RegistrySettings>();
        if (nodesData) {
            let urls: any = nodesData;

            urls.forEach((url: string) => {
                registrySettings.push({ url: new URL(url), user: '', password: '' });
            });
        }

        return registrySettings;
    }
}