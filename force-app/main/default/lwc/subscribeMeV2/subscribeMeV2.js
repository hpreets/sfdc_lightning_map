import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SubscribeMeV2 extends LightningElement {

    handleReset(event) {
        console.log('handleReset event recordEditForm');
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        console.log('handleReset event recordEditForm :: inputFields ::', inputFields);
        if (inputFields) {
            inputFields.forEach(field => {
                console.log('handleReset event recordEditForm :: field ::', field);
                field.reset();
            });
        }
    }

    handleSuccess(event) {
        console.log('onsuccess event recordEditForm ', event.detail.id);
        console.log('Starting reset');
        this.handleReset(event);
        console.log('Displaying toast');
        this.displayToast(event, 'You are successfully subscribed', 'Success', 'success');
    }
    handleSubmit(event) {
        console.log('onsubmit event recordEditForm'+ event.detail.fields);
    }

    displayToast(event, message, title, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
     
}