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
        setTags(["Tous", ...list]);
    }, [account])

    return (
        <div>
            <h1> Tags </h1>
            {tags.map((tag, idx) => (
                <button id={"btn-" + tag} name={"btn-" + tag} className={(selectedTag === tag || (tag === "Tous" && selectedTag === "")) ? "btn-link-selected " : "btn-link "} onClick={() => {setSelectedTag(idx === 0 ? "" : tags[idx]); onTagSelect(idx === 0 ? "" : tags[idx]);}}>{tag}</button>
            ))}
        </div>
    )
}