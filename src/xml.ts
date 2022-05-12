/**
 * @see https://github.com/anvaka/tiny.xml
 */
export function parse(xml: string) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml');
    const nameSpaces = extractNodeNamespaces(doc.documentElement);

    const nsResolver: XPathNSResolver = function (prefix) {
        if (prefix) {
            return nameSpaces[prefix] || null;
        } else {
            return null;
        }
    }

    return {
        selectNodes: function (name: string, startFrom: globalThis.Node, nsPrefix: string) {
            nsPrefix = nsPrefix || 'x';
            if (!nameSpaces[nsPrefix]) { return []; }

            const root = startFrom || doc
            const xpathResult = doc.evaluate('.//' + nsPrefix + ':' + name, root, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            const result = [];

            for (let i = 0; i < xpathResult.snapshotLength; i++) {
                result.push(xpathResult.snapshotItem(i));
            }

            return result;
        },

        getText: function (node: HTMLElement) {
            return node && node.textContent;
        }
    };
}

function extractNodeNamespaces(node: HTMLElement) {
    const result: Record<string, string> = {}
    for (let i = 0; i < node.attributes.length; ++i) {
        const attr = node.attributes[i]
        if (attr.name.match(/^xmlns/)) {
            const parts = attr.name.split(':');
            const prefix = parts.length === 1 ? 'x' : parts[1];
            result[prefix] = attr.value;
        }
    }
    return result;
}