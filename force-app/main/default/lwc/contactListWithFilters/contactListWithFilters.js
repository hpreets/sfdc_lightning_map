import { LightningElement, wire } from 'lwc';
// import { refreshApex } from '@salesforce/apex'
import getContactData from '@salesforce/apex/ContactListLWCHelper.getContactData';
import getColumnDetails from '@salesforce/apex/ContactListLWCHelper.getColumnDetails';
import getFilterData from '@salesforce/apex/ContactListLWCHelper.getFiltersData';
import getFilterDetails from '@salesforce/apex/ContactListLWCHelper.getFilterDetailsJSON';

export default class ContactListWithFilters extends LightningElement {

    filtersData = {
    };

    @wire(getFilterData)
    filterDataV2(result) {

        if (result.data) {
            // This will convert data from List<SObject> to desired JSON format.
            this.filtersData = JSON.parse(result.data);
        }
    };

    filterAttributes = {
        title : { selectedValue:'' }, 
        account : { selectedValue:'' },
        level : { selectedValue:'' },
        leadsource : { selectedValue:'' },
        industry : { selectedValue:'' }
    };

    @wire(getFilterDetails)
    filterDetails(result) {
        if (result.data) {
            // This will convert data from List<SObject> to desired JSON format.
            this.filterAttributes = JSON.parse(result.data);
            console.log('this.filterAttributes', this.filterAttributes);
        }
    }

    /* connectedCallback() {
        getFilterDetails()
        .then(result => {
            console.log('connectedCallback getFilterDetails result', result);
            // console.log('connectedCallback getFilterDetails result.data', result.data);
            this.filterAttributes = JSON.parse(result);
            console.log('connectedCallback this.filterAttributes', this.filterAttributes);
        });
    } */


    sortBy = 'Name';
    contacts;

    @wire(getContactData, {sortBy : '$sortBy', filters: '$filterValues'/* , filterAttr : '$filterAttrs' */ } )
    contactsMethod(result) {
        if (result.data) {
            // This will convert data from List<SObject> to desired JSON format.
            this.contacts = result.data;
        }
    }

    columns;

    @wire(getColumnDetails)
    stringColumns(result) {
        if (result.data) {
            // This will convert data from List<SObject> to desired JSON format.
            this.columns = JSON.parse(result.data);
        }
    };

    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    onHandleSort() {
        // TBD:
    }

    
    get filterValues() {
        let filterVals = [];
        Object.values(this.filterAttributes).forEach(value => {
            console.log(value.name, value.selectedValue);
            filterVals.push(value.selectedValue);
        });
        return filterVals;
    }

    handleChange(event) {
        console.log('field name', event.target.name);
        const field = String(event.target.name);
        this.filterAttributes[field].selectedValue = String(event.target.value);
    }

    doSearch() {
        console.log(this.filterValues);
        // refreshApex(this.wiredContacts);
        getContactData( {sortBy : this.sortBy, filters: this.filterValues/* , filterAttrs: this.filterAttrs */ } )
        .then(result => {
            console.log('doSearch result', result);
            if (result) {
                console.log('doSearch Setting contacts', result.data);
                this.contacts = result;
            }
        });
    }

}