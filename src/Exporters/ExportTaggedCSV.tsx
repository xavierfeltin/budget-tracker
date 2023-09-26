import { useEffect, useMemo, useState } from 'react';
import { CSVLink } from "react-csv";
import { IAccountPeriod } from '../Data/Bank';

export interface InputRangeProps {
    periods: IAccountPeriod[];
}

export function ExportTaggedCSV({periods} : InputRangeProps) {
    const [csvData, setCsvData] = useState<{}[]>([]);

    const headers = useMemo(() => {
        return [ {label: "Date", key: "date"},
        {label: "Date de valeur", key: "valueDate"},
        {label: "Débit", key: "debit"},
        {label: "Crédit", key: "credit"},
        {label: "Libellé", key: "label"},
        {label: "Solde", key: "balance"},
        {label: "Tags", key: "tags"} ];
    }, []);

    useEffect(() => {
        const csv: {}[] = [];
        for (let i = 0; i < periods.length; i++) {
            const lines = periods[i].lines;
            for (let j = 0; j < lines.length; j++) {
                const line = lines[j];
                let csvLine = {
                    date: line.date.toLocaleDateString("fr-FR"),
                    valueDate: line.date.toLocaleDateString("fr-FR"),
                    debit: line.debit ? (line.debit * -1).toLocaleString("fr-FR").replace(" ", "") : "", // Negative value in original file from bank
                    credit: line.credit ? line.credit.toLocaleString("fr-FR").replace(" ", "") : "",
                    label: line.label,
                    balance: line.balance.toLocaleString("fr-FR").replace(" ", ""),
                    tags: line.tags.join('>')
                }
                csv.push(csvLine);
            }
        }

        setCsvData(csv);
    }, [periods, headers]);

    return (
        <CSVLink data={csvData} headers={headers} separator={";"} filename="tagged_account.csv">
            Download tagged account
        </CSVLink>
    )
}