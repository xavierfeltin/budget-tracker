import { useEffect, useState } from 'react';
import { CSVLink } from "react-csv";
import { IAccountPeriod, extractIdFromLabel } from '../Data/Bank';

export interface InputRangeProps {
    periods: IAccountPeriod[];
}

export function ExportMapping({periods} : InputRangeProps) {
    const headers = [
        {label: "Match", key: "id"},
        {label: "Tags", key: "tags"}];

    const [csvData, setCsvData] = useState<{}[]>([]);

    useEffect(() => {

        const mapping: {[id: string]: string} = {};
        for (let i = 0; i < periods.length; i++) {
            const lines = periods[i].lines;
            for (let j = 0; j < lines.length; j++) {
                const label = lines[j].label;
                const id = extractIdFromLabel(label);

                if (id === "") {
                    console.warn("ID not found for " + label);
                    continue;
                }

                const tags = lines[j].tags.join('>');
                if (!Object.keys(mapping).includes(id) && tags !=="") {
                    mapping[id] = tags;
                }
                else if (Object.keys(mapping).includes(id) && tags !== mapping[id] && tags !== "") {
                    console.log("Found different tags " + tags + " for " + id + " than " + mapping[id] + " in label " + label);
                }
            }
        }

        const csv: {}[] = [];
        Object.keys(mapping).forEach((key) => {
            let line = {
                id: key,
                tags: mapping[key],
            }
            csv.push(line);
        })

        setCsvData(csv);
    }, [periods]);

    return (
        <CSVLink data={csvData} headers={headers} separator={";"} filename="mapping_labels_tags.csv">
            Download Account-Tags mapping
        </CSVLink>
    )
}