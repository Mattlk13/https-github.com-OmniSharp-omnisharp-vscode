/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import AbstractSupport from './abstractProvider';
import * as protocol from '../omnisharp/protocol';
import * as serverUtils from '../omnisharp/utils';
import {createRequest, toRange} from '../omnisharp/typeConvertion';
import {DocumentHighlightProvider, DocumentHighlight, DocumentHighlightKind, CancellationToken, TextDocument, Position} from 'vscode';

export default class OmnisharpDocumentHighlightProvider extends AbstractSupport implements DocumentHighlightProvider {

    public provideDocumentHighlights(resource: TextDocument, position: Position, token: CancellationToken): Promise<DocumentHighlight[]> {

        let req = createRequest<protocol.FindUsagesRequest>(resource, position);
        req.OnlyThisFile = true;
        req.ExcludeDefinition = false;

        return serverUtils.findUsages(this._server, req, token).then(res => {
            if (res && Array.isArray(res.QuickFixes)) {
                return res.QuickFixes.map(OmnisharpDocumentHighlightProvider._asDocumentHighlight);
            }
        });
    }

    private static _asDocumentHighlight(quickFix: protocol.QuickFix): DocumentHighlight {
        return new DocumentHighlight(toRange(quickFix), DocumentHighlightKind.Read);
    }
}
