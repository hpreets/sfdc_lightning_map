import { createElement } from 'lwc';
import SubscribeMeV3 from 'c/subscribeMeV3';
import saveSubscriber from '@salesforce/apex/SubscriberLWCHelper.saveSubscriber';
import { ShowToastEventName } from 'lightning/platformShowToastEvent';

const APEX_SUCCESS_INSERT = 'insert';
const APEX_SUCCESS_INSERT_MESSAGE = 'subscribed';
const APEX_SUCCESS_UPDATE = 'update';
const APEX_SUCCESS_UPDATE_MESSAGE = 'updated';
const APEX_ERROR = 'error';

const USER_INPUT_NAME = 'Harpreet';
const USER_INPUT_EMAIL = 'hs@gmail.com.test';

const USER_INPUT_DATA_ID_NAME = 'nameInput';
const USER_INPUT_DATA_ID_EMAIL = 'emailInput';

// Mocking imperative Apex method call
jest.mock(
    '@salesforce/apex/SubscriberLWCHelper.saveSubscriber',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

describe('c-subscribe-me-v3', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    // Helper function to wait until the microtask queue is empty. This is needed for promise
    // timing when calling imperative Apex.
    async function flushPromises() {
        return Promise.resolve();
    }

    it('name email set correctly for apex method', async () => {
        const APEX_PARAMETERS = { name: USER_INPUT_NAME, email: USER_INPUT_EMAIL };

        // Assign mock value for resolved Apex promise
        saveSubscriber.mockResolvedValue(APEX_SUCCESS_INSERT);

        const element = createElement('c-subscribe-me-v3', {
            is: SubscribeMeV3
        });
        document.body.appendChild(element);

        // Name input field for simulating user input
        const inputNameEl = element.shadowRoot.querySelector(
            `lightning-input[data-id="${USER_INPUT_DATA_ID_NAME}"]`
        );
        inputNameEl.value = USER_INPUT_NAME;
        expect(inputNameEl.value).not.toBe('');
        inputNameEl.dispatchEvent(new CustomEvent('change')); // test handleChange method


        // Email input field for simulating user input
        const inputEmailEl = element.shadowRoot.querySelector(
            `lightning-input[data-id="${USER_INPUT_DATA_ID_EMAIL}"]`
        );
        inputEmailEl.value = USER_INPUT_EMAIL;
        expect(inputEmailEl.value).not.toBe('');
        inputEmailEl.dispatchEvent(new CustomEvent('change')); // test handleChange method

        // Initiate button click
        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        await flushPromises();

        // Validate parameters of mocked Apex call
        expect(saveSubscriber.mock.calls[0][0]).toEqual(APEX_PARAMETERS);

        // Validate handleReset is working correctly
        expect(inputNameEl.value).toBe('');
        expect(inputEmailEl.value).toBe('');
    });


    it('inserts subscriber details', async () => {
        // Assign mock value for resolved Apex promise
        saveSubscriber.mockResolvedValue(APEX_SUCCESS_INSERT);

        const element = createElement('c-subscribe-me-v3', {
            is: SubscribeMeV3
        });
        element.name = USER_INPUT_NAME;
        element.email = USER_INPUT_EMAIL;
        document.body.appendChild(element);

        // Mock handler for toast event
        const handler = jest.fn();
        // Add event listener to catch toast event
        element.addEventListener(ShowToastEventName, handler);

        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        await flushPromises();

        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe('Success');
        expect(handler.mock.calls[0][0].detail.message).toContain(APEX_SUCCESS_INSERT_MESSAGE);

        // Validate handleReset is called
        const inputNameEl = element.shadowRoot.querySelector(
            `lightning-input[data-id="${USER_INPUT_DATA_ID_NAME}"]`
        );
        expect(inputNameEl.value).toBe('');

        const inputEmailEl = element.shadowRoot.querySelector(
            `lightning-input[data-id="${USER_INPUT_DATA_ID_EMAIL}"]`
        );
        expect(inputEmailEl.value).toBe('');
    });

    it('updates subscriber details', async () => {
        // Assign mock value for resolved Apex promise
        saveSubscriber.mockResolvedValue(APEX_SUCCESS_UPDATE);

        const element = createElement('c-subscribe-me-v3', {
            is: SubscribeMeV3
        });
        element.name = USER_INPUT_NAME;
        element.email = USER_INPUT_EMAIL;
        document.body.appendChild(element);

        // Mock handler for toast event
        const handler = jest.fn();
        // Add event listener to catch toast event
        element.addEventListener(ShowToastEventName, handler);

        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        await flushPromises();

        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe('Success');
        expect(handler.mock.calls[0][0].detail.message).toContain(APEX_SUCCESS_UPDATE_MESSAGE);

        // Validate handleReset is called
        const inputNameEl = element.shadowRoot.querySelector(
            `lightning-input[data-id="${USER_INPUT_DATA_ID_NAME}"]`
        );
        expect(inputNameEl.value).toBe('');

        const inputEmailEl = element.shadowRoot.querySelector(
            `lightning-input[data-id="${USER_INPUT_DATA_ID_EMAIL}"]`
        );
        expect(inputEmailEl.value).toBe('');
    });


    it('error subscriber details', async () => {
        // Assign mock value for resolved Apex promise
        saveSubscriber.mockResolvedValue(APEX_ERROR);

        const element = createElement('c-subscribe-me-v3', {
            is: SubscribeMeV3
        });
        element.name = USER_INPUT_NAME;
        element.email = USER_INPUT_EMAIL;
        document.body.appendChild(element);

        // Mock handler for toast event
        const handler = jest.fn();
        // Add event listener to catch toast event
        element.addEventListener(ShowToastEventName, handler);

        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        await flushPromises();

        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe('Error');
        expect(handler.mock.calls[0][0].detail.message).toContain(APEX_ERROR);

        // Validate handleReset is not called
        const inputNameEl = element.shadowRoot.querySelector(
            `lightning-input[data-id="${USER_INPUT_DATA_ID_NAME}"]`
        );
        expect(inputNameEl.value).not.toBe('');

        const inputEmailEl = element.shadowRoot.querySelector(
            `lightning-input[data-id="${USER_INPUT_DATA_ID_EMAIL}"]`
        );
        expect(inputEmailEl.value).not.toBe('');
    });
});