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
import { IAccountLine, aggregateByDate } from "../Data/Bank";

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
        const taggedLines = accountLines.filter((line) => line.tags.indexOf(tag) !== -1);
        const groupByDate = aggregateByDate(taggedLines);

        let historyDebit = Object.keys(groupByDate).sort((a, b) => {
            let dA = new Date(parseInt(a.split("/")[2]), parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
            let dB = new Date(parseInt(b.split("/")[2]), parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
            return dA > dB ? 1 : -1;
        }).map((date) => groupByDate[date].debit);

        let historyCredit = Object.keys(groupByDate).sort((a, b) => {
            let dA = new Date(parseInt(a.split("/")[2]), parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
            let dB = new Date(parseInt(b.split("/")[2]), parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
            return dA > dB ? 1 : -1;
        }).map((date) => groupByDate[date].credit);

        const dateLabels =  Object.keys(groupByDate).sort((a, b) => {
            let dA = new Date(parseInt(a.split("/")[2]), parseInt(a.split("/")[1]) - 1, parseInt(a.split("/")[0]));
            let dB = new Date(parseInt(b.split("/")[2]), parseInt(b.split("/")[1]) - 1, parseInt(b.split("/")[0]));
            return dA > dB ? 1 : -1;
        });

        let datasets: IChartDataset[] = [];
        let dataset: IChartDataset = {
            label: tag + " Amount (Debit)",
            yAxisID: 'y',
            data: historyDebit,
            backgroundColor: CHART_COLORS[0]
        };
        datasets.push(dataset);

        dataset = {
            label: tag + " Amount (Credit)",
            yAxisID: 'y',
            data: historyCredit,
            backgroundColor: CHART_COLORS[1]
        };
        datasets.push(dataset);

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
                    text: "Evolution of " + tag
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