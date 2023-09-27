import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { CSVBankExtractLoader } from './Loaders/CSVBankExtractLoader';
import { IAccountPeriod, TMapping, getWholePeriod, tagPeriods } from "./Data/Bank";
import { Balance } from './Components/Balance';
import { TagList } from './Components/TagList';
import { BalanceHistoryChart } from './Charts/BalanceHistoryChart';
import { TagHistoryChart } from './Charts/TagHistoryChart';
import { TagRepartitionChart } from './Charts/TagRepartitionChart';
import { TagHistoryMonthlyChart } from './Charts/TagMonthlyHistoryChart';
import { AccountList } from './Components/AccountList';
import { ExportMapping } from './Exporters/ExportMapping';
import { MappingExtractLoader } from './Loaders/MappingExtractLoader';
import { ExportTaggedCSV } from './Exporters/ExportTaggedCSV';

function App() {

  const [isDataGenerated, setIsDataGenerated] = useState<boolean>(false);
  const [isMappingLoaded, setIsMappingLoaded] = useState<boolean>(false);
  const [isDataToTagLoaded, setisDataToTagLoaded] = useState<boolean>(false);
  const [periods, setPeriods] = useState<IAccountPeriod[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<IAccountPeriod>({
    begin: new Date(),
    end: new Date(),
    lines: [],
    isAggregated: false
  });
  const [mapping, setMapping] = useState<TMapping>({});
  const [linesToTag, setLinesToTag] = useState<IAccountPeriod[]>([]);

  const handleCSVLoading = useCallback((data: IAccountPeriod[]): void => {
    if (data.length > 0) {
        const wholePeriod = getWholePeriod(data);
        setPeriods([wholePeriod, ...data]);
        setSelectedPeriod(wholePeriod);
    }
  }, []);

  const handleCSVToTagLoading = useCallback((data: IAccountPeriod[]): void => {
    if (data.length > 0) {
        const taggedData: IAccountPeriod[] = tagPeriods(data, mapping);
        setLinesToTag(taggedData)
    }
  }, [mapping]);

  const handleMappingLoading = useCallback((data: TMapping): void => {
      setMapping(data);
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

    if (Object.keys(mapping).length > 0) {
      setIsMappingLoaded(true);
    }

    if (linesToTag.length > 0) {
      setisDataToTagLoaded(true);
    }
  }, [periods, mapping, linesToTag])

  return (
    <div className='gridLayout'>
        <div className='leftColumn'>
          {!isMappingLoaded &&
            <CSVBankExtractLoader onValuesChange={handleCSVLoading}/>
          }

          {!isDataGenerated &&
            <MappingExtractLoader onValuesChange={handleMappingLoading}/>
          }

          {isMappingLoaded &&
            <CSVBankExtractLoader onValuesChange={handleCSVToTagLoading}/>
          }

          {isDataToTagLoaded &&
            <ExportTaggedCSV periods={linesToTag}></ExportTaggedCSV>
          }

          {isDataGenerated &&
            <ExportMapping periods={periods}></ExportMapping>
          }
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

            {selectedTag === "" &&
              <div>
                <BalanceHistoryChart accountLines={selectedPeriod.lines}/>
                <TagRepartitionChart accountLines={selectedPeriod.lines} tag={selectedTag}/>
              </div>
            }

            {selectedTag !== "" &&
              <div>
                <TagHistoryMonthlyChart accountLines={selectedPeriod.lines} tag={selectedTag}/>
                <TagHistoryChart accountLines={selectedPeriod.lines} tag={selectedTag}/>
                <TagRepartitionChart accountLines={selectedPeriod.lines} tag={selectedTag}/>
              </div>
            }
          </div>
        }
    </div>
  );
}

export default App;
