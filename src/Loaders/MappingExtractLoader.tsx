import { useEffect, useState } from "react";
import { IMappingLine, TMapping } from "../Data/Bank";
import { CSVUploader } from "./CSVUploader";

export interface InputRangeProps {
    onValuesChange: (loadedData: TMapping) => void;
}

export function MappingExtractLoader({
    onValuesChange} : InputRangeProps) {

    const [data, setData] = useState<TMapping>({});

    const handleFiles = (files: File[]) => {
        setData({});

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
        const lineSeperator = "\n";
        const fieldSeparator = ";";
        const headers = ["Match","Tags"];
        let rows = csv.split(lineSeperator);

        // Determine headers order
        let re = /"/gi;
        let csvHeader = rows[0].split(fieldSeparator).map((header) => header.toLowerCase().replace(re, ""));
        const headersIdx = headers.map((header) => csvHeader.indexOf(header.toLowerCase()));

        // Ignore first header
        let csvRows = rows[1].split(lineSeperator).filter((row: string) => row !== "");

        // Ignore first header
        csvRows = rows.slice(1).filter((row: string) => row !== "");
        const lines: IMappingLine[] = csvRows.map(row => {
            const values = row.split(fieldSeparator).map((field) => field.replace(/['"]+/g, ''));

            const dataRow: IMappingLine = {
                match: values[headersIdx[0]],
                tags: values[headersIdx[1]]
            };

            return dataRow;
        })

        const data: TMapping = {};
        for (let i = 0; i < lines.length; i++) {
            data[lines[i].match] = lines[i].tags;
        }

        setData(data);
    };

    useEffect(() => {
        onValuesChange(data);
    }, [data, onValuesChange]);

    return (
        <CSVUploader handleFiles={handleFiles} formId="load-mapping" actionLabel="Upload mapping"/>
    )
}