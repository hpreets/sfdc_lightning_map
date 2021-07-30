import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// import { createRecord } from 'lightning/uiRecordApi';
// import SUBSCRIBER_OBJECT from '@salesforce/schema/Subscriber__c';
// import NAME_FIELD from '@salesforce/schema/Subscriber__c.Name';
// import EMAIL_FIELD from '@salesforce/schema/Subscriber__c.Subscriber_Email__c';
import saveSubscriber from '@salesforce/apex/SubscriberLWCHelper.saveSubscriber';

export default class SubscribeMeV3 extends LightningElement {
    name;
    email;
    
    subscribeMe() {
        // const fields = {};
        // fields[NAME_FIELD.fieldApiName] = this.name;
        // fields[EMAIL_FIELD.fieldApiName] = this.email;
        console.log('Name', this.name);
        console.log('Email', this.email);
        // const recordInput = { apiName: SUBSCRIBER_OBJECT.objectApiName, fields };
        // createRecord(recordInput)
        saveSubscriber({name: this.name, email: this.email})
        .then(result => {
            console.log(result);
            if (result === 'insert') {
                this.showToast('Success', `Thanks ${this.name}. You are subscribed successfully on ${this.email}`, 'success');
                this.handleReset();
            }
            else if (result === 'update') {
                this.showToast('Success', `Thanks ${this.name}. Your email ${this.email} is updated successfully.`, 'success');
                this.handleReset();
            }
            else {
                this.showToast('Error', `${result}`, 'error');
            }
        })
        .catch(error => {
            this.showToast('Error', `${error}`, 'error');
        });
    }

    handleChange(event) {
        console.log('field name', event.target.name);
        const field = event.target.name;
        if (field === 'name') {
            this.name = event.target.value;
        } else if (field === 'email') {
            this.email = event.target.value;
        }
        console.log('name', this.name);
        console.log('email', this.email);
    }

    handleReset() {
        this.name = '';
        this.email = '';
        console.log('Resetting name and email ::', this.name, this.email);
    }

    showToast(title, msg, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: msg,
                variant: variant
            })
        );
    }
}