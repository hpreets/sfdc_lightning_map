import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/Subscriber__c.Name';
import EMAIL_FIELD from '@salesforce/schema/Subscriber__c.Subscriber_Email__c';

export default class SubscribeMe extends LightningElement {
    objectApiName = 'Subscriber__c';
    fields = [NAME_FIELD, EMAIL_FIELD];
    recordId = null;

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
        console.log('Details saved successfully :: event ::' + JSON.stringify(event));
        this.recordId = null;
        this.handleReset(event);
        this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'You are subscribed successfully',
                variant: 'success'
            })
        );
    }
}