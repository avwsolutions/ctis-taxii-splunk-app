import {createSlice} from "@reduxjs/toolkit";
import {v4 as uuidv4} from 'uuid';

export const sightingsSlice = createSlice({
    name: 'sightings',
    initialState: {
        sightings: {},
        signal: null,
        lastSignalRespondedTo: {},
        errors: {},
        submissionErrors: {}
    },
    reducers: {
        submitData: (state, action) => {
            state.sightings[action.payload.id] = action.payload.data;
        },
        triggerValidationSignal: (state) => {
            state.signal = state.signal === null ? 0 : state.signal + 1;
        },
        validationDone: (state, action) => {
            const {id} = action.payload;
            state.lastSignalRespondedTo[id] = action.payload.signal;
            state.errors[id] = action.payload.errors;
        },
        addSighting: (state, action) => {
            const newId = uuidv4();
            state.sightings[newId] = action.payload || {};
        },
        removeSighting: (state, action) => {
            delete state.sightings[action.payload.id];
            if(state.submissionErrors[action.payload.id]){
                delete state.submissionErrors[action.payload.id];
            }
            if(state.errors[action.payload.id]){
                delete state.errors[action.payload.id];
            }
            if(state.lastSignalRespondedTo[action.payload.id]){
                delete state.lastSignalRespondedTo[action.payload.id];
            }
        },
        addSubmissionError: (state, action) => {
            state.submissionErrors[action.payload.id] = action.payload.errors;
        },
        clearAllSubmissionErrors: (state) => {
            state.submissionErrors = {};
        }
    },
    selectors: {
        waitingForValidation: (state) => {
            const ids = new Set(Object.keys(state.sightings));
            const idsWithSignalRespondedTo = new Set(Object.keys(state.lastSignalRespondedTo));
            const intersection = ids.intersection(idsWithSignalRespondedTo);
            if(intersection.size !== ids.size){
                return true;
            }
            return Object.values(state.lastSignalRespondedTo).some(x => x !== state.signal);
        },
        getValidationSignal: (state) => {
            return state.signal;
        }
    }
});

export const {
    submitData,
    triggerValidationSignal,
    validationDone,
    addSighting,
    removeSighting,
    addSubmissionError,
    clearAllSubmissionErrors
} = sightingsSlice.actions;
export const {waitingForValidation, getValidationSignal} = sightingsSlice.selectors;
