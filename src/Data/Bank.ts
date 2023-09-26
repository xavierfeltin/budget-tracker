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

export interface IAccountPeriod {
    begin: Date;
    end: Date;
    lines: IAccountLine[];
    isAggregated: boolean;
}

export type TMapping = {[match: string]: string}
export interface IMappingLine {
    match: string;
    tags: string;
}
export type TagLine = {[id: string]: {credit: number, debit: number, subTags: TagLine}; }

export function aggregateByTags(lines: IAccountLine[], tagLevel: number, excludeTag: string): TagLine {
    let agregate: TagLine = {};
    let isRecursive = tagLevel < 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        let idx = excludeTag === "" ? 0 : line.tags.indexOf(excludeTag);
        let level = isRecursive ? (idx % line.tags.length) : tagLevel;
        let tag = line.tags[level];

        if (tag === excludeTag && level < (line.tags.length - 1)) {
            tag = line.tags[level + 1];
        }
        else if (tag === excludeTag && level === (line.tags.length - 1)) {
            tag = isRecursive ? line.tags[0] : "Undefined";
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
    const taggedLines = tag === "" ? lines : lines.filter((line) => line.tags.indexOf(tag) !== -1);

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

export function aggregateByDate(lines: IAccountLine[], monthly: boolean = false): TagLine {
    let agregate: TagLine = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let strDate = line.date.toLocaleDateString("fr-FR");
        if (monthly) {
            strDate = strDate.slice(strDate.indexOf("/")+1)
        }

        if (strDate in agregate) {
            agregate[strDate].credit += line.credit ?? 0;
            agregate[strDate].debit += line.debit ?? 0;
        }
        else {
            agregate[strDate] = {
                credit: line.credit ?? 0,
                debit: line.debit ?? 0,
                subTags: {}
            }
        }
    }
    return agregate;
}

export function getAccountPeriodStr(account: IAccountPeriod): string {
    let aggregatedMention = account.isAggregated ? " (Aggregated) " : "";
    return account.begin.toLocaleDateString() + " - " + account.end.toLocaleDateString() + aggregatedMention;
}

export function getWholePeriod(accounts: IAccountPeriod[]): IAccountPeriod {
    const wholePeriod: IAccountPeriod = accounts.reduce((result, period) => {
        return {...result,
            begin: period.begin < result.begin ? period.begin : result.begin,
            end: period.begin > result.begin ? period.begin : result.begin,
            lines: [...result.lines, ...period.lines],
            isAggregated: true}
      });

      wholePeriod.lines.sort((a: IAccountLine, b: IAccountLine) => {return a.date > b.date ? 1 : -1;});
    return wholePeriod;

}

export function isPaymentLabel(label: string): boolean {
    const regExp = new RegExp(/(PAIEMENT\s)/);
    const test = regExp.test(label.toUpperCase());
    return test;
}

export function isDirectDebitLabel(label: string): boolean {
    const regExp = new RegExp(/(PRLV\sSEPA\s)/);
    const test = regExp.test(label.toUpperCase());
    return test;
}

export function isBankTransferLabel(label: string): boolean {
    const regExp = new RegExp(/(VIR\s)/);
    const test = regExp.test(label.toUpperCase());
    return test;
}

export function isWithdrawalLabel(label: string): boolean {
    const regExp = new RegExp(/(RETRAIT\sDAB\s)/);
    const test = regExp.test(label.toUpperCase());
    return test;
}

export function getPaymentId(label: string): string {
    //PAIEMENT CB 3007 FR LYON LA-BARGE CARTE 2178
    const matches = label.toUpperCase().match(/(?:PAIEMENT\s(?:CB|PSC)\s\d\d\d\d\s)(([a-zA-Z]|-|_|\d+|\/|\*|\s)+)(?:CARTE\s\d\d\d\d)/);
    return matches ? matches[1] : "";
}

export function getDirectDebitId(label: string): string {
    const matches = label.toUpperCase().match(/(?:PRLV\sSEPA\s)(([a-zA-Z]|-|_|\s)+)/);
    return matches ? matches[1] : "";
}

export function getBankTransferId(label: string): string {
    const matches = label.toUpperCase().match(/(?:VIR\s)(([a-zA-Z]|-|_|\s)+)/);
    return matches ? matches[1] : "";
}

export function getWithdrawalId(label: string): string {
    const matches = label.toUpperCase().match(/RETRAIT DAB/);
    return matches ? matches[0] : "";
}

export function extractIdFromLabel(label: string): string {
    if (isBankTransferLabel(label)) {
        return getBankTransferId(label).trim();
    }

    if (isPaymentLabel(label)) {
        return getPaymentId(label).trim();
    }

    if (isDirectDebitLabel(label)) {
        return getDirectDebitId(label).trim();
    }

    if (isWithdrawalLabel(label)) {
        return getWithdrawalId(label).trim();
    }

    return label.trim();
}

export function tagPeriods(periods: IAccountPeriod[], mapping: TMapping): IAccountPeriod[] {
    debugger;
    const taggedPeriods = [...periods];
    for (let i = 0; i < taggedPeriods.length; i++) {
        const period = taggedPeriods[i];
        for (let j = 0; j < period.lines.length; j++) {
            const line = period.lines[j];
            const id = extractIdFromLabel(line.label);
            if (mapping[id]) {
                line.tags = mapping[id].split('>');
            }
        }
    }
    return taggedPeriods;
}