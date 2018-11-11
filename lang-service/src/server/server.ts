import { ChildProcess, spawn } from "child_process";
import * as net from "net";
import * as path from "path";
import { toSocket } from "vscode-ws-jsonrpc";
// tslint:disable-next-line:no-submodule-imports
import * as serverRPC from "vscode-ws-jsonrpc/lib/server";
import { Server } from "ws";

const LS_DEBUG = process.env.LS_DEBUG === "true";
const LS_CUSTOM_CLASSPATH = process.env.LS_CUSTOM_CLASSPATH;

export function spawnStdioServer(ballerinaHome: string): ChildProcess {
    let cmd;
    const cwd = path.join(ballerinaHome, "lib", "tools", "lang-server", "launcher");
    const args: string[] = [];
    if (process.platform === "win32") {
        cmd = path.join(cwd, "language-server-launcher.bat");
    } else {
        cmd = "sh";
        args.push(path.join(cwd, "language-server-launcher.sh"));
    }

    if (LS_DEBUG) {
        args.push("--debug");
    }
    if (LS_CUSTOM_CLASSPATH) {
        args.push("--classpath", LS_CUSTOM_CLASSPATH);
    }
    return spawn(cmd, args, { cwd });
}

export function spawnWSServer(ballerinaHome: string, port: number)
            : [ChildProcess, Server] {
    // start lang-server process
    const lsProcess = spawnStdioServer(ballerinaHome);
    // start web-server
    const wsServer = new Server({ port });
    wsServer.on("connection", (socket: WebSocket) => {
        // forward websocket messages to stdio of ls process
        const clientConnection = serverRPC.createWebSocketConnection(toSocket(socket));
        const serverConnection = serverRPC.createProcessStreamConnection(lsProcess);
        serverRPC.forward(clientConnection, serverConnection);
    });
    return [lsProcess, wsServer];
}
