export function getDiffDataByPath(path) {
    return path
        .replace(/^root./, '')
        .split('.')
        .reduce((acc, part, index, array) => {
            if (index === array.length - 1) {
                return acc[part];
            }

            return acc[part].pathnames;
        }, window.DIFF_DATA.diffs);
}
