import { useEffect, useState } from "react";
import { IAccountLine, IAccountPeriod } from "../Data/Bank";
import { CSVUploader } from "./CSVUploader";

export interface InputRangeProps {
    onValuesChange: (loadedData: IAccountPeriod[]) => void;
}

export function CSVBankExtractLoader({
    onValuesChange} : InputRangeProps) {

    const [data, setData] = useState<IAccountPeriod[]>([]);

    const handleFiles = (files: File[]) => {
        setData([]);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileReader = new FileReader();
            fileReader.onload = function (event: ProgressEvent<FileReader>) {
                let content: string = "";
                if (event.target !== null) {
                    content = event.target.result as string || "";
                }
                csvFileToArray(file.name, content);
            };
            fileReader.readAsText(file);
        }
    };

    const csvFileToArray = (filename: string, csv: string) => {
        debugger;
        const lineSeperator1 = "\r\n";
        const lineSeperator2 = "\n";
        let lineSeperator = lineSeperator1;
        const fieldSeparator = ";";
        const headers = ["Date","Débit","Crédit","Libellé","Solde","Tags"];
        let rows = csv.split(lineSeperator1);
        if (rows.length === 1) {
            rows = csv.split(lineSeperator2);
            lineSeperator = lineSeperator2;
        }

        // Determine headers order
        let re = /"/gi;
        let csvHeader = rows[0].split(fieldSeparator).map((header) => header.toLowerCase().replace(re, ""));
        const headersIdx = headers.map((header) => csvHeader.indexOf(header.toLowerCase()));

        // Ignore first header
        let csvRows = rows[1].split(lineSeperator).filter((row: string) => row !== "");

        // Ignore first header
        csvRows = rows.slice(1).filter((row: string) => row !== "");
        const lines: IAccountLine[] = csvRows.map(row => {
            const values = row.split(fieldSeparator).map((field) => field.replace(/['"]+/g, ''));

            // Expecting dd/mm/yyyy
            const dateElements: number[] = values[headersIdx[0]].split("/").map((elem) => Number.parseFloat(elem));
            const dataRow: IAccountLine = {
              date: new Date(dateElements[2], dateElements[1] - 1, dateElements[0]),
              debit: values[headersIdx[1]] ? Number.parseFloat(values[headersIdx[1]].replace(',', '.')) * -1 : undefined, // only positive values
              credit: values[headersIdx[2]] ? Number.parseFloat(values[headersIdx[2]].replace(',', '.')) : undefined,
              label: values[headersIdx[3]],
              balance: Number.parseFloat(values[headersIdx[4]].replace(',', '.')),
              tags: values[headersIdx[5]].split(">"),
            };

            return dataRow;
        })

        const data: IAccountPeriod = {
            begin: new Date(lines[0].date.getFullYear(), lines[0].date.getMonth(), 1),
            end: new Date(lines[0].date.getFullYear(), lines[0].date.getMonth() + 1, 0),
            lines: lines,
            isAggregated: false
        };

        setData(prev => [...prev, data].sort((a, b) => a.end > b.end ? 1 : -1));
    };

    useEffect(() => {
        onValuesChange(data);
    }, [data, onValuesChange]);

    return (
        <CSVUploader handleFiles={handleFiles} formId="load-accounts" actionLabel="Upload Bank accounts" />
    )
}