export interface IAccountLine {
    date: Date;
    debit: number | undefined;
    credit: number | undefined;
    label: string;
    balance: number;
    tags: string[];
}

export interface IAccountLines {
    lines: IAccountLine[];
}

export type TagLine = {[id: string]: {credit: number, debit: number, subTags: TagLine}; }

export function aggregateByTags(lines: IAccountLine[], tagLevel: number, excludeTag: string): TagLine {
    let agregate: TagLine = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        let tag = line.tags[tagLevel];
        if (tag === excludeTag && tagLevel < (line.tags.length - 1)) {
            tag = line.tags[tagLevel + 1];
        }
        else if (tag === excludeTag && tagLevel === (line.tags.length - 1)) {
            tag = "Undefined";
        }

        if (tag in agregate) {
            agregate[tag].credit += line.credit ?? 0;
            agregate[tag].debit += line.debit ?? 0;
        }
        else {
            agregate[tag] = {
                credit: line.credit ?? 0,
                debit: line.debit ?? 0,
                subTags: {}
            }
        }
    }

    return agregate;
}

export function extractTags(lines: IAccountLine[]): string[] {
    let tags: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        tags.push(...lines[i].tags);
    }

    // Remove duplicates
    tags = tags.filter(function(tag, idx) {
        return tags.indexOf(tag) === idx;
    });

    return tags.sort();
}

export function aggregateByTag(lines: IAccountLine[], tag: string): TagLine {
    let agregate: TagLine = {};
    const taggedLines = lines.filter((line) => line.tags.indexOf(tag) !== -1);

    for (let i = 0; i < taggedLines.length; i++) {
        const line = taggedLines[i];
        if (tag in agregate) {
            agregate[tag].credit += line.credit ?? 0;
            agregate[tag].debit += line.debit ?? 0;
        }
        else {
            agregate[tag] = {
                credit: line.credit ?? 0,
                debit: line.debit ?? 0,
                subTags: {}
            }
        }
    }
    agregate[tag].subTags = aggregateByTags(taggedLines, 0, tag);
    return agregate;
}