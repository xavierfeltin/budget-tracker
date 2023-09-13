import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    LinearScale,
    CategoryScale,
    Tooltip,
    Title,
    Legend,
    LineElement,
    PointElement,
  } from 'chart.js';
import { Line } from 'react-chartjs-2';
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
    datalabels: any;
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
    PointElement,
    LineElement,
    CategoryScale,
    Title,
    Tooltip,
    Legend
);

export function TagHistoryMonthlyChart({
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

        const groupByDate = aggregateByDate(taggedLines, true);
        const dateLabels =  Object.keys(groupByDate).sort((a, b) => {
            let dA = new Date(2023, parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
            let dB = new Date(2023, parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
            return dA > dB ? 1 : -1;
        });

        // Dataset to cover the tag
        let tagHistoryDebit = Object.keys(groupByDate).sort((a, b) => {
            let dA = new Date(2023, parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
            let dB = new Date(2023, parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
            return dA > dB ? 1 : -1;
        }).map((date) => groupByDate[date] ? groupByDate[date].debit : 0);

        let dataset: IChartDataset = {
            label: tag || "Tous",
            yAxisID: 'y',
            data: tagHistoryDebit,
            backgroundColor: CHART_COLORS[0],
            datalabels: {
                anchor: 'center',
                align: 'bottom'
            }
        };
        datasets.push(dataset);

        // Datasets to cover the sub tags
        const processedTags: string[] = [];
        for (let i = 0; i < tags.length; i++) {
            const subTaggedLines = taggedLines.filter((line) => line.tags.indexOf(tags[i]) !== -1 && !line.tags.some(t => processedTags.includes(t)));
            const groupSubTagByDate = aggregateByDate(subTaggedLines, true);

            let historyDebit = Object.keys(groupByDate).sort((a, b) => {
                let dA = new Date(2023, parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
                let dB = new Date(2023, parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
                return dA > dB ? 1 : -1;
            }).map((date) => groupSubTagByDate[date] ? groupSubTagByDate[date].debit : 0);

            let dataset: IChartDataset = {
                label: tags[i],
                yAxisID: 'y',
                data: historyDebit,
                backgroundColor: CHART_COLORS[(i+1)%CHART_COLORS.length],
                datalabels: {
                    anchor: 'center',
                    align: 'bottom'
                }
            };
            datasets.push(dataset);
            processedTags.push(tags[i]);
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
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount'
                    }
                }
            },
            plugins: {
                legend: {
                   position: 'top' as const,
                },
                title: {
                    display: true,
                    text: "Debit monthly history of " + (tag || "Tous")
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
            <Line options={chartOption} data={chartData} />
        </div>
   )
}