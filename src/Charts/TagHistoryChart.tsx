import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    LinearScale,
    CategoryScale,
    Tooltip,
    Title,
    Legend,
    BarElement
  } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CHART_COLORS } from "./ColorBank";
import { IAccountLine, aggregateByDate, aggregateByTag, aggregateByTags } from "../Data/Bank";
import { Context } from "chartjs-plugin-datalabels";

export interface InputRangeProps {
    accountLines: IAccountLine[];
    tag: string;
}

export interface IChartDataset {
    label: string;
    yAxisID?: string;
    data: number[];
    backgroundColor: string;
}

export interface IChartData {
    labels: string[];
    datasets: IChartDataset[];
}

export interface IChartOption {
    responsive: boolean;
    scales: any;
    animation: any;
    plugins: any;
}

ChartJS.register(
    LinearScale,
    CategoryScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export function TagHistoryChart({
    accountLines,
    tag,
    }: InputRangeProps): JSX.Element {

    const [chartOption, setChartOption] = useState<IChartOption>({responsive: true, animation: {}, scales: {}, plugins: {}});
    const [chartData, setChartData] = useState<IChartData>({labels: [], datasets: []});

    useEffect(() => {
        let datasets: IChartDataset[] = [];

        const taggedLines = tag === "" ? accountLines : accountLines.filter((line) => line.tags.indexOf(tag) !== -1);
        const groupByTag = tag === "" ? aggregateByTags(taggedLines, 0, tag) : aggregateByTags(taggedLines, 0, tag);
        const tags = Object.keys(groupByTag);

        const groupByDate = aggregateByDate(taggedLines);
        const dateLabels =  Object.keys(groupByDate).sort((a, b) => {
            let dA = new Date(parseInt(a.split("/")[2]), parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
            let dB = new Date(parseInt(b.split("/")[2]), parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
            return dA > dB ? 1 : -1;
        });

        for (let i = 0; i < tags.length; i++) {
            const subTaggedLines = taggedLines.filter((line) => line.tags.indexOf(tags[i]) !== -1 && line.tags.indexOf(tags[i]) < 1);
            const groupSubTagByDate = aggregateByDate(subTaggedLines);

            let historyDebit = Object.keys(groupByDate).sort((a, b) => {
                let dA = new Date(parseInt(a.split("/")[2]), parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
                let dB = new Date(parseInt(b.split("/")[2]), parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
                return dA > dB ? 1 : -1;
            }).map((date) => groupSubTagByDate[date] ? groupSubTagByDate[date].debit : 0);

            let dataset: IChartDataset = {
                label: tags[i],
                yAxisID: 'y',
                data: historyDebit,
                backgroundColor: CHART_COLORS[i%CHART_COLORS.length]
            };
            datasets.push(dataset);
        }

        let dataToDisplay: IChartData = {
            labels: dateLabels,
            datasets: datasets
        };

        setChartData(dataToDisplay);

        let options: IChartOption = {
            responsive: true,
            animation: {
                duration: 0
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    stacked: true
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount'
                    },
                    stacked: true
                }
            },
            plugins: {
                legend: {
                   position: 'top' as const,
                },
                title: {
                    display: true,
                    text: "Debit history of " + tag
                },
                datalabels: {
                    borderRadius: 25,
                    borderWidth: 2,
                    color: 'black',
                    display: (context: Context): boolean => {
                        const val: number = context.dataset.data[context.dataIndex] as number;
                        return val > 0;
                    },
                    formatter: (value: number, context: Context): string => {
                        return Math.round(value).toString();
                    },
                    font: {
                      weight: 'bold'
                    },
                    padding: 6,
                    textAlign: "center"
                }
            }
        }
        setChartOption(options);

   }, [accountLines, tag]);

    return (
        <div>
            <Bar options={chartOption} data={chartData} />
        </div>
   )
}