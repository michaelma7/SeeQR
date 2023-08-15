import path from 'path';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { IconButton, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import React, { useContext } from 'react';
import styled from 'styled-components';
import {
  deleteQuery,
  getAppDataPath,
  key as queryKey,
  saveQuery,
  setCompare,
} from '../../lib/queries';
import {
  greenPrimary,
  greyDark,
  greyDarkest,
  SidebarList,
  StyledListItemText,
  textColor,
} from '../../style-variables';
import { AppState, QueryData } from '../../types';
import QueryEntry from './QueryEntry';
import MenuContext from '../../state_management/Contexts/MenuContext';

const QueryText = styled(StyledListItemText)`
  & .MuiListItemText-secondary {
    color: ${textColor};
  }
`;

type QueryListProps = Pick<
  AppState,
  | 'queries'
  | 'setQueries'
  | 'comparedQueries'
  | 'setComparedQueries'
  | 'workingQuery'
  | 'setWorkingQuery'
  | 'setFilePath'
  | 'newFilePath'
> & {
  createQuery: () => void;
  show: boolean;
};

const StyledSidebarList = styled(SidebarList)`
  background-color: ${greyDarkest};
`;

function QueryList({
  queries,
  createQuery,
  setQueries,
  comparedQueries,
  setComparedQueries,
  workingQuery,
  setWorkingQuery,
  setFilePath,
  newFilePath,
  show,
}: QueryListProps) {
  const { dispatch: menuDispatch } = useContext(MenuContext);
  const deleteQueryHandler = (query: QueryData) => () => {
    setQueries(deleteQuery(queries, query));
    setComparedQueries(deleteQuery(comparedQueries, query));
  };

  const setComparisonHandler =
    (query: QueryData) => (evt: React.ChangeEvent<HTMLInputElement>) => {
      setComparedQueries(
        setCompare(comparedQueries, queries, query, evt.target.checked),
      );
      // setComparedQueries(setCompare(comparedQueries, query));
    };

  const saveQueryHandler = (query: QueryData, filePath: string) => () => {
    saveQuery(query, filePath);
  };

  // const loadQueryHandler = async () => {
  //   // annabelle's refactor
  //   const options = {
  //     title: 'Upload Query',
  //     defaultPath: path.join(__dirname, '../assets/'),
  //     buttonLabel: 'Upload',
  //     filters: [
  //       {
  //         name: 'Text Files',
  //         extensions: ['json', 'docx', 'txt'],
  //       },
  //     ],
  //   };

  //   try {
  //     const filePath = await ipcRenderer.invoke('showOpenDialog', options);
  //     setFilePath(filePath);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const loadQueryHandler = (setFilePath) => {
    const options = {
      title: 'Upload Query',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Upload',
      filters: [
        {
          name: 'Text Files',
          extensions: ['json', 'docx', 'txt'],
        },
      ],
    };
    const setFilepathCallback = (val) => setFilePath(val);
    menuDispatch({
      type: 'ASYNC_TRIGGER',
      loading: 'LOADING',
      options: {
        event: 'showOpenDialog',
        payload: options,
        callback: setFilepathCallback,
      },
    });
  };

  if (!show) return null;

  const values: Array<QueryData> = Object.values(queries);
  const accordians: object = {};

  // Algorithm to create the entrys to be bundled into accoridans
  const compQ: any = { ...comparedQueries };
  if (values.length > 0) {
    for (let i = 0; i < values.length; i++) {
      let compared = false;
      if (compQ[queryKey(values[i])]) {
        if (compQ[queryKey(values[i])].hasOwnProperty('executionPlan')) {
          if (
            compQ[queryKey(values[i])].executionPlan['Execution Time'] !== 0
          ) {
            compared = true;
          }
        }
      }

      const entry: JSX.Element = (
        <QueryEntry
          // This key is used in the .map to create the group label for accordians
          key={`QueryList_${values[i].label}_${values[i].db}_group:::${values[i].group}`}
          query={values[i]}
          select={() => setWorkingQuery(values[i])}
          isSelected={
            !!workingQuery && queryKey(values[i]) === queryKey(workingQuery)
          }
          deleteThisQuery={deleteQueryHandler(values[i])}
          isCompared={compared}
          setComparison={setComparisonHandler(values[i])}
          saveThisQuery={saveQueryHandler(values[i], newFilePath)}
        />
      );

      if (!accordians[values[i].group]) {
        accordians[values[i].group] = [entry];
      } else {
        accordians[values[i].group].push([entry]);
      }
    }
  }

  // function to store user-selected file path in state

  // const designateFile = async function () {
  //   // REVIEW: not sure if supposed to move this to it's own ipcMain
  //   const options = {
  //     title: 'Choose File Path',
  //     defaultPath: `${getAppDataPath()}`,
  //     buttonLabel: 'Select Path',
  //     filters: [{ name: 'JSON', extensions: ['json'] }],
  //   };

  //   try {
  //     const filePath = await ipcRenderer.invoke('showSaveDialog', options);
  //     setFilePath(filePath);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const designateFile = (setFilePath) => {
    const options = {
      title: 'Choose File Path',
      defaultPath: `${getAppDataPath()}`,
      buttonLabel: 'Select Path',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    };
    const setFilePathCallback = (val) => setFilePath(val);
    menuDispatch({
      type: 'ASYNC_TRIGGER',
      loading: 'LOADING',
      options: {
        event: 'showSaveDialog',
        payload: options,
        callback: setFilePathCallback,
      },
    });
  };

  return (
    <>
      <span>
        <Tooltip title="New Query">
          <IconButton onClick={createQuery} size="large">
            <AddIcon fontSize="large" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Import Query">
          <IconButton
            onClick={() => loadQueryHandler(setFilePath)}
            size="large"
          >
            <UploadFileIcon fontSize="large" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Designate Save Location">
          <IconButton onClick={() => designateFile(setFilePath)} size="large">
            <FileCopyIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </span>

      <StyledSidebarList>
        {Object.values(accordians).map((arrGroup: any) => (
          <Tooltip title="drop down">
            <Accordion>
              <AccordionSummary
                sx={{
                  backgroundColor: `${greenPrimary}`,
                  color: 'black',
                }}
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography sx={{ color: 'black' }}>
                  <QueryText
                    primary={arrGroup[0].key.slice(
                      arrGroup[0].key.indexOf('group:::') + 8,
                    )}
                  />
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{ backgroundColor: `${greyDark}`, color: `${textColor}` }}
              >
                {arrGroup}
              </AccordionDetails>
            </Accordion>
          </Tooltip>
        ))}
      </StyledSidebarList>
    </>
  );
}

export default QueryList;
