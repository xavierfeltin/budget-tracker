import { useCallback, useState } from 'react';
import './App.css';
import { CSVBankExtractLoader } from './Loaders/CSVBankExtractLoader';
import { IAccountLines } from "./Data/Bank";
import { Balance } from './Components/Balance';
import { MainTags } from './Components/MainTags';
import { TagList } from './Components/TagList';
import { BalanceByTag } from './Components/BalanceByTag';

function App() {

  const [isDataGenerated, setIsDataGenerated] = useState<boolean>(false);
  const [inputData, setInputData] = useState<IAccountLines>({lines: []});
  const [selectedTag, setSelectedTag] = useState<string>("");

  const handleCSVLoading = useCallback((data: IAccountLines): void => {
    if (data.lines.length > 0) {
        setInputData((existingData: IAccountLines) => {
            return {lines: [...existingData.lines, ...data.lines]}
        });
        setIsDataGenerated(true);
    }
  }, []);

  const onTagSelect = useCallback((tag: string): void => {
    setSelectedTag(tag);
  }, []);

  // <Balance account={inputData}/>
  // <MainTags account={inputData}/>
  return (
    <div>
        <CSVBankExtractLoader onValuesChange={handleCSVLoading}/>
        {isDataGenerated &&
          <div>
            <TagList account={inputData} onTagSelect={onTagSelect}/>
            {selectedTag &&
              <BalanceByTag account={inputData} tag={selectedTag}/>
            }

          </div>
        }
    </div>
  );
}

export default App;
