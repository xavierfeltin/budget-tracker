import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Title,
    Legend
  } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Context } from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { PIE_BACKGROUND_COLORS, PIE_BORDER_COLORS } from "./ColorBank";
import { IAccountLine, aggregateByTag } from "../Data/Bank";

export interface InputRangeProps {
    accountLines: IAccountLine[];
    tag: string;
}

export interface IChartDataset {
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    datalabels?: any;
}

export interface IChartData {
    labels: string[];
    datasets: IChartDataset[];
}

export interface IChartOption {
    responsive: boolean;
    animation: any;
    plugins: any;
}

ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

export function TagRepartitionChart({
    accountLines,
    tag,
    }: InputRangeProps): JSX.Element {

    const [chartOption, setChartOption] = useState<IChartOption>({responsive: true, animation: {}, plugins: {}});
    const [chartData, setChartData] = useState<IChartData>({labels: [], datasets: []});

    useEffect(() => {
        const group = aggregateByTag(accountLines, tag);
        const tagLabels = Object.keys(group[tag]?.subTags).filter((subTag) => group[tag].subTags[subTag].debit !== 0).sort();
        const data: number[] = Object.keys(group[tag]?.subTags).filter((subTag) => group[tag].subTags[subTag].debit !== 0).sort().map((subTag) => group[tag].subTags[subTag].debit);

        let datasets: IChartDataset[] = [];
        let dataset: IChartDataset = {
            data: data,
            backgroundColor: PIE_BACKGROUND_COLORS,
            borderColor: PIE_BORDER_COLORS,
            datalabels: {
                anchor: 'end',
                align: 'bottom'
            }
        };
        datasets.push(dataset);

        let dataToDisplay: IChartData = {
            labels: tagLabels,
            datasets: datasets
        };

        setChartData(dataToDisplay);

        let options: IChartOption = {
            responsive: true,
            animation: {
                duration: 0
            },
            plugins: {
                legend: {
                   position: 'top' as const,
                },
                title: {
                    display: true,
                    text: "Repartition of " + tag
                },
                datalabels: {
                    borderRadius: 25,
                    borderWidth: 2,
                    color: 'black',
                    font: {
                      weight: 'bold'
                    },
                    padding: 6,
                    formatter: function(value: number, context: Context): string {
                        const currentLabel = context.chart.data.labels ? context.chart.data.labels[context.dataIndex] : "";
                        return currentLabel + "\n" + Math.round(value).toString();
                    },
                    textAlign: "center"
                }
            }
        }
        setChartOption(options);

   }, [accountLines, tag]);

    return (
        <div>
            <Pie options={chartOption} data={chartData} />
        </div>
   )
}