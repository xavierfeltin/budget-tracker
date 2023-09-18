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
import { IAccountLine, aggregateByDate, aggregateByTags } from "../Data/Bank";
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
    maintainAspectRatio?: boolean;
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
        const groupByTag = aggregateByTags(taggedLines, -1, tag);
        const tags = Object.keys(groupByTag);

        const groupByDate = aggregateByDate(taggedLines);
        const dateLabels =  Object.keys(groupByDate).sort((a, b) => {
            let dA = new Date(parseInt(a.split("/")[2]), parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
            let dB = new Date(parseInt(b.split("/")[2]), parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
            return dA > dB ? 1 : -1;
        });

        const processedTags: string[] = [];
        for (let i = 0; i < tags.length; i++) {
            const subTaggedLines = taggedLines.filter((line) => line.tags.indexOf(tags[i]) !== -1 && !line.tags.some(t => processedTags.includes(t)));
            const groupSubTagByDate = aggregateByDate(subTaggedLines);

            let historyDebit = Object.keys(groupByDate).sort((a, b) => {
                let dA = new Date(parseInt(a.split("/")[2]), parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
                let dB = new Date(parseInt(b.split("/")[2]), parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
                return dA > dB ? 1 : -1;
            }).map((date) => groupSubTagByDate[date] ? groupSubTagByDate[date].debit - groupSubTagByDate[date].credit: 0);

            /*
            let historyCredit = Object.keys(groupByDate).sort((a, b) => {
                let dA = new Date(parseInt(a.split("/")[2]), parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
                let dB = new Date(parseInt(b.split("/")[2]), parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
                return dA > dB ? 1 : -1;
            }).map((date) => groupSubTagByDate[date] ? -groupSubTagByDate[date].credit : 0);
            */

            let datasetDebit: IChartDataset = {
                label: tags[i],
                yAxisID: 'y',
                data: historyDebit,
                backgroundColor: CHART_COLORS[i%CHART_COLORS.length]
            };
            datasets.push(datasetDebit);

            /*
            let datasetCredit: IChartDataset = {
                label: tags[i],
                yAxisID: 'y',
                data: historyCredit,
                backgroundColor: CHART_COLORS[i%CHART_COLORS.length]
            };
            datasets.push(datasetCredit);
            */

            processedTags.push(tags[i]);
        }

        let dataToDisplay: IChartData = {
            labels: dateLabels,
            datasets: datasets
        };

        setChartData(dataToDisplay);

        let options: IChartOption = {
            responsive: true,
            maintainAspectRatio: false,
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
                    text: "Debit history of " + (tag || "Tous")
                },
                datalabels: {
                    borderRadius: 25,
                    borderWidth: 2,
                    color: 'black',
                    display: (context: Context): boolean => {
                        const val: number = context.dataset.data[context.dataIndex] as number;
                        return val !== 0;
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
            <Bar options={chartOption} data={chartData} style={{width:"100%",height:"100%"}} />
        </div>
   )
}