/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import { BallerinaExtension, ConstructIdentifier } from '../core';
import { commands, Uri, TextDocumentShowOptions, ViewColumn, Range, } from 'vscode';
import { TM_EVENT_OPEN_FILE_OVERVIEW, CMP_FILE_OVERVIEW } from '../telemetry';

export function activate(ballerinaExtInstance: BallerinaExtension) {
	const reporter = ballerinaExtInstance.telemetryReporter;

	ballerinaExtInstance.onProjectTreeElementClicked((construct) => {
		openBallerinaFile(construct);
	});

	reporter.sendTelemetryEvent(TM_EVENT_OPEN_FILE_OVERVIEW, { component: CMP_FILE_OVERVIEW });
}

function openBallerinaFile(construct: ConstructIdentifier) {
	if (construct.filePath) {
		const showOptions: TextDocumentShowOptions = {
			preserveFocus: false,
			preview: false,
			viewColumn: ViewColumn.Active,
			selection: new Range(construct.startLine!, construct.startColumn!, construct.startLine!, construct.startColumn!)
		};

		const status = commands.executeCommand('vscode.open', Uri.file(construct.filePath), showOptions);
		if (!status) {
			throw new Error(`Unable to open ${construct.filePath}`);
		}
	}
}