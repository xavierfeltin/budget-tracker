import { useEffect, useState } from "react";
import { aggregateByTag, IAccountLines, TagLine } from "../Data/Bank";

export interface InputRangeProps {
    account: IAccountLines;
    tag: string;
}

export function BalanceByTag({
        account,
        tag
    }: InputRangeProps) {

    const [group, setGroup] = useState<TagLine>({})

    useEffect(() => {
        const group = aggregateByTag(account.lines, tag)
        setGroup(group);
    }, [account, tag])

    return (
        <div>
            <p> Balance for {tag}: -{group[tag]?.debit || 0} / +{group[tag]?.credit || 0}</p>
            {Object.keys(group[tag]?.subTags || {}).sort((a, b) => group[tag].subTags[b].debit - group[tag].subTags[a].debit).map((subKey: string) => (
                <p> - <b>{subKey}</b>: (-{group[tag].subTags[subKey].debit} / Credit: +{group[tag].subTags[subKey].credit})</p>
            ))}
        </div>
    )
}