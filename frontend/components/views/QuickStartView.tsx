import {
  Button,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import styled from 'styled-components';
import logo from '../../../assets/logo/seeqr_dock.png';
import '../../lib/style.css';

interface QuickStartViewProps {
  show: boolean;
}

const PageContainer = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  width: auto;
`;

const StyledStepper = styled(Stepper)`
  margin: 60px 0px 20px 0px;
  background: transparent;
`;

const StyledStepLabel = styled(StepLabel)`
  width: 10vw;
  & .MuiStepLabel-label {
    font-size: clamp(1rem, 1.28vw, 1.3rem);
  }
`;

const StyledTypographyInstructions = styled.div`
  font-size: clamp(1rem, 2.2vw, 1.2rem);
  text-align: center;
  width: 40vw;
`;

const StyledTypographyTitle = styled(Typography)`
  font-size: clamp(2rem, 35vw, 3rem);
`;

const NavButtons = styled.div`
  margin: 15px auto;
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StepList = styled.ul`
  text-align: left;
  font-size: 0.9em;
  list-style: circle;

  & li {
    margin-top: 7px;
  }
`;

function getSteps() {
  return [
    'Set Up Servers and Permissions',
    'Import/ Export a Database',
    'Create New Queries',
    'Saving/Loading Queries',
    'Compare Queries',
  ];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return (
        <StyledTypographyInstructions>
          <strong>Step 1:</strong>
          <StepList>
            <li>
              Install PostgreSQL and/or MySQL servers (for Mac, use Homebrew)
            </li>
            <li> Run server(s) in the background</li>
            <li>Ensure that PATH is enabled</li>
            <li>
              MySQL username defaults to 'root' and postgres username defaults to 'postgres' 
              
            </li>
            <li>
              MySQL and postgres password will be your password to log into mySQL and postgres database
            </li>
            <li>
              Ports for PostgresSQL and MySQL are defaulted to ‘5432’ and
              ‘3306’, respectively
            </li>
            <li>Enable full permissions for database manipulation</li>
          </StepList>
        </StyledTypographyInstructions>
      );
    case 1:
      return (
        <StyledTypographyInstructions>
          <strong>Step 2:</strong>
          <StepList>
            <li>
              To import a database, select the file upload icon in the sidebar
            </li>
            <li>Enter a unique name for your database</li>
            <li>
              Click the green &quot;Import File&quot; button and select a .sql
              file
            </li>
            <li>Select your imported database on the sidebar to view</li>
            <li>
              To view each table, click the name of the table in the top tabs
              bar
            </li>
            <li>
              The chart will include column names, types, and if they are
              nullable
            </li>
            <li>
              To export a database, select the file download icon next to the
              database name
            </li>
          </StepList>
        </StyledTypographyInstructions>
      );
    case 2:
      return (
        <StyledTypographyInstructions>
          <strong>Step 3:</strong>
          <StepList>
            <li>Select which database you want to query with</li>
            <li>Select the &quot;QUERIES&quot; tab in the sidebar</li>
            <li>Give the query a label and a group</li>
            <li>
              Optionally: You can change the database from the
              &quot;Database&quot; dropdown
            </li>
            <li>
              Use the brush icon on the top-right to automatically format the
              query
            </li>
            <li>
              Use the previous queries dropdown to view and select previously inputted queries
            </li>
            <li>Select &quot;RUN QUERY&quot; button to execute</li>
            <li>
              The planning time, execution time, and actual total time now show
            </li>
            <li>The results from the query are in the table below</li>
            <li>
              Select the &quot;Execution Plan&quot; button to view the analysis
              of running the query
            </li>
          </StepList>
        </StyledTypographyInstructions>
      );
    case 3:
      return (
        <StyledTypographyInstructions>
          <strong>Step 4:</strong>
          <StepList>
            <li>
              To save a query, click the folder icon in the &quot;QUERIES&quot;
              tab
            </li>
            <li>
              Designate a save file location and click &quot;Select Path&quot;
            </li>
            <li>
              Click the save icon in the query group drop-down to save queries
              automatically to designated file location
            </li>
            <li>
              To import a query file, click the import icon, select the file you
              wish to upload (.json) in your local file system and click
              &quot;Upload&quot;
            </li>
          </StepList>
        </StyledTypographyInstructions>
      );
    case 4:
      return (
        <StyledTypographyInstructions>
          <strong>Step 5:</strong>
          <StepList>
            <li>Select the checkboxes in the query group drop-down</li>
            <li>
              Click the chart icon at the top of the sidebar to compare selected
              queries
            </li>
          </StepList>
        </StyledTypographyInstructions>
      );
    default:
      return 'Unknown step';
  }
}

function QuickStartView({ show }: QuickStartViewProps) {
  if (!show) return null;
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(new Set<number>());
  const [skipped, setSkipped] = useState(new Set<number>());
  const steps = getSteps();

  const totalSteps = () => getSteps().length;

  const isStepOptional = (step: number) => step === null;

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const skippedSteps = () => skipped.size;

  const completedSteps = () => completed.size;

  const allStepsCompleted = () =>
    completedSteps() === totalSteps() - skippedSteps();

  const isLastStep = () => activeStep === totalSteps() - 1;

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed
          // find the first step that has been completed
          steps.findIndex((step, i) => !completed.has(i))
        : activeStep + 1;

    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = new Set(completed);
    newCompleted.add(activeStep);
    setCompleted(newCompleted);

    if (completed.size !== totalSteps() - skippedSteps()) {
      handleNext();
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted(new Set<number>());
    setSkipped(new Set<number>());
  };

  const isStepSkipped = (step: number) => skipped.has(step);

  function isStepComplete(step: number) {
    return completed.has(step);
  }

  return (
    <PageContainer>
      <StyledTypographyTitle align="center">
        Welcome to SeeQR
      </StyledTypographyTitle>
      <img className="step-img" src={logo} alt="Logo" />
      <StyledStepper alternativeLabel nonLinear activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const buttonProps: { optional?: React.ReactNode } = {};
          if (isStepOptional(index)) {
            buttonProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps} completed={isStepComplete(index)}>
              <StepButton onClick={handleStep(index)} {...buttonProps}>
                <StyledStepLabel className="stepper">{label}</StyledStepLabel>
              </StepButton>
            </Step>
          );
        })}
      </StyledStepper>
      <div>
        {allStepsCompleted() ? (
          <div>
            <StyledTypographyInstructions className="step-instructions">
              All steps completed - you&apos;re ready to use SeeQr!
            </StyledTypographyInstructions>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <StepContent>
            {getStepContent(activeStep)}
            <NavButtons>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className="step-btn"
              >
                Back
              </Button>
              {isStepOptional(activeStep) && !completed.has(activeStep) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSkip}
                  className="step-btn"
                >
                  Skip
                </Button>
              )}
              {activeStep !== steps.length &&
                (completed.has(activeStep) ? (
                  <Typography variant="caption" className="step-completed">
                    Step
                    {` ${activeStep + 1} `}
                    already completed
                  </Typography>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleComplete}
                  >
                    {completedSteps() === totalSteps() - 1
                      ? 'Finish'
                      : 'Complete Step'}
                  </Button>
                ))}
            </NavButtons>
          </StepContent>
        )}
      </div>
    </PageContainer>
  );
}

export default QuickStartView;
