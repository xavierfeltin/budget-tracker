import './TagList.css';
import { useEffect, useState } from "react";
import { IAccountLines, extractTags } from "../Data/Bank";

export interface InputRangeProps {
    account: IAccountLines;
    onTagSelect: (tag: string) => void;
}

export function TagList({
        account,
        onTagSelect,
    }: InputRangeProps) {

    const [tags, setTags] = useState<string[]>([])
    const [selectedTag, setSelectedTag] = useState<string>("");

    useEffect(() => {
        const list = extractTags(account.lines);
        setTags(list);
    }, [account])

    return (
        <div>
            <p> Tags:
                {tags.map((tag, idx) => (
                    <button id={"btn-" + tag} name={"btn-" + tag} className={selectedTag === tag ? "btn-link-selected" : "btn-link"} onClick={() => {setSelectedTag(tags[idx]); onTagSelect(tags[idx]);}}>{tag}</button>
                ))}
            </p>
        </div>
    )
}