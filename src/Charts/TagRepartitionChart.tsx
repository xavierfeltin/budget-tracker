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
import { IAccountLine, aggregateByTags } from "../Data/Bank";

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
        const taggedLines = tag === "" ? accountLines : accountLines.filter((line) => line.tags.indexOf(tag) !== -1);
        const groupByTag = aggregateByTags(taggedLines, -1, tag);
        //const tagLabels = Object.keys(groupByTag).sort();
        //const data: number[] = Object.keys(groupByTag).filter((subTag) => groupByTag[subTag].debit !== 0).sort().map((subTag) => groupByTag[subTag].debit);
        const tagLabels = Object.keys(groupByTag).filter((subTag) => groupByTag[subTag].debit !== 0).sort();
        const data: number[] = tagLabels.filter((subTag) => groupByTag[subTag].debit !== 0).map((subTag) => groupByTag[subTag].debit);

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
                    text: "Repartition of " + (tag || "Tous")
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
        <div className="pie-chart-wrapper">
            <Pie options={chartOption} data={chartData}/>
        </div>
   )
}