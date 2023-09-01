import { useEffect, useState } from "react";
import { IAccountLines } from "../Data/Bank";

export interface InputRangeProps {
    account: IAccountLines;
}

export function Balance({
        account
    }: InputRangeProps) {

    const [debit, setDebit] = useState<number>(0);
    const [credit, setCredit] = useState<number>(0);

    useEffect(() => {
        let debit = 0;
        let credit = 0;
        for (let i = 0; i < account.lines.length; i++) {
            debit += account.lines[i].debit ?? 0;
            credit += account.lines[i].credit ?? 0;
        }

        setDebit(debit);
        setCredit(credit);
    }, [account])

    return (
        <div>
            <p>Debit: -{debit} </p>
            <p>Credit: +{credit} </p>
            <p>Balance: {credit - debit}</p>
        </div>
    )
}