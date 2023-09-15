import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { CSVBankExtractLoader } from './Loaders/CSVBankExtractLoader';
import { IAccountPeriod, getWholePeriod } from "./Data/Bank";
import { Balance } from './Components/Balance';
import { TagList } from './Components/TagList';
import { BalanceHistoryChart } from './Charts/BalanceHistoryChart';
import { TagHistoryChart } from './Charts/TagHistoryChart';
import { TagRepartitionChart } from './Charts/TagRepartitionChart';
import { TagHistoryMonthlyChart } from './Charts/TagMonthlyHistoryChart';
import { AccountList } from './Components/AccountList';

function App() {

  const [isDataGenerated, setIsDataGenerated] = useState<boolean>(false);
  const [periods, setPeriods] = useState<IAccountPeriod[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<IAccountPeriod>({
    begin: new Date(),
    end: new Date(),
    lines: [],
    isAggregated: false
  });

  const handleCSVLoading = useCallback((data: IAccountPeriod[]): void => {
    if (data.length > 0) {
        const wholePeriod = getWholePeriod(data);
        setPeriods([wholePeriod, ...data]);
        setSelectedPeriod(wholePeriod);
    }
  }, []);

  const onAccountSelect = useCallback((account: IAccountPeriod): void => {
    setSelectedPeriod(account);
  }, []);

  const onTagSelect = useCallback((tag: string): void => {
    setSelectedTag(tag);
  }, []);

  useEffect(() => {
    if (periods.length > 0) {
      setIsDataGenerated(true);
    }
  }, [periods])

  return (
    <div className='gridLayout'>
        <div className='leftColumn'>
          <CSVBankExtractLoader onValuesChange={handleCSVLoading}/>
          {isDataGenerated &&
            <AccountList periods={periods} onAccountSelect={onAccountSelect}></AccountList>
          }
          {isDataGenerated &&
            <TagList account={selectedPeriod} onTagSelect={onTagSelect}/>
          }
        </div>
        {isDataGenerated &&
          <div>

            <Balance account={selectedPeriod}/>
            <div style={{width: "50%"}}>
              <BalanceHistoryChart accountLines={selectedPeriod.lines}/>
            </div>

            <div style={{width: "50%"}}>
              <TagHistoryChart accountLines={selectedPeriod.lines} tag={selectedTag}/>
            </div>
            <div style={{width: "50%"}}>
              <TagHistoryMonthlyChart accountLines={selectedPeriod.lines} tag={selectedTag}/>
            </div>
            <div style={{width: "50%"}}>
              <TagRepartitionChart accountLines={selectedPeriod.lines} tag={selectedTag}/>
            </div>
          </div>
        }
    </div>
  );
}

export default App;
