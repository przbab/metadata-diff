import './utils/globalSetup.js';
import './components/ProgressRing.js';
import './components/Diff.js';
import './components/PathNavigation/PathNavigation.js';
import './components/AppHeader.js';
import './components/AppTabs/AppTabs.js';
import './components/Settings/Dialog.js';

import { getDiffDataByPath } from './utils/getDiffDataByPath.js';

const diffWorker = new Worker('worker.js');

diffWorker.onmessage = (event) => {
    const { diff, path, type } = event.data;
    const state = getDiffDataByPath(path);
    state.diffs = { ...state.diffs, [type]: diff };

    window.signals.dispatchEvent(new CustomEvent('diff', { detail: { path, type } }));
};

function diffAll(diffs, type, path) {
    diffs.forEach((data, index) => {
        const newPath = `${path}.${index}`;
        if (data.pathnames) {
            diffAll(data.pathnames, type, newPath);
        } else {
            diffWorker.postMessage({ data, path: newPath, type });
        }
    });
}

diffAll(window.DIFF_DATA.diffs, 'current.server-candidate.server', 'root');
diffAll(window.DIFF_DATA.diffs, 'current.client-candidate.client', 'root');
diffAll(window.DIFF_DATA.diffs, 'candidate.server-candidate.client', 'root');
