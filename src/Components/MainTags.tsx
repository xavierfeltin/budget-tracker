import { useEffect, useState } from "react";
import { aggregateByTags, IAccountLine, IAccountLines, TagLine } from "../Data/Bank";

export interface InputRangeProps {
    account: IAccountLines;
}

export function MainTags({
        account
    }: InputRangeProps) {

    const [groups, setGroups] = useState<TagLine>({})



    useEffect(() => {
        const groups = aggregateByTags(account.lines, 0, "");
        const mainTags = Object.keys(groups);

        for (let i = 0; i < mainTags.length; i++) {
            const mainTag = mainTags[i];
            const lines = account.lines.filter((line) => line.tags[0] === mainTag);
            groups[mainTag].subTags = aggregateByTags(lines, 1, "");
        }

        setGroups(groups);
    }, [account])

    return (
        <div>
            <p> Balance for main tags </p>
            {Object.keys(groups).sort((a, b) => groups[b].debit - groups[a].debit).map((key: string) => (
                <div>
                    <p><b>{key}</b>: (-{groups[key].debit} / Credit: +{groups[key].credit})</p>
                    {Object.keys(groups[key].subTags).sort((a, b) => groups[key].subTags[b].debit - groups[key].subTags[a].debit).map((subKey: string) => (
                        <p> - <b>{subKey}</b>: (-{groups[key].subTags[subKey].debit} / Credit: +{groups[key].subTags[subKey].credit})</p>
                    ))}
                </div>
            ))}
        </div>
    )
}