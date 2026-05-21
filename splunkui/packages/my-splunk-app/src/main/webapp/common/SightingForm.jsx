import React from 'react';
import styled from 'styled-components';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import Modal from '@splunk/react-ui/Modal';

import SubmitButton from '@splunk/my-page/src/SubmitButton';

const MyForm = styled.form`
    max-width: 900px;
`;

const FIELD_DESCRIPTION = 'description';
const FIELD_COUNT = 'count';
const FIELD_CONFIDENCE = 'confidence';

export default function SightingForm() {

    const methods = useForm({
        mode: 'all',
        defaultValues: {
            description: '',
            count: 1,
            confidence: 50,
        },
    });

    const {
        handleSubmit,
        formState,
    } = methods;

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <FormProvider {...methods}>
            <MyForm onSubmit={handleSubmit(onSubmit)}>

                <Message type='info'>
                    Create New Sighting
                </Message>

                <div style={{ marginBottom: '20px' }}>
                    <label>Description</label>

                    <textarea
                        style={{
                            width: '100%',
                            minHeight: '120px',
                        }}
                        {...methods.register(FIELD_DESCRIPTION)}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Count</label>

                    <input
                        type='number'
                        min='1'
                        max='100'
                        {...methods.register(FIELD_COUNT)}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Confidence</label>

                    <input
                        type='number'
                        min='1'
                        max='100'
                        {...methods.register(FIELD_CONFIDENCE)}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                }}>
                    <SubmitButton
                        inline
                        disabled={formState.isSubmitting}
                        submitting={formState.isSubmitting}
                        label='Create Sighting'
                    />

                    <Button
                        appearance='secondary'
                        label='Cancel'
                    />
                </div>

                <Modal open={false}>
                    <Modal.Header title='Success' />

                    <Modal.Body>
                        Sighting created
                    </Modal.Body>
                </Modal>

            </MyForm>
        </FormProvider>
    );
}