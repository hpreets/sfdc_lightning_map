import { LightningElement, wire } from 'lwc';
// import { refreshApex } from '@salesforce/apex'
import getContactData from '@salesforce/apex/ContactListLWCHelper.getContactData';
import getColumnDetails from '@salesforce/apex/ContactListLWCHelper.getColumnDetails';
import getFilterData from '@salesforce/apex/ContactListLWCHelper.getFiltersData';
import getFilterDetails from '@salesforce/apex/ContactListLWCHelper.getFilterDetailsJSON';

export default class ContactListWithFilters extends LightningElement {

    /**
     * It contains data for all filters. options property of lightning-combobox 
     * refers to this property.
     */ 
    filtersData = {};

    /**
     * Filter data received from Apex Controller is in String. 
     * This method converts it to JSON for further usage.
     * @param {*} result - String representation of all filter JSON data
     */
    @wire(getFilterData)
    filtersDataMethod(result) {

        if (result.data) {
            // This will convert data from List<SObject> to desired JSON format.
            this.filtersData = JSON.parse(result.data);
        }
    };

    /**
     * Contain details of filter properties. 
     * 
     * IMPORTANT: Any new filter added, an entry should be made here.
     */
    filterAttributes = {
        title : { selectedValue:'' }, 
        account : { selectedValue:'' },
        level : { selectedValue:'' },
        leadsource : { selectedValue:'' },
        industry : { selectedValue:'' }
    };

    /**
     * Fetches filterAttributes from Apex Controller, converts it from 
     * String to JSON and sets filterAttributes property.
     * @param {*} result - filter attributes in String format
     */
    @wire(getFilterDetails)
    filterAttributesMethod(result) {
        if (result.data) {
            // This will convert data from List<SObject> to desired JSON format.
            this.filterAttributes = JSON.parse(result.data);
            console.log('this.filterAttributes', this.filterAttributes);
        }
    }

    // Controls the sort field. It should be field API Name
    sortBy = 'Name';

    /**
     * Contain data for datatable lwc component.
     */
    contacts;

    /**
     * Fetches contacts data from backend. Takes sortBy and filters as parameters. 
     * filterValues returns data at runtime by iterating through filterAttributes property.
     * @param {*} result - contacts data based on filters, sorted by sortBy
     */
    @wire(getContactData, {sortBy : '$sortBy', filters: '$filterValues' } )
    contactsMethod(result) {
        if (result.data) {
            // This will convert data from List<SObject> to desired JSON format.
            this.contacts = result.data;
        }
    }

    /**
     * columns to be displayed on datatable lwc component.
     */
    columns;

    /**
     * Retrives columns information from backend and sets columns property by converting result to JSON.
     * @param {*} result - column information retrieved from backend.
     */
    @wire(getColumnDetails)
    columnsMethod(result) {
        if (result.data) {
            // This will convert data from List<SObject> to desired JSON format.
            this.columns = JSON.parse(result.data);
        }
    };

    // default sort direction - used in datatable LWC component
    defaultSortDirection = 'asc';

    // sort direction - used in datatable LWC component
    sortDirection = 'asc';

    // sorted by - used in datatable LWC component
    sortedBy;


    /**
     * method called on click on column header for sorting
     */
    onHandleSort() {
        // TBD:
    }

    /**
     * Used for providing filter values for filtering contacts data
     */
    get filterValues() {
        let filterVals = [];
        Object.values(this.filterAttributes).forEach(value => {
            console.log(value.name, value.selectedValue);
            filterVals.push(value.selectedValue);
        });
        return filterVals;
    }

    /**
     * Onchange handle for dropdown filters
     * @param {*} event 
     */
    handleChange(event) {
        console.log('field name', event.target.name);
        const field = String(event.target.name);
        this.filterAttributes[field].selectedValue = String(event.target.value);
    }

    /**
     * Onclick handler for Search button
     */
    doSearch() {
        console.log(this.filterValues);

        // Make a call to getContactData backend method to return data based on filterValues, and sorted by sortBy
        getContactData( {sortBy : this.sortBy, filters: this.filterValues } )
        .then(result => {
            if (result) {
                this.contacts = result;
            }
        });
    }

}