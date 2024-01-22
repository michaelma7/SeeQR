import path from 'path';
import * as fs from 'fs'
import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, Tooltip } from '@mui/material/';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  ButtonContainer,
  TextFieldContainer,
  StyledButton,
  StyledTextField,
  DropdownContainer,
  StyledInputLabel,
  StyledNativeDropdown,
  StyledNativeOption,
} from '../../style-variables';
import { DBType } from '../../../backend/BE_types';
import MenuContext from '../../state_management/Contexts/MenuContext';


type AddNewDbModalProps = {
  open: boolean;
  onClose: () => void;
  dbNames: string[] | undefined;
  curDBType: DBType | undefined;
};

function AddNewDbModal({
  open,
  onClose,
  dbNames,
  curDBType,
}: AddNewDbModalProps) {
  const { dispatch: menuDispatch } = useContext(MenuContext);

  const [newDbName, setNewDbName] = useState('');


  const [isError, setIsError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  // const [curDBType, setDBType] = useState<DBType>();

  // Resets state for error messages
  const handleClose = () => {
    setIsError(false);
    setIsEmpty(true);
    onClose();
  };

  // Error message depending on if the text field is empty or a duplicate
  const errorMessage = () => {
    if (isEmpty) {
      return 'Required: Database must have a name. Please enter a unique name.';
    }
    if (isError) {
      return 'This database name already exists. Please enter a unique name.';
    }
    return '';
  };

  /// / Set schema name
  const handleDbName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dbNameInput = event.target.value;
    // if (dbNameInput.length === 0) {
    //   setIsEmpty(true);
    // } else {
    //   setIsEmpty(false);
    // }
    // check if the newDbName is not a duplicate
    let dbSafeName = dbNameInput;
    // convert input label name to lowercase only with no spacing to comply with db naming convention.
    dbSafeName = dbSafeName.replace(/[^\w-]/gi, '');
    if (dbNames?.includes(dbSafeName)) {
      setIsError(true);
    } else {
      setIsError(false);
    }
    setNewDbName(dbSafeName);
  };

  // Opens modal to select file and sends the selected file to backend
  const handleDBimport = (dbName: string | undefined, closeModal: () => void) => {
    // TODO: fix the any type.
    const dbt: DBType = (document.getElementById('dbTypeDropdown') as any).value;
    const options = {
      title: 'Import DB',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Import',
      filters: [
        {
          name: 'Custom File Type',
          extensions: ['sql', 'tar'],
        },
      ],
    };
    
    
    const importdb = (filePath: string) => {
      fs.readFile(filePath, 'utf-8', (err, data)=> {
        if(err) {
          console.error(`Error reading file: ${err.message}`);
          return;
        }

        // this is for sql files that already have a name via CREATE DATABASE 
        const dataArr = data.replace(/`([^`]+)`|\b([a-zA-Z_]+)\b/g, '$1$2').match(/\S+/g) || [];
        const keyword1 = 'CREATE';
        const keyword2 = 'DATABASE';
        console.log('data', dataArr)
  
        const containsKeywords = dataArr.some((word, index) => {
          // Check if the current word is 'CREATE' and the next word is 'DATABASE'
          if (word === keyword1 && dataArr[index + 1] === keyword2) {
            return true;
          }
          return false;
        });
    
        /* checks if the keyword exist in our database file */
        if(containsKeywords) {
          console.log('keywords exist:', containsKeywords);

          let fileDbName = ''
            // eslint-disable-next-line no-restricted-syntax
            for (const [index, word] of dataArr.entries()) {
              if (word === keyword1 && dataArr[index + 1] === keyword2) {
                // Assuming the database name is the next word after 'DATABASE'
                fileDbName = dataArr[index + 2];
              }
            }
            
            console.log('name', fileDbName)
            setNewDbName(fileDbName)

          menuDispatch({
            type: 'ASYNC_TRIGGER',
            loading: 'LOADING',
            options: {
              event: 'import-db',
              payload: { newDbName: dbName, filePath, dbType: dbt }, // see importDb for type reqs
              callback: closeModal,
            },
          });
        } else {
          // console.log('keywords exists?,', containsKeyword)

          /* if keyword does not exist, run menuDispatch, which requires user to input a database name */
          menuDispatch({
            type: 'ASYNC_TRIGGER',
            loading: 'LOADING',
            options: {
              event: 'import-db',
              payload: { newDbName: dbName , filePath, dbType: dbt }, // see importDb for type reqs
              callback: closeModal,
            },
          });
        }
      })
    };

    // initial async call
    menuDispatch({
      type: 'ASYNC_TRIGGER',
      loading: 'LOADING',
      options: {
        event: 'showOpenDialog',
        payload: options,
        callback: importdb,
      },
    });
  };

  return (
    <div>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={handleClose}
        aria-labelledby="modal-title"
        open={open}
      >
        <TextFieldContainer>
          <DialogTitle id="alert-dialog-title">
            Import Existing SQL or TAR File
          </DialogTitle>
          <Tooltip title="Any special characters will be removed">
            <StyledTextField
              // required
              error={isError}
              helperText={errorMessage()}
              id="filled-basic"
              label="Enter a database name"
              size="small"
              variant="outlined"
              onChange={handleDbName}
              InputProps={{
                style: { color: '#575151' },
              }}
            />
          </Tooltip>
        </TextFieldContainer>
        <DropdownContainer>
          <StyledInputLabel
            id="dbtype-select-label"
            variant="standard"
            htmlFor="uncontrolled-native"
          >
            Database Type
          </StyledInputLabel>
          <StyledNativeDropdown
            id="dbTypeDropdown"
            defaultValue={DBType.Postgres}
          >
            <StyledNativeOption value={DBType.Postgres}>
              Postgres
            </StyledNativeOption>
            <StyledNativeOption value={DBType.MySQL}>MySQL</StyledNativeOption>
          </StyledNativeDropdown>
        </DropdownContainer>
        <ButtonContainer>
          <StyledButton
            variant="contained"
            color="secondary"
            onClick={handleClose}
          >
            Cancel
          </StyledButton>
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={
              // isEmpty || isError
              //   ? () => {}
              //   : 
              isError
                ? () => {}
                : 
              () => handleDBimport(newDbName, handleClose)
            }
          >
            Import
          </StyledButton>
        </ButtonContainer>
      </Dialog>
    </div>
  );
}

export default AddNewDbModal;
