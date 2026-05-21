import styled from 'styled-components';
                        <input
                            type='number'
                            min='1'
                            max='100'
                            disabled={false}
                            {...methods.register(FIELD_COUNT)}
                        />
                    </CustomControlGroup>

                    <CustomControlGroup>
                        <label>Confidence</label>
                        <input
                            type='number'
                            min='1'
                            max='100'
                            disabled={false}
                            {...methods.register(FIELD_CONFIDENCE)}
                        />
                    </CustomControlGroup>

                    <HorizontalButtonLayout>
                        <SubmitButton
                            inline
                            disabled={submitButtonDisabled}
                            submitting={formState.isSubmitting}
                            label={editMode ? 'Edit Sighting' : 'Create Sighting'}
                        />

                        <Button
                            appearance='secondary'
                            label='Cancel'
                            to={VIEW_SIGHTINGS_PAGE}
                        />
                    </HorizontalButtonLayout>
                </section>

                <Modal open={submitSuccess}>
                    <Modal.Header
                        title={editMode
                            ? 'Successfully Updated Sighting'
                            : 'Successfully Created Sighting'}
                    />

                    <Modal.Body>
                        <GotoSightingsPageButton />
                    </Modal.Body>
                </Modal>
            </MyForm>
        </FormProvider>
    );
}

Form.propTypes = {
    existingSighting: PropTypes.object,
};

function EditModeForm({sightingId}) {
    const {
        record: sighting,
        loading,
        error,
    } = useGetRecord({
        restGetFunction: getSighting,
        restFunctionQueryArgs: {
            sightingId,
        },
    });

    return (
        <Loader loading={loading} error={error}>
            <Form existingSighting={sighting} />
        </Loader>
    );
}

EditModeForm.propTypes = {
    sightingId: PropTypes.string.isRequired,
};

export default function SightingForm({editMode, sightingId}) {
    return editMode
        ? <EditModeForm sightingId={sightingId} />
        : <Form />;
}