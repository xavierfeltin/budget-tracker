import "./Balance.css";
import { useEffect, useState } from "react";
import { IAccountPeriod } from "../Data/Bank";

export interface InputRangeProps {
    account: IAccountPeriod;
}

export function Balance({
        account
    }: InputRangeProps) {

    const [debit, setDebit] = useState<number>(0);
    const [credit, setCredit] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        let debit = 0;
        let credit = 0;
        for (let i = 0; i < account.lines.length; i++) {
            debit += account.lines[i].debit ?? 0;
            credit += account.lines[i].credit ?? 0;
        }

        setDebit(debit);
        setCredit(credit);
        setBalance(account.lines[account.lines.length - 1].balance);
    }, [account])

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