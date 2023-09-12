import { useEffect, useState } from "react";
import { IAccountLine, IAccountPeriod } from "../Data/Bank";

export interface InputRangeProps {
    onValuesChange: (loadedData: IAccountPeriod[]) => void;
}

export function CSVBankExtractLoader({
    onValuesChange} : InputRangeProps) {

    const [files, setFiles] = useState<File[]>([]);
    const [data, setData] = useState<IAccountPeriod[]>([]);

    const handleOnChange = (e: React.FormEvent<HTMLInputElement>) => {
        const nbFiles = e.currentTarget.files?.length || 0;
        const files: File[] = [];
        for (let i = 0; i < nbFiles; i++) {
            if (e.currentTarget.files) {
                files.push(e.currentTarget.files[i]);
            }
        }
        setFiles(files);
    };

    const handleOnSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
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
        const lineSeperator = "\r\n";
        const fieldSeparator = ";";
        const headers = ["Date","Débit","Crédit","Libellé","Solde","Tags"];
        let rows = csv.split(lineSeperator);

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
              debit: values[headersIdx[1]] ? Number.parseFloat(values[headersIdx[1]]) * -1 : undefined, // only positive values
              credit: values[headersIdx[2]] ? Number.parseFloat(values[headersIdx[2]]) : undefined,
              label: values[headersIdx[3]],
              balance: Number.parseFloat(values[headersIdx[4]]),
              tags: values[headersIdx[5]].split(">"),
            };

            return dataRow;
        })

        const data: IAccountPeriod = {
            begin: new Date(lines[0].date.getFullYear(), lines[0].date.getMonth(), 1),
            end: new Date(lines[0].date.getFullYear(), lines[0].date.getMonth() + 1, 0),
            lines: lines
        };

        setData(prev => [...prev, data]);
    };

    useEffect(() => {
        onValuesChange(data);
    }, [data, onValuesChange]);

    return (
        <div>
            <form>
            <input
                type={"file"}
                id={"csvFileInput"}
                accept={".csv"}
                onChange={handleOnChange}
                multiple={true}
            />

            <button
                onClick={(e) => {
                handleOnSubmit(e);
                }}
            >
            Import Monthly CSV bank extracts
            </button>
            </form>
        </div>
    )
}