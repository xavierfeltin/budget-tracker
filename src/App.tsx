import { useCallback, useState } from 'react';
import './App.css';
import { CSVBankExtractLoader } from './Loaders/CSVBankExtractLoader';
import { IAccountLine, IAccountPeriod } from "./Data/Bank";
import { Balance } from './Components/Balance';
import { TagList } from './Components/TagList';
import { BalanceByTag } from './Components/BalanceByTag';
import { BalanceHistoryChart } from './Charts/BalanceHistoryChart';
import { TagHistoryChart } from './Charts/TagHistoryChart';
import { TagRepartitionChart } from './Charts/TagRepartitionChart';
import { TagHistoryMonthlyChart } from './Charts/TagMonthlyHistoryChart';

function App() {

  const [isDataGenerated, setIsDataGenerated] = useState<boolean>(false);
  const [inputData, setInputData] = useState<IAccountPeriod[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");

  const handleCSVLoading = useCallback((data: IAccountPeriod[]): void => {
    if (data.length > 0) {
        setInputData(data);
        setIsDataGenerated(true);
    }
  }, []);

  const onTagSelect = useCallback((tag: string): void => {
    setSelectedTag(tag);
  }, []);

  const getWholePeriod = useCallback((): IAccountPeriod => {
    const wholePeriod = inputData.reduce((result, period) => {
      return {...result,
        begin: period.begin < result.begin ? period.begin : result.begin,
        end: period.begin > result.begin ? period.begin : result.begin,
        lines: [...result.lines, ...period.lines]}
    });
    wholePeriod.lines.sort((a: IAccountLine, b: IAccountLine) => {return a.date > b.date ? 1 : -1;});
    return wholePeriod;
  }, [inputData]);

  // <MainTags account={inputData}/>
  return (
    <div>
        <CSVBankExtractLoader onValuesChange={handleCSVLoading}/>
        {isDataGenerated &&
          <div>
            <Balance account={inputData[0]}/>
            <div style={{width: "50%"}}>
              <BalanceHistoryChart accountLines={getWholePeriod().lines}/>
            </div>

            <TagList account={inputData[0]} onTagSelect={onTagSelect}/>
            <BalanceByTag account={inputData[0]} tag={selectedTag}/>

            <div style={{width: "50%"}}>
              <TagHistoryChart accountLines={inputData[0].lines} tag={selectedTag}/>
            </div>
            <div style={{width: "50%"}}>
              <TagHistoryMonthlyChart accountLines={getWholePeriod().lines} tag={selectedTag}/>
            </div>
            <div style={{width: "50%"}}>
              <TagRepartitionChart accountLines={inputData[0].lines} tag={selectedTag}/>
            </div>
          </div>
        }
    </div>
  );
}

export default App;
