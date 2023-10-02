import "./Balance.css";
import { useEffect, useState } from "react";
import { IAccountPeriod } from "../Data/Bank";

export interface InputRangeProps {
    account: IAccountPeriod;
    tag: string;
}

export function Balance({
        account,
        tag
    }: InputRangeProps) {

    const [debit, setDebit] = useState<number>(0);
    const [credit, setCredit] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        let debit = 0;
        let credit = 0;

        const taggedLines = tag === "" ? account.lines : account.lines.filter((line) => line.tags.indexOf(tag) !== -1);
        for (let i = 0; i < taggedLines.length; i++) {
            debit += taggedLines[i].debit ?? 0;
            credit += taggedLines[i].credit ?? 0;
        }

        setDebit(debit);
        setCredit(credit);
        setBalance(account.lines[account.lines.length - 1].balance);
    }, [account, tag])

    return (
        <div>
            <div className="row">
                <div className="column">
                    <h2 className="title">Last balance</h2>
                    <p>{balance.toFixed(2)}</p>
                </div>
                <div className="column">
                    <h2 className="title">Debit</h2>
                    <p>-{debit.toFixed(2)}</p>
                </div>
                <div className="column">
                    <h2 className="title">Credit</h2>
                    <p>+{credit.toFixed(2)}</p>
                </div>
            </div>
        </div>
    )
}